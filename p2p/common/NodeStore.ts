import blockCore from 'fit-block-core';
import config from './config';
const myStore = blockCore.getStore()
export const getNodeStoreInstance = ( ()=> {
    let instance = null;
    return ():NodeStore=>{
        if(instance) {
            return instance;
        }
        instance = new NodeStore()
        return instance
    }
})();
export default class NodeStore {
    getBootstrapKey(): string {
        return `bootstrap:list`;
    }

    async setBootstrapData(bootstrapSet:Set<string>):Promise<boolean> {
        for(const invalidIp of config.invalidIpList) {
            if(bootstrapSet.has(invalidIp)) {
                bootstrapSet.delete(invalidIp)
            }
        }
        return await myStore.put(this.getBootstrapKey(), JSON.stringify([...bootstrapSet]))
    }

    async getBootstrapData():Promise<Set<string>> {
        return new Set(JSON.parse(await myStore.get(this.getBootstrapKey())))
    }
}