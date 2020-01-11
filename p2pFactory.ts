import p2pBase from './types/p2pBase'
import p2pCommon from './p2p/common'
const instanceMap: Map<String, any> = new Map(); 
export default class p2pFactory {
    static getP2PInstance(name:string) {
        switch(name.toLowerCase()) {
            case 'common':
                return p2pFactory.getP2PByClass<p2pCommon>(p2pCommon);
            default:
                throw new Error('not support p2p.')
        }
    }
    static getP2PByClass<T extends p2pBase>(p2p: new () => T):T {
        if(instanceMap.has(p2p.name)) {
            return instanceMap.get(p2p.name);
        }
        const p2pInstance = new p2p()
        instanceMap.set(p2p.name, p2pInstance)
        return p2pInstance;
    }
}