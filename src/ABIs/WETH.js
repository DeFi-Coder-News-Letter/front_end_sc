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
        WETH = WETHSpec.at("0x06a1cd567e61b7edda49c30d3d32e60f607fd646");////测试用weth_faucet
    } else if (NetworkName === 'Rinkeby') {
        WETH = WETHSpec.at("0xC8b1a5ef2e19937dd6c0f804DF2e3efE9F093B1e");
    }
    return WETH;
}