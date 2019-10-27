import { findNetwork } from '../util.js';
let usdx = require('./USDX_FAUCET_ABI.json');

export default function USDX() {
    if (typeof web3 === 'undefined') {
        return;
    }
    const usdxSpec = window.web3.eth.contract(usdx);
    let NetworkName = findNetwork(window.web3.version.network);
    var USDX;
    if (NetworkName === 'Main') {
        USDX = usdxSpec.at("0xeb269732ab75a6fd61ea60b06fe994cd32a83549");
    } else if (NetworkName === 'Rinkeby') {
        USDX = usdxSpec.at("0xaf21bb8ae7b7a5eec37964e478583cd486fd12e2");
    }
    return USDX;
}