import fitBlockStore from 'fit-block-store'
import fitBlockCore from 'fit-block-core'
const logger = fitBlockCore.getLogger()
async function run() {
    const storeServer = fitBlockStore.getServer();
    await storeServer.listen()
    const myStore = fitBlockCore.getStore()
    for await(const block of await myStore.blockIterator()) {
        const key = await myStore.getBlockDataKey(block);
        logger.log(`clear:${key}`)
        await myStore.del(key)
    }
    await myStore.del(myStore.getGodKey())
    logger.log(`clear:${myStore.getGodKey()}`)
    await storeServer.close()
}
run().catch((err)=>{
    logger.log(err.stack)
})
