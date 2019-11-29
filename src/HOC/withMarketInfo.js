import React, { Component } from 'react';

import Network from './../constant.json';
import { toDoubleThousands, findNetwork, formatBigNumber } from './../util';



export function withMarketInfo(Header) {
  return class extends Component {
    constructor(props) {
      super(props);
      this.state = {
        USDXPersonalBalance: '-',
        WETHPersonalBalance: '-',
        ETHPersonalBalance: '-',
        ETHToUSD: '-',
        USDxToUSD: 0,
        USDxToUSDUnFormat: 0,
        usdxMarketBalance: 0,
        assets: ['WETH', 'USDx']
      }
      this.web3 = window.web3;

      // this.componentDidMount_temp();
      window.web3.version.getNetwork((e, r) => {
        if (r) {
          this.setState({
            NetworkName: r
          }, () => {
            this.componentDidMount_temp();
          })
        }
      })

      if (window.web3.currentProvider.isMetaMask) {
        window.ethereum.on('accountsChanged', () => {
          this.componentDidMount_temp();
        });
      }
    }

    getAccountETHBalanceByAddress = () => {
      if (typeof web3 === 'undefined' || this.web3.eth.accounts[0] === undefined || !this.props.login) {
        this.setState({ ETHPersonalBalance: '-' });
        return;
      }
      this.web3.eth.getBalance(this.web3.eth.accounts[0], (err, balance) => {
        if (window.ethereum.isImToken !== undefined && window.ethereum.isImToken === true) {
          console.log('===>ethBalance balance:' + balance + ' address:' + this.web3.eth.accounts[0])
        }
        if (balance === undefined || balance === null) {
          return;
        }
        balance = formatBigNumber(balance);
        this.setState({ ETHPersonalBalance: toDoubleThousands(balance) })
      });
    }

    





    componentDidMount_temp = () => {
      setTimeout(() => {
        this.getAccountETHBalanceByAddress();
        this.getAccountUSDXBalanceByAddress();
        this.getAccountWETHBalanceByAddress();

      }, 2000);

      this.timerID = setInterval(() => {
        let NetworkName = window.web3 !== undefined ? findNetwork(this.state.NetworkName) : null;
        if (true && (NetworkName === 'Main' || NetworkName === 'Rinkeby')) {
          this.getAccountETHBalanceByAddress();
          this.getAccountUSDXBalanceByAddress();
          this.getAccountWETHBalanceByAddress();

        }
      }, 1000 * 15);
    }

    componentWillUnmount() {
      clearInterval(this.timerID);
    }

    render() {
      let NetworkName = window.web3 !== undefined ? findNetwork(this.state.NetworkName) : null;
      const marketInfo = {
        USDxBalance: this.state.USDXPersonalBalance,
        ETHBalance: this.state.ETHPersonalBalance,
        WETHBalance: this.state.WETHPersonalBalance,
        ETHToUSD: this.state.ETHToUSD,
        networkName: this.props.networkName,
        account: this.props.account,
        banner: NetworkName === 'Main' ? true : false
      }
      return <Header {...marketInfo} />
    }
  }
}
