
import config from './config'
import NodeCommom from './index'
import {join as pathJoin} from 'path';
import {
    loadPackageDefinition as grpcLoadPackageDefinition,
    Server as grpcServer,
    ServerCredentials as grpcServerCredentials,
} from 'grpc'
import {loadSync as protoLoaderLoadSync} from '@grpc/proto-loader'
import ServerBase from '../../types/ServerBase';
import blockCore from 'fit-block-core';
const myStore = blockCore.getStore()
export default class Server extends ServerBase {
    server: grpcServer;
    node:NodeCommom;
    constructor(node:NodeCommom) {
        super()
        this.node = node;
    }
    async listen():Promise<boolean> {
        const p2pProto = pathJoin(config.appSrcPath,'p2p.proto');
        const packageDefinition = protoLoaderLoadSync(
            p2pProto,
            {keepCase: true,
            longs: String,
            enums: String,
            defaults: true,
            oneofs: true
            });
        const p2p_proto = grpcLoadPackageDefinition(packageDefinition).p2p;
        this.server = new grpcServer();
        this.server.addService(p2p_proto['P2p'].service, {
            ping: (call, callback) => {
                callback(null, {ok: call.request.ok});
            },
            exchangeBootstrap:async (call, callback) => {
                const myBootstrap = await this.node.loadBootstrap();
                const myBootstrapData= [...myBootstrap].map(e=>{ip:e})
                for(const ipObj of call.request.list) {
                    myBootstrap.add(ipObj.ip)
                }
                await this.node.keepBootstrap(myBootstrap)
                callback(null, {list: myBootstrapData});
            },
            exchangeBlock:async (call, callback) => {
                const nextBlock = await myStore.getBlockData(myStore.getBlockByStr(call.request.data))
                callback(null, {data: nextBlock.serialize()});
            },
            exchangeLastBlock:async (call, callback) => {
                const lastBlock =  await myStore.getLastBlockData();
                callback(null, {data: lastBlock.serialize()});
            },
            exchangeTransaction:async (call, callback) => {
                callback(null, {
                    list: [...myStore.transactionSignMap.values()].map((e)=>{
                        return { data: e.serialize() }
                    })
                });
            },
        });
        this.server.bind(`0.0.0.0:${config.port}`, grpcServerCredentials.createInsecure());
        this.server.start();
        return true;
    }
    close():Promise<boolean> {
        return new Promise((reslove,reject)=>{
            this.server.tryShutdown(()=>{
                reslove(true)
            })
        })
        
    }
}