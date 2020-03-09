export function sleep(time=4):Promise<void> {
    return new Promise((reslove)=>{
        setTimeout(()=>{
            reslove()
        },time)
    });
}
