import p2pFactory from './p2pFactory';
export default p2pFactory.getP2PInstance('common');
export const getDBInstance = p2pFactory.getP2PInstance;