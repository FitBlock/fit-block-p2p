import {getLogger}  from 'log4js'
export const getLoggerInstance = ( ()=> {
    let instance = null;
    return ():Logger=>{
        if(instance) {
            return instance;
        }
        instance = new Logger()
        return instance
    }
})();
type MyLogger = {
    log:Function,
    trace:Function,
    debug:Function,
    info:Function,
    warn:Function,
    error:Function,
}
export default class Logger {
    logger:MyLogger;
    constructor() {
        let isDev = false;
        for(const arg of process.argv) {
            if(arg==='--dev') {
                isDev = true;
                break;
            }
        }
        if(isDev) {
            this.logger = console;
        } else {
            this.logger = getLogger()
        }
    }

    getLogger() {
        return this.logger
    }
}