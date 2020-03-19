import fitBlockStore from 'fit-block-store'
import fitBlockCore from 'fit-block-core'

async function mining(lastBlock, walletAdress) {
    const myStore = fitBlockCore.getStore()
    const transactionSignList = []
    for await(const transactionSign of await myStore.transactionSignIterator()) {
        transactionSignList.push(transactionSign)
    }
    const nextBlock = await fitBlockCore.mining(lastBlock, walletAdress, transactionSignList);
    if(lastBlock.verifyNextBlock(nextBlock)) {
        await fitBlockCore.keepBlockData(lastBlock, nextBlock)
    }
    return nextBlock;
}

async function run() {
    const n = 3;
    const walletAdress =  fitBlockCore.getWalletAdressByPublicKey(
        fitBlockCore.getPublicKeyByPrivateKey(
            fitBlockCore.genPrivateKeyByString('123456')
        )
    );
    const storeServer = fitBlockStore.getServer();
    await storeServer.listen()
    fitBlockCore.keepGodBlockData(await fitBlockCore.genGodBlock())
    let lastBlock = await fitBlockCore.loadLastBlockData()
    for(let i=0;i<n;i++) {
        lastBlock = await mining(lastBlock, walletAdress)
        console.log(`out block：`,lastBlock)
    }
    await storeServer.close()
}
run().catch((err)=>{
    console.log(err.stack)
})
