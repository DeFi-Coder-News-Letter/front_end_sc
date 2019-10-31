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

  get_Borrow_Balance = () => {
    if (typeof web3 !== 'undefined' && this.web3.eth.accounts[0] !== undefined && MoneyMarket() !== undefined) {
      let usdxAddress = '';
      let NetworkName = findNetwork(window.web3.version.network);
      if (NetworkName === 'Main') {
        usdxAddress = Network.Main.USDx;
      } else if (NetworkName === 'Rinkeby') {
        usdxAddress = Network.Rinkeby.USDx;
      }
      MoneyMarket().getBorrowBalance(this.web3.eth.accounts[0], usdxAddress, (err, res) => {
        if (res !== undefined && res !== null) {
          this.setState({ borrowedusdxBalance: this.web3.fromWei(res.toNumber(), "ether") }, () => {
            // console.log(this.state.borrowedusdxBalance);
          });
        }
      });
    }
  };

  componentDidMount_temp = () => {
    setTimeout(() => {
      this.get_Borrow_Balance();
    }, 700);

    this.timerID = setInterval(() => {
      if (typeof web3 !== 'undefined' && this.web3.eth.accounts[0] !== undefined) {
        this.get_Borrow_Balance();
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
      coinBalance: this.state.borrowedusdxBalance,
      login: this.web3.eth.accounts[0]
    }
    return <CoinInfoWithIcon {...props} />
  }
}

export default BalanceInfoWithIcon;