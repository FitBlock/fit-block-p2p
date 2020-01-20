import NodeBase from './types/NodeBase'
import NodeCommon from './p2p/common'
const instanceMap: Map<String, any> = new Map(); 
export default class p2pFactory {
    static getP2PInstance(name:string) {
        switch(name.toLowerCase()) {
            case 'common':
                return p2pFactory.getP2PByClass<NodeCommon>(NodeCommon);
            default:
                throw new Error('not support p2pNode.')
        }
    }
    static getP2PByClass<T extends NodeBase>(p2pNode: new () => T):T {
        if(instanceMap.has(p2pNode.name)) {
            return instanceMap.get(p2pNode.name);
        }
        const p2pNodeInstance = new p2pNode()
        instanceMap.set(p2pNode.name, p2pNodeInstance)
        return p2pNodeInstance;
    }
}