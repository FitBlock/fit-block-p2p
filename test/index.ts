import { ok, deepEqual } from 'assert';
import fitBlockP2p from '../index';
const config = fitBlockP2p.getConfig()
const testUnit = {
    [Symbol('test.getSelfIp')] : async function() {
       const ipList = fitBlockP2p.getSelfIp();
       for(const ip of ipList) {
        ok(config.invalidIpList.indexOf(ip)===-1, 'test.getSelfIp ip error!')
       }
       ok(ipList.length>=1, 'test.getSelfIp error!')
    },
}


async function run(testUnitList) {
    for(let testUnitValue of testUnitList) {
        for(let testFunc of Object.getOwnPropertySymbols(testUnitValue)) {
            await testUnitValue[testFunc]();
        }
    }
}
(async function() {
    try {
        // await run([runBefore]);
        await run([testUnit]);
    } finally {
        // await run([runAfter]);
    }
})();

