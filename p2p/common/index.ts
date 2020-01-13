import p2pBase from '../../types/p2pBase';
import {networkInterfaces} from 'os';
import config from './config';
export default class p2pCommom extends p2pBase {
    getConfig() {
        return config;
    }
    async ipIterator(ip:string): Promise<AsyncIterable<string>> {
        return {
            [Symbol.asyncIterator]:()=> {
                return {
                    next:async ()=>{
                        return {value:undefined, done: true}
                    }
                }
            }
        }
    }
    loadBootstrap():Array<string> {
        throw new Error('mothed not implement!')
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
}