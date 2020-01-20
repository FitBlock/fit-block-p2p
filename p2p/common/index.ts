import NodeBase from '../../types/NodeBase';
import {networkInterfaces} from 'os';
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
        const myBootstrap = await this.loadBootstrap();
        const otherBootstrap = await client.exchangeBootstrap(myBootstrap);
        await this.syncBootstrap(otherBootstrap)
        //todo
        // await this.syncBlock()
        // await this.syncTransaction()
    }

    async syncBootstrap(otherBootstrap:Set<string>):Promise<void> {
        const myBootstrap = await this.loadBootstrap();
        for(const otherIp of otherBootstrap) {
            myBootstrap.add(otherIp)
        }
        await this.keepBootstrap(myBootstrap)
    }

    syncBlock() {

    }
    syncTransaction() {

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