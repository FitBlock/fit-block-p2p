import config from './config'
import NodeCommom from './index'
import {join as pathJoin} from 'path';
import {
    loadPackageDefinition as grpcLoadPackageDefinition,
    credentials
} from 'grpc'
import {loadSync as protoLoaderLoadSync} from '@grpc/proto-loader'
export default class p2pClient {
    client: any;
    node:NodeCommom;
    constructor(node:NodeCommom) {
        this.node = node;
    }
    ping():Promise<boolean> {
        return new Promise((resolve,reject)=>{
            this.client.ping({ok: true}, (err, response)=> {
                if(err){return reject(err)}
                return resolve(response.ok);
            });
        })
    }
    async exchangeBootstrap(bootstrap:Set<string>):Promise<Set<string>> {
        return new Promise((resolve,reject)=>{
            const ipList = []
            for(const ip of bootstrap) {ipList.push({ip});}
            this.client.exchangeBootstrap({list: ipList}, (err, response)=> {
                if(err){return reject(err)}
                const newBootstrap = new Set<string>();
                for(const ipObj of response.list) {
                    newBootstrap.add(ipObj.ip)
                }
                return resolve(newBootstrap);
            });
        })
    }
    exchangeBlock():Promise<boolean> {
        throw new Error('method not implement')
    }
    exchangeTransaction():Promise<boolean> {
        throw new Error('method not implement')
    }
    async isConect(): Promise<boolean> {
        return Boolean(this.client)
    }
    async conect(ip:string): Promise<boolean> {
        const p2pProto = pathJoin(config.appSrcPath,'p2p.proto');;
        const packageDefinition = protoLoaderLoadSync(
            p2pProto,
            {keepCase: true,
            longs: String,
            enums: String,
            defaults: true,
            oneofs: true
            });
        const p2p_proto = grpcLoadPackageDefinition(packageDefinition).p2p;
        this.client = new p2p_proto['P2p'](
            `${ip}:${config.port}`,
            credentials.createInsecure()
        );
        return true;
    }
    close():Promise<boolean> {
        return new Promise((reslove,reject)=>{
            return reslove(true);
        })
    }
}