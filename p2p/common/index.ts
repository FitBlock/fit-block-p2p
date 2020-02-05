import NodeBase from '../../types/NodeBase';
import {networkInterfaces} from 'os';
import blockCore from 'fit-block-core';
const myStore = blockCore.getStore()
import {ipTool} from './util'
import Client from './Client';
import Server from './Server';
import {getNodeStoreInstance} from './NodeStore';
const myNode = getNodeStoreInstance();
import config from './config';
export default class NodeCommom extends NodeBase {
    getConfig() {
        return config;
    }

    async loadBootstrap():Promise<Set<string>> {
        const bootstrapSet = await myNode.getBootstrapData();
        config.defaultBootstrap.map(ip=>{
            bootstrapSet.add(ipTool.formatIp(ip))
        });
        return bootstrapSet;
    }
    async keepBootstrap(newBootstrap:Set<string>):Promise<boolean> {
        return await myNode.setBootstrapData(newBootstrap);
    }

    async findNode(ip:string):Promise<Set<string>> {
        const nodeSet= new Set<string>(); 
        const ipRange = ipTool.getIpRange(ip,config.findNodeRange);
        await ipTool.eachIpByRange(ip,ipRange,async (ip)=>{
            await this.getClient().conect(ip);
            nodeSet.add(ipTool.formatIp(ip))
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
        if(lastBlock.nextBlockHash==='') {
            lastBlock = blockCore.getPreGodBlock()
        }
        try {
            do {
                const nextBlock = nowStore.getBlockByStr(
                    await client.exchangeBlock(lastBlock.serialize())
                )
                await blockCore.acceptBlock(lastBlock, nextBlock)
                if(nextBlock.nextBlockHash===''){break;}
                nowStore.keepBlockData(lastBlock, nextBlock);
                lastBlock = nextBlock
            } while(true)
        } catch(err) {
            console.warn(err.stack)
        }
        return lastBlock;
    }

    async syncLongestBlock(client:Client) {
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

    async syncTransaction(client:Client) {
        // todo
    }

    getServer():Server {
        return new Server(this);;
    }

    getClient():Client {
        return new Client(this);;
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
        const bootstrapSet = await this.loadBootstrap();
        for(const bootstrap of bootstrapSet) {
            try{
                await this.joinNode(bootstrap)
            } catch(err) {
                console.warn(err.stack)
            }
        }
        const selfIpSet = this.getSelfIp();
        while(true) {
            for(const selfIp of selfIpSet) {
                const nodeIpList = await this.findNode(selfIp);
                for(const nodeIp of nodeIpList) {
                    try{
                        await this.joinNode(nodeIp)
                    } catch(err) {
                        console.warn(err.stack)
                    }
                }
            }
        }
    }
}