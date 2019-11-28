import React, { Component } from 'react';
import MoneyMarket from './../ABIs/MoneyMarket.js';
import Network from './../constant.json';
import { toDoubleThousands, findNetwork, formatBigNumber } from './../util';
import USDX from "./../ABIs/USDX.js";
import WETH from './../ABIs/WETH.js';

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

    getAccountUSDXBalanceByAddress = () => {
      if (typeof web3 === 'undefined' || this.web3.eth.accounts[0] === undefined || USDX() === undefined || !this.props.login) {
        this.setState({ USDXPersonalBalance: '-' })
        return;
      }
      USDX().balanceOf(this.web3.eth.accounts[0],
        (err, res) => {
          if (window.ethereum.isImToken !== undefined && window.ethereum.isImToken === true) {
            console.log('===>usdxBalance res:' + res + ' USDX():' + USDX())
          }
          if (res === undefined || res === null) {
            return;
          }
          let usdxBalance = 0;
          usdxBalance = toDoubleThousands(this.web3.fromWei(res.toNumber(), "ether"));
          this.setState({ USDXPersonalBalance: usdxBalance });
        }
      );

    }

    getAccountWETHBalanceByAddress = () => {
      if (typeof web3 === 'undefined' || this.web3.eth.accounts[0] === undefined || WETH() === undefined || !this.props.login) {
        this.setState({ WETHPersonalBalance: '-' })
        return;
      }
      WETH().balanceOf(this.web3.eth.accounts[0],
        (err, res) => {
          if (window.ethereum.isImToken !== undefined && window.ethereum.isImToken === true) {
            console.log('===>wethBalance res:' + res + ' WETH():' + WETH())
          }
          if (res === undefined || res === null) {
            return;
          }
          let wethBalance = 0;
          wethBalance = toDoubleThousands(this.web3.fromWei(res.toNumber(), "ether"));
          this.setState({ WETHPersonalBalance: wethBalance })
        }
      );
    }

    new_getETHAssetPrices = () => {
      if (typeof web3 === 'undefined' || this.web3.eth.accounts[0] === undefined || MoneyMarket() === undefined) {
        this.setState({ ETHToUSD: '-' })
        return;
      }
      let wethAddress = '';
      let NetworkName = findNetwork(this.state.NetworkName);
      if (NetworkName === 'Main') {
        wethAddress = Network.Main.WETH;
      } else if (NetworkName === 'Rinkeby') {
        wethAddress = Network.Rinkeby.WETH;
      }
      MoneyMarket().assetPrices(wethAddress, (err1, res1) => {
        if (res1 !== undefined || res1 !== null) {
          MoneyMarket().assetPrices(
            Network[NetworkName]['USDx'],
            (err2, res2) => {
              if (res2 !== undefined && res2 !== null) {
                let ETHToUSDBalance = 0;
                if (Number(this.web3.fromWei(res2.toNumber(), "ether")) !== 0) {
                  ETHToUSDBalance = toDoubleThousands(this.web3.fromWei(res1.toNumber(), "ether") / this.web3.fromWei(res2.toNumber(), "ether"));
                }
                this.setState({ ETHToUSD: ETHToUSDBalance }, () => {
                  // console.log(this.state.ETHToUSD);
                });
              }
            }
          );
        }
      });
    }


    componentDidMount_temp = () => {
      setTimeout(() => {
        this.getAccountETHBalanceByAddress();
        this.getAccountUSDXBalanceByAddress();
        this.getAccountWETHBalanceByAddress();
        this.new_getETHAssetPrices();
      }, 2000);

      this.timerID = setInterval(() => {
        let NetworkName = window.web3 !== undefined ? findNetwork(this.state.NetworkName) : null;
        if (true && (NetworkName === 'Main' || NetworkName === 'Rinkeby')) {
          this.getAccountETHBalanceByAddress();
          this.getAccountUSDXBalanceByAddress();
          this.getAccountWETHBalanceByAddress();
          this.new_getETHAssetPrices();
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
