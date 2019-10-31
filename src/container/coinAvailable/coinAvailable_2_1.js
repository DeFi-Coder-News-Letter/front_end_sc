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

  // ***************** get_max_Withdraw_WETH_Amount
  get_max_Withdraw_WETH_Amount = () => {
    if (typeof web3 !== 'undefined' && this.web3.eth.accounts[0] !== undefined) {
      let wethAddress = '';
      let NetworkName = findNetwork(window.web3.version.network);
      if (NetworkName === 'Main') {
        wethAddress = Network.Main.WETH;
      } else if (NetworkName === 'Rinkeby') {
        wethAddress = Network.Rinkeby.WETH;
      }
      let usdxAddress = '';
      if (NetworkName === 'Main') {
        usdxAddress = Network.Main.USDx;
      } else if (NetworkName === 'Rinkeby') {
        usdxAddress = Network.Rinkeby.USDx;
      }
      MoneyMarket().assetPrices(usdxAddress, (err, res11) => {
        if (res11 !== undefined && res11 !== null) {
          MoneyMarket().assetPrices(wethAddress, (err, res00) => {
            if (res00 !== undefined && res00 !== null) {
              if (this.web3.fromWei(res11.toNumber(), "ether") !== 0 && res00.toNumber() !== 0) {
                this.setState({
                  wethAssetPrice: this.web3.fromWei(res00.toNumber(), "ether") / this.web3.fromWei(res11.toNumber(), "ether")
                }, () => {
                  MoneyMarket().calculateAccountValues(this.web3.eth.accounts[0], (err, res) => {
                    if (res === undefined || res === null || Number(this.state.wethAssetPrice) === 0) {
                      return;
                    }
                    MoneyMarket().collateralRatio((err, res_ratio) => {
                      if (res_ratio !== undefined && res_ratio !== null) {
                        let sumofSupplies = this.web3.fromWei(this.web3.fromWei(res[1].toNumber(), "ether"), "ether");
                        let sumofBorrow = this.web3.fromWei(this.web3.fromWei(res[2].toNumber(), "ether"), "ether") * this.web3.fromWei(res_ratio.toNumber(), "ether");
                        sumofSupplies = sumofSupplies * this.state.wethAssetPrice / 1;
                        sumofBorrow = sumofBorrow * this.state.wethAssetPrice / 1;
                        MoneyMarket().getSupplyBalance(this.web3.eth.accounts[0], wethAddress, (err, res_weth) => {
                          if (res_weth !== undefined && res_weth !== null) {
                            let mmAddress = '';
                            if (NetworkName === 'Main') {
                              mmAddress = Network.Main.MoneyMarket;
                            } else if (NetworkName === 'Rinkeby') {
                              mmAddress = Network.Rinkeby.MoneyMarket;
                            }
                            WETH().balanceOf(mmAddress, (err, res_B) => {
                              if (res_B !== undefined && res_B !== null) {
                                let max = Math.min((sumofSupplies - sumofBorrow) / this.state.wethAssetPrice, this.web3.fromWei(res_weth.toNumber(), "ether"), this.web3.fromWei(res_B.toNumber(), "ether"));
                                if (Number(max) < 0) {
                                  max = 0;
                                }
                                this.setState({ maxWithdrawWETHAmount: Number(max) });
                              }
                            });
                          }
                        }
                        );
                      }
                    });
                  });
                });
              }
            }
          });
        }
      });
    }
  };

  componentDidMount_temp = () => {
    setTimeout(() => {
      this.get_max_Withdraw_WETH_Amount();
    }, 700);
    this.timerID = setInterval(() => {
      if (typeof web3 !== 'undefined' && this.web3.eth.accounts[0] !== undefined) {
        this.get_max_Withdraw_WETH_Amount();
      }
    }, 2000);
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  render = () => {
    const props = {
      balanceDescription: '',
      balanceAmount: this.state.maxWithdrawWETHAmount,
      balanceType: 'WETH',
      balanceUnit: 'Available',
    }
    return (
      <CoinInfo {...props} login={this.web3.eth.accounts[0]} />
    )
  }
}

export default CoinAvailable;