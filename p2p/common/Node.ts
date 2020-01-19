import blockCore from 'fit-block-core';
import Client from './Client';
import Server from './Server';
import config from './config';
const myStore = blockCore.getStore()
export default class Node {
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

    async joinNode(ip:string):Promise<void> {
        const client = this.getClient()
        await client.conect(ip)
        //todo
        // await client.syncBootstrap()
        // await client.syncBlock()
        // await client.syncTransaction()
    }

    getServer():Server {
        return new Server();
    }

    getClient():Client {
        return new Client();
    }

}