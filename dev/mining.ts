import fitBlockStore from 'fit-block-store'
import fitBlockCore from 'fit-block-core'
import {getArgs,getOneArg} from './command';
const logger = fitBlockCore.getLogger()

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
    let n = 3;
    let isInit = true;
    let countStr = getOneArg('count');
    if(countStr!=='') {
        n = parseInt(countStr)
    }
    let initStr = getOneArg('init');
    if(initStr!=='') {
        try{
            isInit = JSON.parse(initStr)
        } catch(err) {
            return logger.error(`init params error,can't be '${initStr}',only init=true or init=false`)
        }
    }
    console.log(n,isInit)
    const walletAdress =  fitBlockCore.getWalletAdressByPublicKey(
        fitBlockCore.getPublicKeyByPrivateKey(
            fitBlockCore.genPrivateKeyByString('123456')
        )
    );
    const storeServer = fitBlockStore.getServer();
    await storeServer.listen()
    if(isInit) {
        await fitBlockCore.keepGodBlockData(await fitBlockCore.genGodBlock())
    }
    let lastBlock = await fitBlockCore.loadLastBlockData()
    logger.log(`lastBlock：`,lastBlock)
    for(let i=0;i<n;i++) {
        lastBlock = await mining(lastBlock, walletAdress)
        logger.log(`out block：`,lastBlock)
    }
    await storeServer.close()
}
run().catch((err)=>{
    logger.log(err.stack)
})
