import IpToolBase from '../../types/IpToolBase';
export const getIpToolInstance = ( ()=> {
    let instance = null;
    return ():IpTool=>{
        if(instance) {
            return instance;
        }
        instance = new IpTool()
        return instance
    }
})();
export default class IpTool extends IpToolBase {}