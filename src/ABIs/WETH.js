import { findNetwork } from '../util.js';
// let weth = require('./WETH_FAUCET_ABI.json');//测试用weth_faucet weth测试网修改的地方
// let weth = require('./WETH_ABI.json');

export default function WETH() {
    if (typeof web3 === 'undefined') {
        return;
    }
    let NetworkName = findNetwork(window.web3.version.network);
    let weth;
    weth = require('./WETH_ABI.json')
    //测试用weth_faucet weth测试网修改的地方
    // if(NetworkName === 'Rinkeby') {
    //     weth = require('./WETH_ABI.json')
    // } else if (NetworkName === 'Main') {
    //     weth = require('./WETH_FAUCET_ABI.json');
    // }
    const WETHSpec = window.web3.eth.contract(weth);
    
    var WETH;
    if (NetworkName === 'Main') {
        // WETH = WETHSpec.at("0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2");
        WETH = WETHSpec.at("0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2");////测试用weth_faucet
    } else if (NetworkName === 'Rinkeby') {
        WETH = WETHSpec.at("0xC8b1a5ef2e19937dd6c0f804DF2e3efE9F093B1e");
    }
    return WETH;
}