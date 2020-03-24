import fitBlockP2p from '../index';
import fitBlockStore from 'fit-block-store'
import fitBlockCore from 'fit-block-core';
const logger = fitBlockCore.getLogger()
async function run() {
    const storeServer = fitBlockStore.getServer();
    await storeServer.listen()
    await fitBlockP2p.run()
}
run().catch((err)=>{
    logger.log(err.stack)
});

