
import config from './config'
import NodeCommom from './index'
import {join as pathJoin} from 'path';
import {
    loadPackageDefinition as grpcLoadPackageDefinition,
    Server as grpcServer,
    ServerCredentials as grpcServerCredentials,
} from 'grpc'
import {loadSync as protoLoaderLoadSync} from '@grpc/proto-loader'
export default class p2pServer {
    server: grpcServer;
    node:NodeCommom;
    constructor(node:NodeCommom) {
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