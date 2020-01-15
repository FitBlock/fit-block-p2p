import p2pBase from '../../types/p2pBase';
import {networkInterfaces} from 'os';
import config from './config';
import {ipTool} from './util'
export default class p2pCommom extends p2pBase {
    getConfig() {
        return config;
    }
    async ipIterator(ip:string , isReverse= false): Promise<AsyncIterable<string>> {
        const ipData = ipTool.getIpDateByIp(ip);
        const offsetIpByDataFuncName = 
            ipTool.isIpv6(ip)?'offsetIpv6ByData':'offsetIpv4ByData';
        let nextIpData = ipData;
        const offset = isReverse?-1:1;
        return {
            [Symbol.asyncIterator]:()=> {
                return {
                    next:async ()=>{
                        nextIpData = ipTool[offsetIpByDataFuncName](nextIpData, offset);
                        if(nextIpData.length===0) {
                            return {value:undefined, done: true}
                        }
                        return {value:ipTool.getIpByIpDate(nextIpData), done: false}
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