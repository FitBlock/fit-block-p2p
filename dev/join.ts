import fitBlockP2p from '../index';
import fitBlockStore from 'fit-block-store'
import fitBlockCore from 'fit-block-core';
const logger = fitBlockCore.getLogger()
async function run() {
    let ipList = []
    for(const arg of process.argv) {
        const key = 'ip='
        if(arg.indexOf(key)>-1) {
            ipList = arg.substring(key.length).split(',')
            break;
        }
    }
    logger.log(ipList)
    if(ipList.length<=0){
        throw new Error('not add ip argument,expleam ip=192.168.1.10 or ip=192.168.1.10,192.168.1.11')
    }
    const storeServer = fitBlockStore.getServer();
    await storeServer.listen()
    for(const ip of ipList) {
        await fitBlockP2p.joinNode(ip)
    }
}
run().catch((err)=>{
    logger.log(err.stack)
});
