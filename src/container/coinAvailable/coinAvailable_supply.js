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

    // this.componentDidMount_temp();

    // window.ethereum.on('accountsChanged', () => {
    //   this.componentDidMount_temp();
    // });
  }

  // ******************* max_Withdraw_USDX_Amount
  getmaxWithdrawUSDXAmount = () => {
    if (typeof web3 !== 'undefined' && this.web3.eth.accounts[0] !== undefined) {
      MoneyMarket().calculateAccountValues(
        this.web3.eth.accounts[0],
        (err, res) => {
          if (res !== undefined || res !== null) {
            MoneyMarket().collateralRatio((err, res1) => {
              if (res1 !== undefined && res1 !== null) {
                let sumofSupplies = this.web3.fromWei(this.web3.fromWei(res[1].toNumber(), "ether"), "ether");
                let sumofBorrow = this.web3.fromWei(this.web3.fromWei(res[2].toNumber(), "ether"), "ether") * this.web3.fromWei(res1.toNumber(), "ether");
                let wethAddress = '';
                let NetworkName = findNetwork(window.web3.version.network);
                if (NetworkName === 'Main') {
                  wethAddress = Network.Main.WETH;
                } else if (NetworkName === 'Rinkeby') {
                  wethAddress = Network.Rinkeby.WETH;
                }
                MoneyMarket().assetPrices(wethAddress, (err, res2) => {
                  let usdxAddress = '';
                  if (NetworkName === 'Main') {
                    usdxAddress = Network.Main.USDx;
                  } else if (NetworkName === 'Rinkeby') {
                    usdxAddress = Network.Rinkeby.USDx;
                  }
                  MoneyMarket().assetPrices(usdxAddress, (err, res3) => {
                    if (res3 !== undefined && res3 !== null) {
                      sumofSupplies = sumofSupplies * (this.web3.fromWei(res2.toNumber(), "ether") / this.web3.fromWei(res3.toNumber(), "ether")) / 1;
                      sumofBorrow = sumofBorrow * (this.web3.fromWei(res2.toNumber(), "ether") / this.web3.fromWei(res3.toNumber(), "ether")) / 1;
                      MoneyMarket().getSupplyBalance(this.web3.eth.accounts[0], usdxAddress, (err, res5) => {
                        if (res5 !== undefined && res5 !== null) {
                          let mmAddress = '';
                          if (NetworkName === 'Main') {
                            mmAddress = Network.Main.MoneyMarket;
                          } else if (NetworkName === 'Rinkeby') {
                            mmAddress = Network.Rinkeby.MoneyMarket;
                          }
                          USDX().balanceOf(mmAddress, (err, res6) => {
                            if (res6 !== undefined && res6 !== null) {
                              let max = Math.min((sumofSupplies - sumofBorrow), this.web3.fromWei(res5.toNumber(), "ether"), this.web3.fromWei(res6.toNumber(), "ether"));
                              if (Number(max) < 0) {
                                max = 0;
                              }
                              // let testMax = 0.000000005163079378;
                              // console.log('lend........withdraw....testMax:' + testMax + ' / toDoubleThousands:' + toDoubleThousands(toNonExponential(testMax)));
                              this.setState({ maxWithdrawUSDXAmount: toNonExponential(max) }, () => {
                                // console.log(this.state.maxWithdrawUSDXAmount);
                              });
                            }
                          });
                        }
                      }
                      );
                    }
                  });
                });
              }
            });
          }
        }
      );
    }
  };


  // componentDidMount_temp = () => {
  //   setTimeout(() => {
  //     this.getmaxWithdrawUSDXAmount();
  //   }, 700);

  //   this.timerID = setInterval(() => {
  //     if (typeof web3 !== 'undefined' && this.web3.eth.accounts[0] !== undefined) {
  //       this.getmaxWithdrawUSDXAmount();
  //     }
  //   }, 1000 * 15);
  // }

  // componentWillUnmount() {
  //   clearInterval(this.timerID);
  // }


  render = () => {
    const props = {
      balanceDescription: '',
      balanceAmount: this.props.father_USDx,
      balanceType: 'USDx',
      balanceUnit: 'Available',
    }
    return (
      <CoinInfo {...props} login={this.web3.eth.accounts[0]} />
    )
  }
}

export default CoinAvailable;