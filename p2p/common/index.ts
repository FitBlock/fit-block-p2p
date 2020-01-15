import p2pBase from '../../types/p2pBase';
import {networkInterfaces} from 'os';
import config from './config';
import {ipTool} from './util'
export default class p2pCommom extends p2pBase {
    getConfig() {
        return config;
    }
    async ipIterator(ip:string): Promise<AsyncIterable<string>> {
        const ipData = ipTool.getIpDateByIp(ip);
        const offsetIpByDataFuncName = 
            ipTool.isIpv6(ip)?'offsetIpv6ByData':'offsetIpv4ByData';
        let offset = 1;
        let direct = true;
        let addOver = false;
        let subOver = false;
        const nextFunc = async ()=>{
            let nextIpData:Array<number>;
            if(direct) {
                nextIpData = ipTool[offsetIpByDataFuncName](ipData, offset);
                if(nextIpData.length===0){addOver=true;}
            } else {
                nextIpData = ipTool[offsetIpByDataFuncName](ipData, -offset);
                if(nextIpData.length===0){subOver=true;}
                if(addOver===false && subOver===false) {
                    offset++;
                }
            }
            if(
                (addOver && (!direct)) ||
                (subOver && direct)
            ) {
                offset++
            }
            direct=!direct;
            if(addOver===true) {
                direct=false
            }
            if(subOver===true) {
                direct=true
            }
            let done = addOver && subOver;
            if(done) {
                return {value:undefined, done: true}
            }
            if(nextIpData.length===0) {
                return await nextFunc();
            }
            return {value:ipTool.getIpByIpDate(nextIpData), done: false}
        }
        return {
            [Symbol.asyncIterator]:()=> {
                return {
                    next:nextFunc
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