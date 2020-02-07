import {sep as pathSep} from 'path';
export default {
    invalidIpList:[
        // '::',
        // '::1',
        '0:0:0:0:0:0:0:0',
        '0:0:0:0:0:0:0:1',
        '0.0.0.0',
        '127.0.0.1',
        'localhost',
    ],
    bootstrapKey:'bootstrap:list',
    port:5587,
    maxNodeNumber: 1000,
    maxNodeTimeOut:30 * 1000, //30s
    findNodeRange: 256*256,
    defaultBootstrap:[],
    appSrcPath:__dirname.replace(`fit-block-p2p${pathSep}build`,`fit-block-p2p`)
}