import fitBlockP2p from '../index';
import fitBlockStore from 'fit-block-store'
async function run() {
    const storeServer = fitBlockStore.getServer();
    await storeServer.listen();
    console.log(`storeServer start`)
    const p2pServer = fitBlockP2p.getServer();
    await p2pServer.listen();
    console.log(`p2pServer start`)
}

run().catch((err)=>{
    console.log(err.stack)
})