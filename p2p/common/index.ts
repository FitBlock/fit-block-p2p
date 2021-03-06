import NodeBase from '../../types/NodeBase';
import {networkInterfaces} from 'os';
import blockCore from 'fit-block-core';
const myStore = blockCore.getStore()
import {getIpToolInstance} from './IpTool'
const ipTool = getIpToolInstance();
const logger = blockCore.getLogger()
import Client from './Client';
import Server from './Server';
import config from './config';
// import { sleep } from './util';
export default class NodeCommom extends NodeBase {
    getConfig() {
        return config;
    }

    getBootstrapKey(): string {
        return config.bootstrapKey;
    }

    async setBootstrapData(bootstrapSet:Set<string>):Promise<boolean> {
        for(const invalidIp of config.invalidIpList) {
            if(bootstrapSet.has(invalidIp)) {
                bootstrapSet.delete(invalidIp)
            }
        }
        return await myStore.put(this.getBootstrapKey(), JSON.stringify([...bootstrapSet]))
    }

    async getBootstrapData():Promise<Set<string>> {
        try{
            return new Set(JSON.parse(await myStore.get(this.getBootstrapKey())))
        } catch(err) {
            logger.warn(err)
            await myStore.put(this.getBootstrapKey(), JSON.stringify([]))
            return new Set()
        }
    }

    async loadBootstrap():Promise<Set<string>> {
        const bootstrapSet = await this.getBootstrapData();
        config.defaultBootstrap.map(ip=>{
            bootstrapSet.add(ipTool.formatIp(ip))
        });
        return bootstrapSet;
    }
    async keepBootstrap(newBootstrap:Set<string>):Promise<boolean> {
        return await this.setBootstrapData(newBootstrap);
    }

    async findNode(ip:string):Promise<Set<string>> {
        const nodeSet= new Set<string>(); 
        const ipRange = ipTool.getIpRange(ip,config.findNodeRange);
        const client = this.getClient()
        await ipTool.eachIpByRange(ip,ipRange,async (ip)=>{
            try{
                await client.conect(ip);
                await client.ping();
                nodeSet.add(ipTool.formatIp(ip))
            } catch(err) {
                logger.warn(err.stack)
            }    
        })
        return nodeSet;
    }
    
    async joinNode(ip:string):Promise<void>{
        const client = this.getClient()
        await client.conect(ip)
        await this.syncBootstrap(client)
        await this.syncBlock(client,myStore)
        await this.syncLongestBlock(client)
        await this.syncTransaction(client)
    }

    async syncBootstrap(client:Client):Promise<void> {
        const myBootstrap = await this.loadBootstrap();
        const otherBootstrap = await client.exchangeBootstrap(myBootstrap);
        for(const otherIp of otherBootstrap) {
            myBootstrap.add(otherIp)
        }
        await this.keepBootstrap(myBootstrap)
    }

    async syncBlock(client:Client,nowStore) {
        let lastBlock = await blockCore.loadLastBlockData();
        if(lastBlock.nextBlockHash==='' || lastBlock.nextBlockHash===undefined) {
            lastBlock = blockCore.getPreGodBlock()
        }
        let nextBlock = blockCore.getPreGodBlock()
        let i=1;
        try {
            do {
                nextBlock = nowStore.getBlockByStr(
                    await client.exchangeBlock(lastBlock.serialize())
                )
                await blockCore.acceptBlock(lastBlock, nextBlock)
                if(nextBlock.nextBlockHash===''){break;}
                nowStore.keepBlockData(lastBlock, nextBlock);
                logger.warn(`${i}:preBlock,lastBlock:${lastBlock.serialize()}`)
                logger.warn(`${i}:nextBlock:${nextBlock.serialize()}`)
                lastBlock = nextBlock
                i++;
            } while(true)
        } catch(err) {
            logger.warn(`error:preBlock,lastBlock:${lastBlock.serialize()}`)
            logger.warn(`error:nextBlock:${nextBlock.serialize()}`)
            logger.warn(err.stack)
        }
        return lastBlock;
    }

    async syncLongestBlock(client:Client):Promise<string> {
         // 查看尾链是否一致，不一致取最长链
         let lastBlock = await blockCore.loadLastBlockData();
         const lastSdieBlock = myStore.getBlockByStr(
            await client.exchangeLastBlock()
        )
        const nowVersion = await myStore.getVersion()
        if(lastBlock.height>=lastSdieBlock.height){return nowVersion;}
        const tmpVersion = myStore.genVersion();
        const tmpStore = blockCore.getStore(tmpVersion);
        const newVersionLastBlock = await this.syncBlock(client,tmpStore)
        lastBlock = await blockCore.loadLastBlockData();
        if(lastBlock.height<=newVersionLastBlock.height){return nowVersion;}
        // 由于新版本链大于了老版本链，所以区块链变更
        await myStore.setVersion(tmpVersion)
        return tmpVersion;
    }

    async syncTransaction(client:Client):Promise<boolean> {
        if(
            await myStore.getTransactionSignMapSize()>=
            blockCore.getConfig().maxBlockTransactionSize
        ) {
            return false
        }
        const transactionSignDataList = await client.exchangeTransaction();
        for(const transactionSignData of transactionSignDataList) {
            let transactionSign = myStore.getTransactionSignByStr(transactionSignData);
            try{
                transactionSign = await blockCore.acceptTransaction(transactionSign)
            } catch(err) {
                logger.warn(err)
                continue;
            }
            myStore.keepTransactionSignData(transactionSign)
        }
        return true;
    }

    getServer():Server {
        return new Server(this);
    }

    getClient():Client {
        return new Client();
    }

    getSelfIp():Set<string> {
        const networkData = networkInterfaces();
        const ipSet = new Set<string>(); 
        for(const networkCard of Object.values(networkData)) {
            for(const networkCardData of networkCard) {
                const formatAddress = ipTool.formatIp(networkCardData.address);
                if(config.invalidIpList.indexOf(formatAddress)===-1) {
                    ipSet.add(formatAddress)
                }
            }
        }
        return ipSet;
    }

    async run():Promise<void> {
        const server = this.getServer();
        await server.listen();
        while(true) {
            const bootstrapSet = await this.loadBootstrap();
            for(const bootstrap of bootstrapSet) {
                // await sleep(100)
                try{
                    await this.joinNode(bootstrap)
                } catch(err) {
                    logger.warn(err.stack)
                }
            }
            
            const selfIpSet = this.getSelfIp();
            for(const selfIp of selfIpSet) {
                // await sleep(100)
                const nodeIpList = await this.findNode(selfIp);
                for(const nodeIp of nodeIpList) {
                    try{
                        await this.joinNode(nodeIp)
                    } catch(err) {
                        logger.warn(err.stack)
                    }
                }
            }
        }
    }
}