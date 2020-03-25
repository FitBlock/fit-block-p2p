export function getArgs(argsKey):Array<string> {
    let args = []
    const key = `${argsKey}=`
    for(const arg of process.argv) {
        if(arg.indexOf(key)>-1) {
            args = arg.substring(key.length).split(',')
            break;
        }
    }
    return args;
}

export function getOneArg(argsKey):string {
    let args = ''
    const key = `${argsKey}=`
    for(const arg of process.argv) {
        if(arg.indexOf(key)>-1) {
            args = arg.substring(key.length);
            break;
        }
    }
    return args;
}