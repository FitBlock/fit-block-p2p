import ipParse from 'ip-parse';
class IpTool {
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
    
    getIpByIpDate(ipData:Array<number>):string {
        if(ipData.length===8) {
            return ipData.map(e=>e.toString(16)).join(':');
        }
        return ipData.join('.');
    }
    
    getNumberListByRedix(numList:Array<number>, redix:number):Array<number> {
        for(let i=numList.length-1;i>=0;i--) {
            if(numList[i]>redix || numList[i]<0) {
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
        return this.getNumberListByRedix(nextIpData, (2**8)-1);
    }
    
    offsetIpv6ByData(ipData:Array<number>,offest:number):Array<number> {
        const nextIpData = [...ipData];
        nextIpData[nextIpData.length-1]+=offest;
        return this.getNumberListByRedix(nextIpData, (2**16)-1);
    }
}
export const ipTool =  new IpTool();
