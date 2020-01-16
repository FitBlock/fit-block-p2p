import p2pBase from '../../types/p2pBase';
import {networkInterfaces} from 'os';
import {ipTool} from './util'
import Client from './Client';
import Server from './Server';
import config from './config';
export default class p2pCommom extends p2pBase {
    getConfig() {
        return config;
    }

    loadBootstrap():Array<string> {
        throw new Error('mothed not implement!')
    }

    async ipIterator(ip:string , isReverse= false) {
        return await ipTool.ipIterator(ip, isReverse);
    }

    async findNode(ip:string):Promise<Array<string>> {
        const nodeList=[];
        const ipRange = ipTool.getIpRange(ip,config.findNodeRange);
        await ipTool.eachIpByRange(ip,ipRange,async (ip)=>{
            // to do
            // this.pingNode()
            nodeList.push(ip)
        })
        return nodeList;
    }
    
    async joinNode(ip:string):Promise<void>{
        throw new Error('mothed not implement!')
    }

    getServer():Server {
        return new Server();
    }

    getClient():Client {
        return new Client();
    }

    getSelfIp():Array<string> {
        const networkData = networkInterfaces();
        const ipList = []; 
        for(const networkCard of Object.values(networkData)) {
            for(const networkCardData of networkCard) {
                if(config.invalidIpList.indexOf(networkCardData.address)===-1) {
                    ipList.push(networkCardData.address)
                }
            }
        }
        return ipList;
    }

    async run():Promise<void> {
        const server = this.getServer();
        await server.listen();
        const bootstrapList = this.loadBootstrap();
        for(const bootstrap of bootstrapList) {
            await this.joinNode(bootstrap)
        }
        const selfIpList = this.getSelfIp();
        while(true) {
            for(const selfIp of selfIpList) {

            }
        }
    }
}