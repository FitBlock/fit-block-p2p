import p2pBase from '../../types/p2pBase';
import {networkInterfaces} from 'os';
import {ipTool} from './util'
import Client from './Client';
import Server from './Server';
import Node from './Node';
const myNode = new Node();
import config from './config';
export default class p2pCommom extends p2pBase {
    getConfig() {
        return config;
    }

    async loadBootstrap():Promise<Set<string>> {
        const bootstrapSet = await myNode.getBootstrapData();
        config.defaultBootstrap.map(e=>{bootstrapSet.add(e)});
        return bootstrapSet;
    }

    async ipIterator(ip:string , isReverse= false) {
        return await ipTool.ipIterator(ip, isReverse);
    }

    async findNode(ip:string):Promise<Set<string>> {
        const nodeSet= new Set<string>(); 
        const ipRange = ipTool.getIpRange(ip,config.findNodeRange);
        await ipTool.eachIpByRange(ip,ipRange,async (ip)=>{
            await this.getClient().conect(ip);
            nodeSet.add(ip)
        })
        return nodeSet;
    }
    
    async joinNode(ip:string):Promise<void>{
        await myNode.joinNode(ip)
    }

    getServer():Server {
        return myNode.getServer();
    }

    getClient():Client {
        return myNode.getClient();
    }

    getSelfIp():Set<string> {
        const networkData = networkInterfaces();
        const ipSet = new Set<string>(); 
        for(const networkCard of Object.values(networkData)) {
            for(const networkCardData of networkCard) {
                if(config.invalidIpList.indexOf(networkCardData.address)===-1) {
                    ipSet.add(networkCardData.address)
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