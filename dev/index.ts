import fitBlockP2p from '../index';
import fitBlockStore from 'fit-block-store'
async function run() {
    const storeServer = fitBlockStore.getServer();
    await storeServer.listen()
    await fitBlockP2p.run()
}
run();
