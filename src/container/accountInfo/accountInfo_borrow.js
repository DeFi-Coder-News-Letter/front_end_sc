import React, { Component } from 'react';
import InfoSection from '../../component/infoSection/infoSection';
import Network from '../../constant.json';
import USDX from "./../../ABIs/USDX.js";
import MoneyMarket from './../../ABIs/MoneyMarket.js';
import { toFormatShowNumber, getPercentageFormat, toDoubleThousands, findNetwork, formatBigNumber } from '../../util.js';
import './accountInfo.scss';


// add i18n.
import { IntlProvider, FormattedMessage } from 'react-intl';
import en_US from '../../language/en_US.js';
import zh_CN from '../../language/zh_CN';

class AccountInfo extends Component {
  constructor(props) {
    super(props)
    this.state = {
      borrowBalance: 0,
      borrowBalanceShow: 0,
      borrowInterestRate: 0,
      supplyInterestRate: 0,
      totalSupply: 0,
      totalBorrowInMoneyMarket: 0,
      totalBorrowInMoneyMarketUnformat: 0,
      totalSupplyUSDxInMoneyMarket: 0,
      totalSupplyWETHInMoneyMarket: 0,
      availableToBorrow: 0,
      collateralRatio: 0,
      collateralRatioShow: 0,
      usdxBalanceOf: 0,
      cash: 0,
      utilizationRate: 0,
      usdxAssetPrice: 0,
      WETHAssetPrice: 0,
      supplyWETHAmount: 0,
      originationFee: 0,
      tatol_Supplied: 0
    }
    this.web3 = window.web3;

    this.componentDidMount_temp();

    if (window.web3.currentProvider.isMetaMask) {
      window.ethereum.on('accountsChanged', () => {
        this.componentDidMount_temp();
      });
    }
  }


  // **************8 totalSupply
  getWETHAssetPrice = () => {
    if (MoneyMarket() === undefined) {
      return;
    }
    let wethAddress = '';
    let NetworkName = findNetwork(window.web3.version.network);
    if (NetworkName === 'Main') {
      wethAddress = Network.Main.WETH;
    } else if (NetworkName === 'Rinkeby') {
      wethAddress = Network.Rinkeby.WETH;
    }
    MoneyMarket().assetPrices(
      wethAddress,
      (err, res1) => {
        // res1 weth 价格
        if (res1 !== undefined && res1 !== null) {
          // console.log('1111111111111111111 weth 价格 -: ', res1);
          let usdxAddress = '';
          let NetworkName = findNetwork(window.web3.version.network);
          if (NetworkName === 'Main') {
            usdxAddress = Network.Main.USDx;
          } else if (NetworkName === 'Rinkeby') {
            usdxAddress = Network.Rinkeby.USDx;
          }
          MoneyMarket().assetPrices(
            usdxAddress,
            (err, res2) => {
              // res2 usdx 价格
              if (res2 !== undefined && res2 !== null) {
                // console.log('2222222222222222222 usdx 价格 -: ', res2);
                if (this.web3.fromWei(res2.toNumber(), "ether") !== 0 && res1.toNumber() !== 0) {
                  this.setState({ WETHAssetPrice: this.web3.fromWei(res1.toNumber(), "ether") / this.web3.fromWei(res2.toNumber(), "ether") }, () => {
                    // console.log('33333333333333333 ----- WETHAssetPrice---: ', this.state.WETHAssetPrice);
                    // 现在去拿 supply WETH Amount
                    MoneyMarket().getSupplyBalance(
                      this.web3.eth.accounts[0],
                      wethAddress,
                      (err, res3) => {
                        // res3 是 supply WETH Amount
                        // console.log('444444444444444444 ----- supply WETH Amount---: ', res3);
                        if (res3 !== undefined && res3 !== null) {
                          this.setState({
                            supplyWETHAmount: this.web3.fromWei(res3.toNumber(), "ether"),
                            totalSupply: this.state.WETHAssetPrice * this.web3.fromWei(res3.toNumber(), "ether")
                          }, () => {
                            // console.log('5555555555555555 ----- totalSupply----: ', this.state.totalSupply);
                          });
                        }
                      }
                    );
                  });
                }
              }
            });
        }
      });
  }

  // ************************* availableToBorrow
  calculateAccountValuesByAddress = () => {
    if (typeof web3 === 'undefined' || this.web3.eth.accounts[0] === undefined || MoneyMarket() === undefined) {
      return;
    }
    let usdxAddress = '';
    let NetworkName = findNetwork(window.web3.version.network);
    if (NetworkName === 'Main') {
      usdxAddress = Network.Main.USDx;
    } else if (NetworkName === 'Rinkeby') {
      usdxAddress = Network.Rinkeby.USDx;
    }
    let wethAddress = '';
    if (NetworkName === 'Main') {
      wethAddress = Network.Main.WETH;
    } else if (NetworkName === 'Rinkeby') {
      wethAddress = Network.Rinkeby.WETH;
    }
    let mmAddress = '';
    if (NetworkName === 'Main') {
      mmAddress = Network.Main.MoneyMarket;
    } else if (NetworkName === 'Rinkeby') {
      mmAddress = Network.Rinkeby.MoneyMarket;
    }
    MoneyMarket().getBorrowBalance(this.web3.eth.accounts[0], usdxAddress, (err, res) => {
      // res 是 sun_of_borrow 总的borrow （ 借出 ）
      if (res !== undefined || res !== null) {
        // console.log('sun_of_borrow:', res);
        let res_format = formatBigNumber(res);
        MoneyMarket().assetPrices(wethAddress, (err, res1) => {
          if (res1 !== undefined && res1 !== null) {
            MoneyMarket().assetPrices(usdxAddress, (err, res2) => {
              if (res2 !== undefined && res2 !== null) {
                this.setState({ WETHAssetPrice: this.web3.fromWei(res1.toNumber(), "ether") / this.web3.fromWei(res2.toNumber(), "ether") }, () => {
                  // console.log(this.state.WETHAssetPrice)
                  MoneyMarket().getSupplyBalance(this.web3.eth.accounts[0], wethAddress, (err, res3) => {
                    if (res3 !== undefined && res3 !== null) {
                      this.setState({
                        supplyWETHAmount: this.web3.fromWei(res3.toNumber(), "ether"),
                        totalSupply: this.state.WETHAssetPrice * this.web3.fromWei(res3.toNumber(), "ether")
                      }, () => {
                        MoneyMarket().collateralRatio((err, res_ratio) => {
                          if (res_ratio !== undefined && res_ratio !== null) {
                            this.setState({ collateralRatioShow: getPercentageFormat(this.web3.fromWei(res_ratio.toNumber(), "ether")) })
                            USDX().balanceOf(mmAddress, (err, res_cash) => {
                              if (res_cash) {
                                MoneyMarket().originationFee((err, res_originFee) => {
                                  let sumofSupplies = this.web3.fromWei(res3.toNumber(), "ether") * this.state.WETHAssetPrice;
                                  let sumofBorrow = res_format;
                                  let availableToBorrow = (sumofSupplies / this.web3.fromWei(res_ratio.toNumber(), "ether")) - sumofBorrow;
                                  let availableBorrowAmount = Math.min(availableToBorrow, toFormatShowNumber(this.web3.fromWei(res_cash.toNumber(), "ether")));
                                  if (Number(availableBorrowAmount) < 0) {
                                    availableBorrowAmount = 0;
                                  }
                                  // 修改 available_To_Borrow 不同步问题
                                  if (Number(availableBorrowAmount) === Number(toFormatShowNumber(this.web3.fromWei(res_cash.toNumber(), "ether")))) {
                                    this.setState({ availableToBorrow: toFormatShowNumber(this.web3.fromWei(res_cash.toNumber(), "ether")) }, () => {
                                      // console.log('--- available_to_borrow --- : ', this.state.availableToBorrow);
                                    });
                                  } else {
                                    this.setState({ availableToBorrow: availableBorrowAmount / (1 + Number(formatBigNumber(res_originFee))) }, () => {
                                      // console.log('--- available_to_borrow --- : ', this.state.availableToBorrow);
                                    })
                                  }
                                });
                              }
                            })
                          }
                        });
                      });
                    }
                  }
                  );
                });
              }
            });
          }
        });
      }
    }
    )
  }

  // ********************** borrowBalanceShow
  getBorrowBalance = () => {
    if (MoneyMarket() === undefined) {
      return;
    }
    let usdxAddress = '';
    let NetworkName = findNetwork(window.web3.version.network);
    if (NetworkName === 'Main') {
      usdxAddress = Network.Main.USDx;
    } else if (NetworkName === 'Rinkeby') {
      usdxAddress = Network.Rinkeby.USDx;
    }
    if (typeof web3 !== 'undefined' && this.web3.eth.accounts[0] !== undefined) {
      MoneyMarket().getBorrowBalance(this.web3.eth.accounts[0], usdxAddress, (err, res) => {
        // let borrowBalance = 0;
        if (res !== undefined && res !== null) {
          // console.log(res)
          // borrowBalance = res.toNumber();
          this.setState({
            borrowBalance: this.web3.fromWei(res.toNumber(), "ether"),
            borrowBalanceShow: this.web3.fromWei(res.toNumber(), "ether")
          }, () => {
            // console.log(this.state.borrowBalance);
          });
        }
      });
    }
  };

  // ******************** borrowInterestRate
  getBorrowInterestRate = () => {
    if (MoneyMarket() === undefined) {
      return;
    }
    let usdxAddress = '';
    let NetworkName = findNetwork(window.web3.version.network);
    if (NetworkName === 'Main') {
      usdxAddress = Network.Main.USDx;
    } else if (NetworkName === 'Rinkeby') {
      usdxAddress = Network.Rinkeby.USDx;
    }
    MoneyMarket().markets.call(usdxAddress,
      (err, res) => {
        if (res !== null && res !== undefined) {
          this.setState({ borrowInterestRate: getPercentageFormat(this.web3.fromWei(res[7].toNumber(), "ether") * 86400 * 365 / 15) })
        }
      }
    );
  }


  componentDidMount_temp = () => {
    if (window.web3) {
      window.web3.currentProvider.enable().then(
        res => {
          console.log(this.web3.eth.accounts[0]);
        }
      )
    }
    setTimeout(() => {
      this.getWETHAssetPrice();
      this.getBorrowBalance();
      this.getBorrowInterestRate();
      this.calculateAccountValuesByAddress();
    }, 700);
    this.getAddressIntervalBorrow = setInterval(() => {
      if (true) {
        this.getWETHAssetPrice();
        this.getBorrowBalance();
        this.getBorrowInterestRate();
        this.calculateAccountValuesByAddress();
      }
    }, 1000 * 15);
  }


  render = () => {
    const accountInfo = [
      {
        title: 'Supplied Balance',
        amount: (typeof web3 === 'undefined' || this.web3.eth.accounts[0] === undefined || !this.props.login) ? '-' : '$' + toDoubleThousands(this.state.totalSupply),
        page: 'borrow'
      },
      {
        title: 'Borrowed Balance',
        amount: (typeof web3 === 'undefined' || this.web3.eth.accounts[0] === undefined || !this.props.login) ? '-' : '$' + toDoubleThousands(this.state.borrowBalanceShow),
        page: 'borrow'
      },
      {
        title: 'Available to Borrow',
        amount: (typeof web3 === 'undefined' || this.web3.eth.accounts[0] === undefined || !this.props.login) ? '-' : '$' + toDoubleThousands(this.state.availableToBorrow),
        page: 'borrow'
      },
      {
        title: 'Borrow APR',
        amount: (typeof web3 === 'undefined' || this.web3.eth.accounts[0] === undefined || !this.props.login) ? '-' : toDoubleThousands(this.state.borrowInterestRate) + '%',
        page: 'borrow'
      },
      {
        title: 'Collateralization ratio',
        amount: (typeof web3 === 'undefined' || this.web3.eth.accounts[0] === undefined || !this.props.login) ? '-' : toDoubleThousands(this.state.collateralRatioShow) + '%',
        page: 'borrow'
      }
    ];
    return (
      <IntlProvider locale={'en'} messages={navigator.language === 'zh-CN' ? zh_CN : en_US} >
        <div className={'account-info-board'}>
          <div className={'info-board-title'}>
            {/* {'Account Portfolio'} */}
            <FormattedMessage id='Account_Portfolio' />
          </div>
          <div className={'info-board-content'}>
            <InfoSection accountInfo={accountInfo} currentPage={'borrow'} />
          </div>
        </div>
      </IntlProvider>
    )
  }
}

export default AccountInfo;