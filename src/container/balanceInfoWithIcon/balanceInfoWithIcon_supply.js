import React, { Component } from 'react';
import MoneyMarket from '../../ABIs/MoneyMarket.js';
import Network from '../../constant.json';
import './balanceInfoWithIcon.scss';
import { findNetwork } from '../../util.js';
import CoinInfoWithIcon from '../../component/coinInfoWithIcon/coinInfoWithIcon';


class BalanceInfoWithIcon extends Component {
  constructor(props) {
    super(props);
    this.state = {
      suppliedwethBalance: 0,
      suppliedusdxBalance: 0,
      borrowedusdxBalance: 0
    }
    this.web3 = window.web3;

    this.componentDidMount_temp();

    if (window.web3.currentProvider.isMetaMask) {
      window.ethereum.on('accountsChanged', () => {
        this.componentDidMount_temp();
      });
    }
  }


  // ************ supplied_usdx_Balance ( USDx supplied )
  getSupplyUSDXAmount = () => {
    if (typeof web3 !== 'undefined' && this.web3.eth.accounts[0] !== undefined && MoneyMarket() !== undefined) {
      let usdxAddress = '';
      let NetworkName = findNetwork(window.web3.version.network);
      if (NetworkName === 'Main') {
        usdxAddress = Network.Main.USDx;
      } else if (NetworkName === 'Rinkeby') {
        usdxAddress = Network.Rinkeby.USDx;
      }
      MoneyMarket().getSupplyBalance(this.web3.eth.accounts[0],
        usdxAddress,
        (err, res) => {
          if (res !== undefined && res !== null) {
            this.setState({ suppliedusdxBalance: this.web3.fromWei(res.toNumber(), "ether") }, () => {
              // console.log(this.state.suppliedusdxBalance);
            });
          }
        }
      );
    }
  }


  componentDidMount_temp = () => {
    setTimeout(() => {
      this.getSupplyUSDXAmount();
    }, 700);
    this.timerID = setInterval(() => {
      if (typeof web3 !== 'undefined' && this.web3.eth.accounts[0] !== undefined) {
        this.getSupplyUSDXAmount();
      }
    }, 1000 * 15);
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  render() {
    const props = {
      coin: this.props.coin,
      action: this.props.action,
      coinBalance: this.state.suppliedusdxBalance,
      login: this.web3.eth.accounts[0]
    }
    return <CoinInfoWithIcon {...props} />
  }
}

export default BalanceInfoWithIcon;