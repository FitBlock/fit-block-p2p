import blockCore from 'fit-block-core';
const myStore = blockCore.getStore()
export default class Node {
    getBootstrapKey(): string {
        return `bootstrap:list`;
    }

    async setBootstrapData(bootstrapList:Array<string>):Promise<boolean> {
        return await myStore.put(this.getBootstrapKey(), JSON.stringify(bootstrapList))
    }

    async getBootstrapData():Promise<Array<string>> {
        return JSON.parse(await myStore.get(this.getBootstrapKey()))
    }

}