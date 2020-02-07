export default abstract class ClientBase {
    client: any;
    abstract ping():Promise<boolean>;
    abstract exchangeBootstrap(bootstrap:Set<string>):Promise<Set<string>>;
    abstract exchangeBlock(blockData:string):Promise<string>;
    abstract exchangeLastBlock():Promise<string>;
    abstract exchangeTransaction():Promise<Array<string>>;
    abstract async isConect(): Promise<boolean>;
    abstract async conect(ip:string): Promise<boolean>;
    abstract close():Promise<boolean>;
}