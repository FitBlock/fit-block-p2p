import ipParse from 'ip-parse';
const config = {
    minIpv4:'0.0.0.0',
    minIpv6:'0:0:0:0:0:0:0:0',
    maxIpv4:'255.255.255.255',
    maxIpv6:'ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff',
}
export default abstract class IpToolBase {
    isIpv4(ip:string):boolean {
        return ipParse.isIpv4(ip);
    }

    isIpv6(ip:string):boolean {
        return ipParse.isIpv6(ip);
    }
    
    getIpDateByIp(ip:string):Array<number> {
        const ipDataStr = ipParse.parseIp(ip);
        if(ipDataStr.length===8) {
            return ipDataStr.map(e=>parseInt(`0x${e}`));
        }
        return ipDataStr.map(e=>parseInt(e));
    }

    formatIp(ip:string):string {
        return this.getIpByIpDate(this.getIpDateByIp(ip))
    }
    
    getIpByIpDate(ipData:Array<number>):string {
        if(ipData.length===8) {
            return ipData.map(e=>e.toString(16)).join(':');
        }
        return ipData.join('.');
    }
    
    getNumberListByRedix(numList:Array<number>, redix:number):Array<number> {
        for(let i=numList.length-1;i>=0;i--) {
            if(numList[i]>=redix || numList[i]<0) {
                const nextAdd = Math.floor(numList[i]/redix);
                numList[i] -= (nextAdd*redix);
                if(i<=0){return [];}
                numList[i-1] += nextAdd;
            }
        }
        return numList;
    }
    
    offsetIpv4ByData(ipData:Array<number>,offest:number):Array<number> {
        const nextIpData = [...ipData];
        nextIpData[nextIpData.length-1]+=offest;
        return this.getNumberListByRedix(nextIpData, 2**8);
    }
    
    offsetIpv6ByData(ipData:Array<number>,offest:number):Array<number> {
        const nextIpData = [...ipData];
        nextIpData[nextIpData.length-1]+=offest;
        return this.getNumberListByRedix(nextIpData, 2**16);
    }

    getOffsetIpByDataFuncName(ip:string):string {
        return this.isIpv6(ip)?'offsetIpv6ByData':'offsetIpv4ByData';
    }

    isIpEqual(ip:string,otherIp:string):boolean {
        return ipParse.parseIp(ip).join(',') === ipParse.parseIp(otherIp).join(',')
    }

    getIpRange(ip:string, offset:number):Array<string> {
        let minIp = this.isIpv6(ip)?config.minIpv6:config.minIpv4;
        let maxIp = this.isIpv6(ip)?config.maxIpv6:config.maxIpv4;
        const ipData = this.getIpDateByIp(ip);
        const offsetIpByDataFuncName = this.getOffsetIpByDataFuncName(ip);
        const minIpData = this[offsetIpByDataFuncName](ipData, -offset);
        const maxIpData = this[offsetIpByDataFuncName](ipData, offset);
        if(minIpData.length!==0) {
            minIp = this.getIpByIpDate(minIpData)
        }
        if(maxIpData.length!==0) {
            maxIp = this.getIpByIpDate(maxIpData)
        }
        return [minIp,maxIp]
    }

    async eachIpByRange(ip:string,ipRange:Array<string>,callback:(ip:string)=>Promise<void>) {
        const ipIterator = await this.ipIterator(ip);
        const ipIteratorReverse = await this.ipIterator(ip, true);
        const ipIteratorFunc = async ()=>{
            for await (const ipValue of ipIterator) {
                await callback(ipValue);
                if(this.isIpEqual(ipValue,ipRange[1])){break;}
            }
        }
        const ipIteratorReverseFunc = async ()=>{
            for await (const ipValue of ipIteratorReverse) {
                await callback(ipValue);
                if(this.isIpEqual(ipValue,ipRange[0])){break;}
            }
        }
        await Promise.all([ipIteratorFunc(),ipIteratorReverseFunc()])
    }

    async ipIterator(ip:string , isReverse= false): Promise<AsyncIterable<string>> {
        const ipData = this.getIpDateByIp(ip);
        const offsetIpByDataFuncName = this.getOffsetIpByDataFuncName(ip);
        let nextIpData = ipData;
        const offset = isReverse?-1:1;
        return {
            [Symbol.asyncIterator]:()=> {
                return {
                    next:async ()=>{
                        nextIpData = this[offsetIpByDataFuncName](nextIpData, offset);
                        if(nextIpData.length===0) {
                            return {value:undefined, done: true}
                        }
                        return {value:this.getIpByIpDate(nextIpData), done: false}
                    }
                }
            }
        }
    }
}
