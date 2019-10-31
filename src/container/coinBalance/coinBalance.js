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

    if (window.web3.currentProvider.isMetaMask) {
      window.ethereum.on('accountsChanged', () => {
        this.componentDidMount_temp();
      });
    }
  }

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
          this.setState({ usdxAccountBalance: usdxBalance })
        }
      }
    );
  }

  getAccountETHBalance = () => {
    if (typeof web3 !== 'undefined' && this.web3.eth.accounts[0] !== undefined) {
      this.web3.eth.getBalance(this.web3.eth.accounts[0], (err, balance) => {
        if (balance !== undefined && balance !== null) {
          this.setState({ ethAccountBalance: toFormatShowNumber(this.web3.fromWei(balance.toNumber(), "ether")) });
          this.getMyAddressWETHBalance();
        }
      });
    }
  }

  getMyAddressWETHBalance = () => {
    // console.log('getMyAddressWETHBalance');
    if (typeof web3 !== 'undefined' && this.web3.eth.accounts[0] !== undefined) {
      WETH().balanceOf(this.web3.eth.accounts[0], (err, res) => {
        let wethBalanceAmount = 0;
        if (res !== undefined && res !== null) {
          wethBalanceAmount = res.toNumber();
          this.setState({ wethAccountBalance: toFormatShowNumber(this.web3.fromWei(wethBalanceAmount, "ether")) }, () => {
            // console.log(this.state.wethAccountBalance);
          });
        }
      });
    }
  }
  componentDidMount_temp = () => {
    // this.getAccountUSDXBalanceByAddress();
    // this.getAccountETHBalance();
    // this.getMyAddressWETHBalance();  

    setTimeout(() => {
      this.getAccountUSDXBalanceByAddress();
      this.getAccountETHBalance();
      this.getMyAddressWETHBalance();
    }, 700);

    this.timerID = setInterval(() => {
      if (typeof web3 !== 'undefined' && this.web3.eth.accounts[0] !== undefined) {
        this.getAccountUSDXBalanceByAddress();
        this.getAccountETHBalance();
        this.getMyAddressWETHBalance();
      }
    }, 1000 * 15);
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  render() {
    const props = {
      balanceDescription: '',
      // balanceAmount: this.props.coin === 'eth' ? this.state.ethAccountBalance : this.props.coin === 'weth' ? this.state.wethAccountBalance : this.state.usdxAccountBalance,
      balanceAmount: this.props.coin === 'eth' ? this.state.ethAccountBalance : this.props.coin === 'weth' ? this.props.father_max_Unwrap_Amount : this.state.usdxAccountBalance,
      balanceType: this.props.coin === 'eth' ? 'ETH' : this.props.coin === 'weth' ? 'WETH' : 'USDx',
      balanceUnit: 'Balance',
    }

    return <CoinInfo {...props} login={window.web3.eth.accounts[0]} />


    // <div className='balance-info'>
    //   <span className='balance-desc'>{props.balanceDescription || props.balanceType + ' ' + props.balanceUnit}</span>
    //   <span className='balance-amount'>{window.web3.eth.accounts[0] ? toDoubleThousands(props.balanceAmount) : '-'}&nbsp;{props.balanceType || 'Ether'}</span>
    // </div>

    // <CoinInfo {...props} login={this.props.login} />
  }
}

export default CoinBalance;