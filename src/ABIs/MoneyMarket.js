import { findNetwork } from '../util.js';
let moneyMarket = require('./moneyMarket.json');

export default function MoneyMarket() {
    if (typeof web3 === 'undefined') {
        return;
    }
    const contractSpec = window.web3.eth.contract(moneyMarket);
    var NetworkName = findNetwork(window.web3.version.network);
    var MoneyMarket;
    if (NetworkName === 'Main') {
        MoneyMarket = contractSpec.at("0x0eEe3E3828A45f7601D5F54bF49bB01d1A9dF5ea");
    } else if (NetworkName === 'Rinkeby') {
        MoneyMarket = contractSpec.at("0x5759F246E6b66B654c61Fec7427dc69E693E98fA");
    }
    return MoneyMarket;
}