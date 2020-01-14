import ipParse from 'ip-parse'
export function isIpv6(ip:string):boolean {
    return ipParse.isIpv6(ip);
}

export function getIpDateByIp(ip:string):Array<number> {
    const ipDataStr = ipParse.parseIp(ip);
    if(ipDataStr.length===8) {
        return ipDataStr.map(e=>parseInt(`0x${e}`));
    }
    return ipDataStr.map(e=>parseInt(e));
}

export function getIpByIpDate(ipData:Array<number>):string {
    if(ipData.length===8) {
        return ipData.map(e=>e.toString(16)).join(':');
    }
    return ipData.join('.');
}


export function offsetIpv4ByData(ipData:Array<number>,offest:number) {
    throw new Error('mothed not implement!')
}

export function offsetIpv6ByData(ipData:Array<number>,offest:number) {
    throw new Error('mothed not implement!')
}