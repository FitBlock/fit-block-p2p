import fitBlockP2p from '../index';
import fitBlockStore from 'fit-block-store'
import fitBlockCore from 'fit-block-core'
const logger = fitBlockCore.getLogger()
async function run() {
    const storeServer = fitBlockStore.getServer();
    await storeServer.listen();
    process.stdout.write(`storeServer start\n`)
    const p2pServer = fitBlockP2p.getServer();
    await p2pServer.listen();
    process.stdout.write(`p2pServer start\n`)
}

run().catch((err)=>{
    logger.log(err.stack)
})