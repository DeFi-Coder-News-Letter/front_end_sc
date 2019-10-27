let df = require('./DF.json');

export default function DF() {
    const dfSpec = window.web3.eth.contract(df);
    const DF = dfSpec.at("0x862868346954F1f2e65d3Cc75e243c9FAe8759D7");

    return DF;
}