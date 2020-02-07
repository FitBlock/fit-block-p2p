import ClientBase from './ClientBase';
import ServerBase from './ServerBase';
export default abstract class NodeBase {
    abstract getConfig();

    abstract getBootstrapKey(): string;

    abstract async setBootstrapData(bootstrapSet:Set<string>):Promise<boolean>;

    abstract async getBootstrapData():Promise<Set<string>>;

    abstract async loadBootstrap():Promise<Set<string>>;
    abstract async keepBootstrap(newBootstrap:Set<string>):Promise<boolean>;

    abstract async findNode(ip:string):Promise<Set<string>>;
    
    abstract async joinNode(ip:string):Promise<void>;

    abstract async syncBootstrap(client:ClientBase):Promise<void>;

    abstract async syncBlock(client:ClientBase,nowStore);

    abstract async syncLongestBlock(client:ClientBase):Promise<string>;

    abstract async syncTransaction(client:ClientBase):Promise<boolean>;

    abstract getServer():ServerBase;

    abstract getClient():ClientBase;

    abstract getSelfIp():Set<string>;

    abstract async run():Promise<void>;
}