import React, { Component } from 'react';
import MoneyMarket from '../../ABIs/MoneyMarket.js';
import CoinInfo from '../../component/coinInfo/coinInfo';
import Network from '../../constant.json';
import WETH from '../../ABIs/WETH';
import USDX from "./../../ABIs/USDX.js";
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

    this.componentDidMount_temp();

    if (window.web3.currentProvider.isMetaMask) {
      window.ethereum.on('accountsChanged', () => {
        this.componentDidMount_temp();
      });
    }
  }

  // ***************88 usdx_Available_Amount
  get_Account_Balance = () => {
    if (this.web3.eth.accounts[0] === undefined || MoneyMarket() === undefined || USDX() === undefined) {
      return;
    }
    let usdxAddress = '';
    let NetworkName = findNetwork(window.web3.version.network);
    if (NetworkName === 'Main') {
      usdxAddress = Network.Main.USDx;
    } else if (NetworkName === 'Rinkeby') {
      usdxAddress = Network.Rinkeby.USDx;
    }
    MoneyMarket().getBorrowBalance(this.web3.eth.accounts[0], usdxAddress, (err, res) => {
      if (res === undefined || res === null) {
        return;
      }
      res = formatBigNumber(res);
      let wethAddress = '';
      if (NetworkName === 'Main') {
        wethAddress = Network.Main.WETH;
      } else if (NetworkName === 'Rinkeby') {
        wethAddress = Network.Rinkeby.WETH;
      }
      MoneyMarket().getSupplyBalance(this.web3.eth.accounts[0], wethAddress, (err, res1) => {
        if (res1 !== undefined && res1 !== null) {
          MoneyMarket().assetPrices(usdxAddress, (err, res33) => {
            if (res33 !== undefined && res33 !== null) {
              this.setState({ usdxAssetPrice: this.web3.fromWei(res33.toNumber(), "ether") }, () => {
                MoneyMarket().assetPrices(wethAddress, (err, res2) => {
                  if (res2 !== undefined && res2 !== null) {
                    if (this.state.usdxAssetPrice !== 0 && res2.toNumber() !== 0) {
                      let sumofSupplies = this.web3.fromWei(res1.toNumber(), "ether") * (this.web3.fromWei(res2.toNumber(), "ether") / this.state.usdxAssetPrice);
                      let sumofBorrow = res;
                      MoneyMarket().collateralRatio((err, res5) => {
                        if (res5 !== undefined && res5 !== null) {
                          let usdxAvailableAmount = sumofSupplies / this.web3.fromWei(res5.toNumber(), "ether") - sumofBorrow;
                          let mmAddress = '';
                          if (NetworkName === 'Main') {
                            mmAddress = Network.Main.MoneyMarket;
                          } else if (NetworkName === 'Rinkeby') {
                            mmAddress = Network.Rinkeby.MoneyMarket;
                          }
                          USDX().balanceOf(mmAddress, (err, res66) => {
                            if (res66 !== undefined && res66 !== null) {
                              this.setState({ cash: toFormatShowNumber(this.web3.fromWei(res66.toNumber(), "ether")) }, () => {
                                MoneyMarket().originationFee((err, res_orin) => {
                                  if (res_orin !== undefined || res_orin !== null) {
                                    // this.setState({ originationFee: formatBigNumber(res_orin) })
                                    let availableBorrowAmount = Math.min(usdxAvailableAmount, this.state.cash);
                                    if (Number(availableBorrowAmount) < 0) {
                                      availableBorrowAmount = 0;
                                    }
                                    if (Number(availableBorrowAmount) === Number(this.state.cash)) {
                                      availableBorrowAmount = this.state.cash;
                                    } else if (Number(availableBorrowAmount) === Number(usdxAvailableAmount)) {
                                      availableBorrowAmount = availableBorrowAmount / (1 + Number(formatBigNumber(res_orin)));
                                    }
                                    if (this.state.usdxAvailableAmount !== availableBorrowAmount) {
                                      this.setState({ usdxAvailableAmount: availableBorrowAmount })
                                    }
                                  }
                                });
                              })
                            }
                          });
                        }
                      });
                    }
                  }
                });
              });
            }
          });
        }
      }
      );
    }
    )
  }

  componentDidMount_temp = () => {
    setTimeout(() => {
      this.get_Account_Balance();
    }, 700);
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