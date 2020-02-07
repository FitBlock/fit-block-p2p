export default abstract class ServerBase {
    server: any;
    abstract async listen():Promise<boolean>;
    abstract close():Promise<boolean>;
}