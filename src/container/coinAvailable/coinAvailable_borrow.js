import React, { Component } from 'react';

import CoinInfo from '../../component/coinInfo/coinInfo';
import Network from '../../constant.json';
import WETH from '../../ABIs/WETH';

import { toFormatShowNumber, toNonExponential, findNetwork, formatBigNumber } from '../../util.js';
import './coinAvailable.scss';

class CoinAvailable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      wethAccountBalance: 0,
      usdxAccountBalance: 0,
      wethAssetPrice: 0,
      usdxAssetPrice: 0,
      wethAssetBalance: 0,
      usdxAssetBalance: 0,
      collateralRatio: 0,
      maxWithdrawWETHAmount: 0,
      maxWithdrawUSDXAmount: 0,
      usdxAvailableAmount: 0,
      cash: 0,
      originationFee: 0
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


  componentDidMount_temp = () => {
    setTimeout(() => {
      this.get_Account_Balance();
    }, 2000);
    this.timerID = setInterval(() => {
      if (typeof web3 !== 'undefined' && this.web3.eth.accounts[0] !== undefined) {
        this.get_Account_Balance();
      }
    }, 1000 * 15);
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  render = () => {
    const props = {
      balanceDescription: '',
      balanceAmount: this.state.usdxAvailableAmount,
      balanceType: 'USDx',
      balanceUnit: 'Available',
    }
    return (
      <CoinInfo {...props} login={this.web3.eth.accounts[0]} />
    )
  }
}

export default CoinAvailable;