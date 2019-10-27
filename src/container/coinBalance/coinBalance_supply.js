import React, { Component } from 'react';
import CoinInfo from '../../component/coinInfo/coinInfo';
import WETH from '../../ABIs/WETH';
import USDX from "./../../ABIs/USDX.js";
import { toFormatShowNumber, toDoubleThousands } from '../../util.js';
import './coinBalance.scss';

class CoinBalance extends Component {
  constructor(props) {
    super(props);
    this.state = {
      usdxAccountBalance: 0,
      ethAccountBalance: 0,
      wethAccountBalance: 0
    }
    this.web3 = window.web3;

    this.componentDidMount_temp();

    window.ethereum.on('accountsChanged', () => {
      this.componentDidMount_temp();
    });
  }


  // ********************* usdx_Account_Balance
  getAccountUSDXBalanceByAddress = () => {
    if (typeof web3 === 'undefined' || this.web3.eth.accounts[0] === undefined || USDX() === undefined) {
      return;
    }
    USDX().balanceOf(this.web3.eth.accounts[0],
      (err, res) => {
        let usdxBalance = 0;
        if (res !== undefined && res !== null) {
          usdxBalance = this.web3.fromWei(res.toNumber(), "ether");
        }
        if (this.state.usdxAccountBalance !== usdxBalance) {
          this.setState({ usdxAccountBalance: usdxBalance }, () => {
            // console.log(this.state.usdxAccountBalance);
          })
        }
      }
    );
  }


  componentDidMount_temp = () => {
    setTimeout(() => {
      this.getAccountUSDXBalanceByAddress();
    }, 700);
    this.timerID = setInterval(() => {
      if (typeof web3 !== 'undefined' && this.web3.eth.accounts[0] !== undefined) {
        this.getAccountUSDXBalanceByAddress();
      }
    }, 1000 * 15);
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  render() {
    const props = {
      balanceDescription: '',
      balanceAmount: this.state.usdxAccountBalance,
      balanceType: 'USDx',
      balanceUnit: 'Balance',
    }

    return <CoinInfo {...props} login={window.web3.eth.accounts[0]} />
  }
}

export default CoinBalance;