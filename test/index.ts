import { ok, equal, deepEqual } from 'assert';
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
    [Symbol('test.ipIterator')] : async function() {
        const ipv4Iterator = await fitBlockP2p.ipIterator('255.255.255.250');
        const ipv4Iterator2 = await fitBlockP2p.ipIterator('255.255.254.255');
        const ipv4Iterator3 = await fitBlockP2p.ipIterator('255.254.255.255');
        const ipv4IteratorReverse = await fitBlockP2p.ipIterator('0.0.0.5', true);
        const ipv4IteratorReverse2 = await fitBlockP2p.ipIterator('0.0.1.0', true);
        const ipv4IteratorReverse3 = await fitBlockP2p.ipIterator('0.1.0.0', true);
        const ipv6Iterator = await fitBlockP2p.ipIterator('ffff:ffff:ffff:ffff:ffff:ffff:ffff:fffa');
        const ipv6Iterator2 = await fitBlockP2p.ipIterator('ffff:ffff:ffff:ffff:ffff:ffff:fffe:ffff');
        const ipv6Iterator3 = await fitBlockP2p.ipIterator('ffff:ffff:ffff:ffff:ffff:fffe:ffff:ffff');
        const ipv6IteratorReverse = await fitBlockP2p.ipIterator('::5', true);
        const ipv6IteratorReverse2 = await fitBlockP2p.ipIterator('::1:0', true);
        const ipv6IteratorReverse3 = await fitBlockP2p.ipIterator('::1:0:0', true);
        async function ipv4Test() {
            const ipList = []
            for await(const ip of ipv4Iterator) {
                ipList.push(ip)
            }
            deepEqual(ipList,[
                '255.255.255.251',
                '255.255.255.252',
                '255.255.255.253',
                '255.255.255.254',
                '255.255.255.255',
            ],'test.ipIterator ipv4Test error!')
            for await(const ip of ipv4Iterator2) {
                equal(ip, '255.255.255.0','test.ipIterator ipv4Test2 error!');
                break;
            }
            for await(const ip of ipv4Iterator3) {
                equal(ip, '255.255.0.0','test.ipIterator ipv4Test3 error!');
                break;
            }
        }
        async function ipv4TestReverse() {
            const ipList = []
            for await(const ip of ipv4IteratorReverse) {
                ipList.push(ip)
            }
            deepEqual(ipList,[
                '0.0.0.4',
                '0.0.0.3',
                '0.0.0.2',
                '0.0.0.1',
                '0.0.0.0',
            ],'test.ipIterator ipv4TestReverse error!')
            for await(const ip of ipv4IteratorReverse2) {
                equal(ip, '0.0.0.255','test.ipv4TestReverse ipv4TestReverse2 error!');
                break;
            }
            for await(const ip of ipv4IteratorReverse3) {
                equal(ip, '0.0.255.255','test.ipv4TestReverse ipv4TestReverse3 error!');
                break;
            }
        }
        async function ipv6Test() {
            const ipList = []
            for await(const ip of ipv6Iterator) {
                ipList.push(ip)
            }
            deepEqual(ipList,[
                'ffff:ffff:ffff:ffff:ffff:ffff:ffff:fffb',
                'ffff:ffff:ffff:ffff:ffff:ffff:ffff:fffc',
                'ffff:ffff:ffff:ffff:ffff:ffff:ffff:fffd',
                'ffff:ffff:ffff:ffff:ffff:ffff:ffff:fffe',
                'ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff',
            ],'test.ipIterator ipv6Test error!')
            for await(const ip of ipv6Iterator2) {
                equal(ip, 'ffff:ffff:ffff:ffff:ffff:ffff:ffff:0','test.ipIterator ipv6Test2 error!');
                break;
            }
            for await(const ip of ipv6Iterator3) {
                equal(ip, 'ffff:ffff:ffff:ffff:ffff:ffff:0:0','test.ipIterator ipv6Test3 error!');
                break;
            }
        }
        async function ipv6TestReverse() {
            const ipList = []
            for await(const ip of ipv6IteratorReverse) {
                ipList.push(ip)
            }
            deepEqual(ipList,[
                '0:0:0:0:0:0:0:4',
                '0:0:0:0:0:0:0:3',
                '0:0:0:0:0:0:0:2',
                '0:0:0:0:0:0:0:1',
                '0:0:0:0:0:0:0:0',
            ],'test.ipIterator ipv6TestReverse error!')
            for await(const ip of ipv6IteratorReverse2) {
                equal(ip, '0:0:0:0:0:0:0:ffff','test.ipIterator ipv6TestReverse2 error!');
                break;
            }
            for await(const ip of ipv6IteratorReverse3) {
                equal(ip, '0:0:0:0:0:0:ffff:ffff','test.ipIterator ipv6TestReverse3 error!');
                break;
            }
        }
        

        await Promise.all([
            ipv4Test(),ipv4TestReverse(),
            ipv6Test(),ipv6TestReverse()
        ]);
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

