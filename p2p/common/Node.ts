import blockCore from 'fit-block-core';
import Client from './Client';
import Server from './Server';
const myStore = blockCore.getStore()
export default class Node {
    getBootstrapKey(): string {
        return `bootstrap:list`;
    }

    async setBootstrapData(bootstrapList:Set<string>):Promise<boolean> {
        return await myStore.put(this.getBootstrapKey(), JSON.stringify([...bootstrapList]))
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