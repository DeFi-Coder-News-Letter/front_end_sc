import { findNetwork } from '../util.js';
let moneyMarket = require('./moneyMarket.json');

export default function MoneyMarket() {
    if (typeof web3 === 'undefined') {
        return;
    }
    const contractSpec = window.web3.eth.contract(moneyMarket);
    // window.web3.version.getNetwork((e, r) => {
    //     if (r) {
    //         let NetworkName = findNetwork(r);
    //         var MoneyMarket;
    //         if (NetworkName === 'Main') {
    //             MoneyMarket = contractSpec.at("0xeda3849869fd560b49dab8c110be3a020f46c79e");
    //         } else if (NetworkName === 'Rinkeby') {
    //             MoneyMarket = contractSpec.at("0x5759F246E6b66B654c61Fec7427dc69E693E98fA");
    //         }
    //     }
    // })
    let NetworkName = findNetwork(window.web3.version.network);
    var MoneyMarket;
    if (NetworkName === 'Main') {
        MoneyMarket = contractSpec.at("0xeda3849869fd560b49dab8c110be3a020f46c79e");
    } else if (NetworkName === 'Rinkeby') {
        MoneyMarket = contractSpec.at("0x5759F246E6b66B654c61Fec7427dc69E693E98fA");
    }
    return MoneyMarket;
}