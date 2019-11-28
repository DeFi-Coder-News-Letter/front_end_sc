import React, { Component } from 'react';
import { Tabs } from 'antd'
import Approve from '../../component/approve/approve';
import InputUnit from '../../component/inputUnit/inputUnit';
import USDX from "./../../ABIs/USDX.js";
import MoneyMarket from './../../ABIs/MoneyMarket.js';
import { toFormatShowNumber, saveTransaction, getTxnHashHref, toDoubleThousands, validNumber, toFormat4Number, getTransactionHistoryKey, findNetwork, diffMin, formatBigNumber } from '../../util.js'
import './borrowInput.scss';
import Asset from '../../constant.json';
import Network from '../../constant.json';

import CoinAvailable from './../coinAvailable/coinAvailable_borrow';
import CoinBalance from './../coinBalance/coinBalance';
import BalanceInfoWithIcon from './../balanceInfoWithIcon/balanceInfoWithIcon_borrow_right';
import ErrorCode from '../../error_code.json';

// add i18n.
import { IntlProvider, FormattedMessage } from 'react-intl';
import en_US from '../../language/en_US.js';
import zh_CN from '../../language/zh_CN';

 
const { TabPane } = Tabs;

class BorrowInput extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentUser: '',
      supplyType: props.supplyType,
      networkName: props.networkName,
      web3NoExist: props.web3NoExist,
      myAddress: props.myAddress,
      getHash: false,
      hashNumber: "",
      // borrowType: props.borrowType,
      borrowtxhash: "",
      // borrowBalanceShow: null,
      repayBorrowAmount: '',
      // DFBorrowMarketInfo: [],
      USDxBorrowMarketInfo: [],
      WETHBorrowMarketInfo: [],
      USDxApproval: props.USDxApproval,
      pendingUSDxApproval: props.pendingUSDxApproval,
      pendingApproval: false,
      approveButtonInfo: this.props.approveButtonInfo,
      borrowMax: false,
      isApproved: false,
      isBorrowEnable: true,
      isRepayEnable: true,
      // borrowBalance: null,
      myAddressUSDxBalance: 0,
      maxRepayBorrowAmount: 0,
      maxRepayBorrowAmountShow: 0,
      usdxAllowance: props.usdxAllowance,
      repayBorrowMax: false,
      // BORROW
      accountBalance: 0,
      balanceAmountShow: '',
      borrowedUSDxBalance: 0,
      maxBorrowAmount: 0,
      borrowAmount: '',
      isRepayBorrowEnable: true,
      borrowButtonText: '',
      repayButtonText: '',
      collateralRatio: 0,
      usdxBalance: 0,
      usdxAvailableAmount: 0,
      exceedsSafeMax: false,
      supplyWETHAmount: 0,
      WETHAssetPrice: 0,
      usdxAssetPrice: 0,
      cash: 0,
      borrowInputDisabled: false,
      repayBorrowInputDisabled: false,
      borrowMaxClassName: 'max-amount-button-borrow',
      repayBorrowMaxClassName: 'max-amount-button-borrow',
      //check
      borrowUSDxWaitUpdateForSuccessMap: new Map(),
      borrowUSDxWaitUpdateForFailedMap: new Map(),
      //超时则取消控件限制
      borrowUSDxWaitUpdateTimeOutMap: new Map(),
      repayUSDxWaitUpdateForSuccessMap: new Map(),
      repayUSDxWaitUpdateForFailedMap: new Map(),
      //超时则取消控件限制
      repayUSDxWaitUpdateTimeOutMap: new Map(),
      enableUSDxWaitUpdateForSuccessMap: new Map(),
      enableUSDxWaitUpdateForFailedMap: new Map(),
      //超时则取消控件限制
      enableUSDxWaitUpdateTimeOutMap: new Map(),
      originationFee: 0,
      //超时则取消控件限制
      timeOutTimes: 5,
      USDx_isApproved: 0
    };
    this.web3 = window.web3;
    if (window.ethereum === undefined) {
      return;
    }

    if (window.web3.currentProvider.isMetaMask) {
      window.ethereum.on('accountsChanged', (accounts) => {
        setTimeout(this.refreshData(), 500);
        this.getUSDxAllowance();
        this.getMaxBorrowAmount();
        this.getBorrowBalance();
        this.setState({ borrowAmount: '', repayBorrowAmount: '', isBorrowEnable: true, isRepayBorrowEnable: true, exceedsSafeMax: false });
      });
    }

    // this.componentDidMount_temp();
    window.web3.version.getNetwork((e, r) => {
      if (r) {
        this.setState({
          NetworkName: r
        }, () => {
          setTimeout(() => {
            this.componentDidMount_temp();
          }, 2000)
        })
      }
    })
  }

  getCollateralRatio = () => {
    if (MoneyMarket() === undefined) {
      return;
    }
    MoneyMarket().collateralRatio((err, res) => {
      if (res !== undefined && res !== null && this.state.collateralRatio !== this.web3.fromWei(res.toNumber(), "ether")) {
        this.setState({ collateralRatio: this.web3.fromWei(res.toNumber(), "ether") })
      }
    }
    );
  }

  // 获得最大 可以借的数额
  getMaxBorrowAmount = () => {
    if (typeof web3 === 'undefined' || this.web3.eth.accounts[0] === undefined || MoneyMarket() === undefined) {
      return;
    }
    MoneyMarket().calculateAccountValues(
      this.web3.eth.accounts[0],
      (err, res) => {
        if (res === undefined || res === null) {
          return;
        }
        let sumofSupplies = this.web3.fromWei(this.web3.fromWei(res[1].toNumber(), "ether"), "ether");
        let sumofBorrow = this.web3.fromWei(this.web3.fromWei(res[2].toNumber(), "ether"), "ether");

        let wethAddress = '';
        let NetworkName = findNetwork(this.state.NetworkName);
        if (NetworkName === 'Main') {
          wethAddress = Network.Main.WETH;
        } else if (NetworkName === 'Rinkeby') {
          wethAddress = Network.Rinkeby.WETH;
        }
        MoneyMarket().assetPrices(
          wethAddress,
          (err, res1) => {
            if (res1 !== undefined && res1 !== null) {
              let usdxAddress = '';
              let NetworkName = findNetwork(this.state.NetworkName);
              if (NetworkName === 'Main') {
                usdxAddress = Network.Main.USDx;
              } else if (NetworkName === 'Rinkeby') {
                usdxAddress = Network.Rinkeby.USDx;
              }
              MoneyMarket().assetPrices(
                usdxAddress,
                (err, res2) => {
                  //weth价格修改 增加了下面两行
                  sumofSupplies = sumofSupplies * (this.web3.fromWei(res1.toNumber(), "ether") / (this.web3.fromWei(res2.toNumber(), "ether"))) / 1;
                  sumofBorrow = sumofBorrow * (this.web3.fromWei(res1.toNumber(), "ether") / (this.web3.fromWei(res2.toNumber(), "ether"))) / 1;
                  MoneyMarket().collateralRatio((err, res3) => {
                    let mmAddress = '';
                    let NetworkName = findNetwork(this.state.NetworkName);
                    if (NetworkName === 'Main') {
                      mmAddress = Network.Main.MoneyMarket;
                    } else if (NetworkName === 'Rinkeby') {
                      mmAddress = Network.Rinkeby.MoneyMarket;
                    }
                    USDX().balanceOf(
                      mmAddress,
                      (err, res5) => {
                        if (res5 !== undefined && res5 !== null) {
                          MoneyMarket().originationFee((err, res6) => {
                            if (res6 !== undefined || res6 !== null) {
                              let safeMax = Math.min((sumofSupplies / this.web3.fromWei(res3.toNumber(), "ether")) * 0.8 - sumofBorrow, toFormatShowNumber(this.web3.fromWei(res5.toNumber(), "ether")));
                              if (Number(safeMax) < 0) {
                                safeMax = 0;
                              }
                              if (Number(safeMax) !== Number(toFormatShowNumber(this.web3.fromWei(res5.toNumber(), "ether")))) {
                                safeMax = safeMax / (1 + Number(formatBigNumber(res6)));
                              }
                              if (this.state.maxBorrowAmount !== toFormat4Number(safeMax)) {
                                this.setState({ maxBorrowAmount: toFormat4Number(safeMax) }, () => {
                                  // console.log(this.state.maxBorrowAmount);
                                });
                              }
                            }
                          });
                        }
                      });
                  });
                });
            }
          });
      }
    );
  };

  getBorrowMarketInfo = (asset) => {
    if (MoneyMarket() === undefined) {
      return;
    }
    let usdxAddress = '';
    let NetworkName = findNetwork(this.state.NetworkName);
    if (NetworkName === 'Main') {
      usdxAddress = Network.Main.USDx;
    } else if (NetworkName === 'Rinkeby') {
      usdxAddress = Network.Rinkeby.USDx;
    }
    MoneyMarket().markets.call(
      usdxAddress,
      (err, res) => {
        if (res === undefined || res === null) {
          return;
        }
        const newRes = [res[6], res[7], res[8]];
        const borrowInfo = newRes.map(amount => this.web3.fromWei(amount.toNumber(), "ether"))
        this.setState({ [`${asset}BorrowMarketInfo`]: borrowInfo })
      }
    );
  }


  // ***************** get_USDx_Allowance
  getUSDxAllowance = () => {
    if (typeof web3 === 'undefined' || this.web3.eth.accounts[0] === undefined || USDX() === undefined) {
      return;
    }
    let mmAddress = '';
    let NetworkName = findNetwork(this.state.NetworkName);
    if (NetworkName === 'Main') {
      mmAddress = Network.Main.MoneyMarket;
    } else if (NetworkName === 'Rinkeby') {
      mmAddress = Network.Rinkeby.MoneyMarket;
    }
    USDX().allowance(this.web3.eth.accounts[0], mmAddress, (err, res) => {
      if (res !== undefined && res !== null) {
        if (res.toNumber() > 0) {
          this.setState({
            usdxAllowance: res.toNumber(),
            isApproved: true,
            USDx_isApproved: 1
          }, () => {
            console.log(this.state.isApproved);
          });
        } else {
          this.setState({ isApproved: false, USDx_isApproved: 1 });
        }
      }
    });
  }

  getMyAddressUSDxBalance = () => {
    if (typeof web3 === 'undefined' || this.web3.eth.accounts[0] === undefined || USDX() === undefined) {
      return;
    }
    USDX().balanceOf(this.web3.eth.accounts[0], (err, res) => {
      let usdxBalance = 0;
      if (res !== undefined && res !== null) {
        usdxBalance = res.toNumber();
      }
      if (this.state.myAddressUSDxBalance !== Number(this.web3.fromWei(usdxBalance, "ether"))) {
        this.setState({
          myAddressUSDxBalance: Number(this.web3.fromWei(usdxBalance, "ether")),
          repayBorrowMax: false,
          isRepayBorrowEnable: true,
          repayBorrowAmount: '',
          repayButtonText: this.props.repayButtonInfo
        }, () => {
          // repay USDx的余额
          // console.log(this.state.myAddressUSDxBalance);
        });
      }
    });
  }

  handleApprove = () => {
    this.setState({ approveButtonInfo: 'ENABLEING USDx...', pendingApproval: true });
    let mmAddress = '';
    let NetworkName = findNetwork(this.state.NetworkName);
    if (NetworkName === 'Main') {
      mmAddress = Network.Main.MoneyMarket;
    } else if (NetworkName === 'Rinkeby') {
      mmAddress = Network.Rinkeby.MoneyMarket;
    }
    USDX().approve.estimateGas(mmAddress, -1, { from: this.web3.eth.accounts[0] }, (err, gasLimit) => {
      this.web3.eth.getGasPrice((err, gasPrice) => {
        console.log('gasLimit:' + gasLimit);
        console.log('gasPrice:' + gasPrice);
        USDX().approve(
          mmAddress,
          -1,
          {
            from: this.web3.eth.accounts[0],
            gas: gasLimit,
            gasPrice: gasPrice
          },
          (err, res) => {
            if (res !== undefined && res !== null) {
              let txId = res;
              let txnHashHref = getTxnHashHref(this.state.NetworkName) + res;
              this.setState({ getHash: true, hashNumber: res, pendingUSDxApproval: true });
              saveTransaction(
                'loading-borrow-approve',
                this.web3.eth.accounts[0],
                Asset['Asset'].USDx,
                this.props.page,
                this.state.NetworkName,
                'Enable',
                null,
                'USDx',
                txnHashHref,
                txId,
                0,
                null,
                false,
                null
              );
            } else {
              this.setState({ pendingApproval: false, approveButtonInfo: this.props.approveButtonInfo })
            }
          })
      }
      )
    });
  };

  handleBorrowClick = () => {
    let borrowAmount = this.state.borrowAmount;
    if (borrowAmount === '' || borrowAmount === null) {
      return;
    }
    this.setState({ isBorrowEnable: false, borrowButtonText: 'SUBMITTING…', borrowInputDisabled: true, borrowMaxClassName: 'max-amount-button-borrow-disable' });
    let usdxAddress = '';
    let NetworkName = findNetwork(this.state.NetworkName);
    if (NetworkName === 'Main') {
      usdxAddress = Network.Main.USDx;
    } else if (NetworkName === 'Rinkeby') {
      usdxAddress = Network.Rinkeby.USDx;
    }
    MoneyMarket().borrow.estimateGas(
      usdxAddress,
      this.web3.toWei(borrowAmount, "ether"),
      {
        from: this.web3.eth.accounts[0]
      },
      (err, gasLimit) => {
        console.log('gasLimit:' + gasLimit);
        this.web3.eth.getGasPrice((err, gasPrice) => {
          console.log('gasPrice:' + gasPrice);
          if (gasPrice === undefined && gasPrice === null) {
            console.err('gasPrice is ' + gasPrice)
            return;
          }
          MoneyMarket().borrow(
            usdxAddress,
            this.web3.toWei(borrowAmount, "ether"),
            {
              from: this.web3.eth.accounts[0],
              gas: gasLimit,
              gasPrice: gasPrice
            },
            (err, res) => {
              if (res !== undefined && res !== null) {
                let txId = res;
                let txnHashHref = getTxnHashHref(this.state.NetworkName) + res;
                let recordBorrowAmount = toDoubleThousands(this.state.borrowAmount);
                this.setState({ borrowtxhash: res });
                saveTransaction('loading-borrow', this.web3.eth.accounts[0], Asset['Asset'].USDx, this.props.page,
                this.state.NetworkName, 'Borrow', recordBorrowAmount, 'USDx', txnHashHref, txId, 0, this.web3.toWei(borrowAmount, "ether"), false, null);
              } else {
                this.setState({ isBorrowEnable: true, borrowInputDisabled: false });
              }
            }
          )
        }
        )
      }
    );
  };

  handleBorrowChange = (value) => {
    if (value === null || value === '') {
      this.setState({ isBorrowEnable: true });
      this.setState({ borrowButtonText: this.props.borrowButtonInfo });
      this.setState({ borrowAmount: '' });
      this.setState({ borrowMax: false });
      this.setState({ exceedsSafeMax: false });
      return;
    } else if (value.toString().length > 18) {
      let borrowButtonText = 'INSUFFICIENT LIQUIDITY';
      this.setState({ borrowAmount: value });
      this.setState({ isBorrowEnable: false });
      this.setState({ borrowButtonText: borrowButtonText });
      this.setState({ exceedsSafeMax: false });
      return;
    } else if (value > this.state.maxBorrowAmount && value <= this.state.usdxAvailableAmount) {
      // console.log('(value > this.state.maxBorrowAmount && value < this.state.usdxAvailableAmount) || (value === this.state.usdxAvailableAmount)')
      // console.log('===>value:' + value + ' maxBorrowAmount:' + this.state.maxBorrowAmount + ' usdxAvailableAmount:' + this.state.usdxAvailableAmount)
      this.setState({ isBorrowEnable: true });
      this.setState({ exceedsSafeMax: true });
    } else if (value > this.state.usdxAvailableAmount) {
      let borrowButtonText = 'INSUFFICIENT LIQUIDITY';
      this.setState({ borrowAmount: value });
      this.setState({ isBorrowEnable: false });
      this.setState({ borrowButtonText: borrowButtonText });
      this.setState({ exceedsSafeMax: false });
      return;
    } else {
      this.setState({ exceedsSafeMax: false });
    }
    if (value.toString().indexOf('.') === value.toString().length - 1) {
      value = value + '00'
    }
    this.setState({ borrowAmount: value });
    this.setState({ borrowMax: false });
    if ((!validNumber(value) && value !== '') || value === 0) {
      this.setState({ isBorrowEnable: false });
      this.setState({ borrowButtonText: this.props.borrowButtonInfo });
    } else {
      this.setState({ isBorrowEnable: true });
    }
  };

  handleBorrowMax = () => {
    this.setState({ borrowAmount: this.state.maxBorrowAmount });
    this.setState({ borrowMax: true });
    this.setState({ exceedsSafeMax: false });
    if (Number(this.state.maxBorrowAmount) === 0) {
      this.setState({ isBorrowEnable: false });
      this.setState({ borrowButtonText: this.props.borrowButtonInfo });
    } else {
      this.setState({ isBorrowEnable: true });
    }
  }

  handleRepayClick = () => {
    let repayBorrowAmount = this.state.repayBorrowAmount;
    if (repayBorrowAmount === '' || repayBorrowAmount === null) {
      return;
    }
    this.setState({ isRepayEnable: false });
    if (this.state.repayBorrowMax) {
      repayBorrowAmount = -1;
    }
    this.setState({ isRepayBorrowEnable: false, repayButtonText: 'SUBMITTING…', repayBorrowInputDisabled: true, repayBorrowMaxClassName: 'max-amount-button-borrow-disable' });
    let usdxAddress = '';
    let NetworkName = findNetwork(this.state.NetworkName);
    if (NetworkName === 'Main') {
      usdxAddress = Network.Main.USDx;
    } else if (NetworkName === 'Rinkeby') {
      usdxAddress = Network.Rinkeby.USDx;
    }
    MoneyMarket().repayBorrow.estimateGas(
      usdxAddress,
      repayBorrowAmount === -1 ? -1 : this.web3.toWei(repayBorrowAmount, "ether"),
      {
        from: this.web3.eth.accounts[0]
      },
      (err, gasLimit) => {
        console.log('gasLimit:' + gasLimit);
        this.web3.eth.getGasPrice((err, gasPrice) => {
          console.log('gasPrice:' + gasPrice);
          if (gasPrice === undefined && gasPrice === null) {
            console.err('gasPrice is ' + gasPrice)
            return;
          }
          MoneyMarket().repayBorrow(
            usdxAddress,
            repayBorrowAmount === -1 ? -1 : this.web3.toWei(repayBorrowAmount, "ether"),
            {
              from: this.web3.eth.accounts[0],
              gas: gasLimit,
              gasPrice: gasPrice
            },
            (err, res) => {
              if (res !== undefined && res !== null) {
                let txId = res;
                let txnHashHref = getTxnHashHref(this.state.NetworkName) + res;
                let recordRepayBorrowAmount = toDoubleThousands(this.state.repayBorrowAmount);
                saveTransaction('loading-borrow-repay', this.web3.eth.accounts[0], Asset['Asset'].USDx,
                  this.props.page, this.state.NetworkName, 'Repay', recordRepayBorrowAmount, 'USDx', txnHashHref, txId, 0, repayBorrowAmount === -1 ? -1 : this.web3.toWei(repayBorrowAmount, "ether"), false, null);
              } else {
                this.setState({ isRepayBorrowEnable: true, repayBorrowInputDisabled: false });
              }
            }
          )
        }
        )
      }
    );
  }

  handleRepayChange = (value) => {
    if (value === null || value === '') {
      this.setState({ isRepayBorrowEnable: true });
      this.setState({ repayButtonText: this.props.repayButtonInfo });
      this.setState({ repayBorrowAmount: '' });
      this.setState({ repayBorrowMax: false });
      return;
    } else if (value.toString().length > 18 || (value > this.state.maxRepayBorrowAmount && !isNaN(value))) {
      // let repayButtonText= 'INSUFFICIENT BALANCE';
      this.setState({ repayBorrowAmount: value });
      this.setState({ isRepayBorrowEnable: false });
      this.setState({ repayButtonText: this.props.repayButtonInfo });
      return;
    } else if (value > this.state.myAddressUSDxBalance) {
      let repayButtonText = 'INSUFFICIENT BALANCE';
      this.setState({ repayBorrowAmount: value });
      this.setState({ isRepayBorrowEnable: false });
      this.setState({ repayButtonText: repayButtonText });
      return;
    }
    if (value.toString().indexOf('.') === value.toString().length - 1) {
      value = value + '00'
    }
    this.setState({ repayBorrowAmount: value });
    this.setState({ repayBorrowMax: false });
    if ((!validNumber(value) && value !== '') || value === 0) {
      this.setState({ isRepayBorrowEnable: false });
      this.setState({ repayButtonText: this.props.repayButtonInfo });
    } else {
      this.setState({ isRepayBorrowEnable: true });
    }
  }

  handleRepayMax = () => {
    this.setState({ repayBorrowAmount: this.state.maxRepayBorrowAmount, repayBorrowMax: true });

    if (Number(this.state.maxRepayBorrowAmount) === 0) {
      this.setState({ isRepayBorrowEnable: false });
      this.setState({ repayButtonText: this.props.repayButtonInfo });
    } else if (this.state.maxRepayBorrowAmount > this.state.myAddressUSDxBalance) {
      this.setState({ isRepayBorrowEnable: false });
      this.setState({ repayButtonText: 'INSUFFICIENT BALANCE' });
    } else {
      this.setState({ isRepayBorrowEnable: true });
    }
  }


  getBorrowBalance = () => {
    if (window.web3 !== undefined && this.web3.eth.accounts[0] !== undefined && MoneyMarket() !== undefined) {
      let usdxAddress = '';
      let NetworkName = findNetwork(this.state.NetworkName);
      if (NetworkName === 'Main') {
        usdxAddress = Network.Main.USDx;
      } else if (NetworkName === 'Rinkeby') {
        usdxAddress = Network.Rinkeby.USDx;
      }
      MoneyMarket().getBorrowBalance(this.web3.eth.accounts[0], usdxAddress, (err, res) => {
        let borrowBalance = 0;
        if (res !== undefined && res !== null) {
          borrowBalance = res.toNumber();
        }
        if (this.state.borrowedUSDxBalance !== this.web3.fromWei(borrowBalance, "ether")) {
          this.setState({ borrowedUSDxBalance: this.web3.fromWei(borrowBalance, "ether") });
        }
        if (this.state.maxRepayBorrowAmount !== this.web3.fromWei(borrowBalance, "ether")) {
          this.setState({ maxRepayBorrowAmount: this.web3.fromWei(borrowBalance, "ether") });
        }
      });
    }
  };

  // USDx Available ( cash ) 
  getUSDxBalance = () => {
    if (USDX() === undefined) {
      return;
    }
    let mmAddress = '';
    let NetworkName = findNetwork(this.state.NetworkName);
    if (NetworkName === 'Main') {
      mmAddress = Network.Main.MoneyMarket;
    } else if (NetworkName === 'Rinkeby') {
      mmAddress = Network.Rinkeby.MoneyMarket;
    }
    USDX().balanceOf(
      mmAddress,
      (err, res) => {
        let balance = 0;
        if (res !== undefined && res !== null) {
          balance = res.toNumber();
        }
        if (this.state.usdxBalance !== toFormatShowNumber(this.web3.fromWei(balance, "ether"))) {
          this.setState({ usdxBalance: toFormatShowNumber(this.web3.fromWei(balance, "ether")) }, () => {
            // console.log(this.state.usdxBalance);
          });
        }
      });
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
        if (this.state.USDXPersonalBalance !== usdxBalance) {
          this.setState({ USDXPersonalBalance: usdxBalance })
        }
      }
    );
  }

  getOriginationFee = () => {
    if (MoneyMarket() === undefined) {
      return;
    }
    MoneyMarket().originationFee((err, res) => {
      let originationFeeRes = 0;
      if (res === undefined || res === null) {
        return;
      }
      originationFeeRes = formatBigNumber(res);
      if (this.state.originationFee !== originationFeeRes)
        this.setState({ originationFee: originationFeeRes });
    });
  }

  getAccountBalance = () => {
    if (window.web3 === undefined || this.web3.eth.accounts[0] === undefined || MoneyMarket() === undefined) {
      return;
    }
    let usdxAddress = '';
    let NetworkName = findNetwork(this.state.NetworkName);
    if (NetworkName === 'Main') {
      usdxAddress = Network.Main.USDx;
    } else if (NetworkName === 'Rinkeby') {
      usdxAddress = Network.Rinkeby.USDx;
    }
    MoneyMarket().getBorrowBalance(
      this.web3.eth.accounts[0],
      usdxAddress,
      (err, res) => {
        if (res === undefined || res === null) {
          return;
        }
        res = formatBigNumber(res);
        let sumofSupplies = this.state.supplyWETHAmount * this.state.WETHAssetPrice;
        let sumofBorrow = res;
        let availableToBorrow = sumofSupplies / this.state.collateralRatio - sumofBorrow;
        // console.log('sumofSupplies:' + sumofSupplies + ' / sumofBorrow:' + sumofBorrow + ' / cash:' + this.state.cash)
        let availableBorrowAmount = Math.min(availableToBorrow, this.state.cash);

        if (Number(availableBorrowAmount) < 0) {
          availableBorrowAmount = 0;
        }

        if (Number(availableBorrowAmount) === Number(this.state.cash)) {
          availableBorrowAmount = this.state.cash;
        } else if (Number(availableBorrowAmount) === Number(availableToBorrow)) {
          availableBorrowAmount = availableBorrowAmount / (1 + Number(this.state.originationFee));
        }

        // console.log('borrow_input---', this.state.usdxAvailableAmount, availableToBorrow, this.state.cash);

        if (this.state.usdxAvailableAmount !== availableBorrowAmount) {
          this.setState({ usdxAvailableAmount: availableBorrowAmount }, () => {
            // console.log('borrow_input---', this.state.usdxAvailableAmount, availableToBorrow, this.state.cash);
          })
        }
      }
    )
  }

  getCurrentSupplyWETHAmount = () => {
    if (window.web3 !== undefined && this.web3.eth.accounts[0] !== undefined && MoneyMarket() !== undefined) {
      let wethAddress = '';
      let NetworkName = findNetwork(this.state.NetworkName);
      if (NetworkName === 'Main') {
        wethAddress = Network.Main.WETH;
      } else if (NetworkName === 'Rinkeby') {
        wethAddress = Network.Rinkeby.WETH;
      }
      MoneyMarket().getSupplyBalance(this.web3.eth.accounts[0],
        wethAddress,
        (err, res) => {
          if (res !== undefined && res !== null && this.state.supplyWETHAmount !== this.web3.fromWei(res.toNumber(), "ether")) {
            this.setState({ supplyWETHAmount: this.web3.fromWei(res.toNumber(), "ether") });
          }
        }
      );
    }
  }

  getWETHAssetPrice = () => {
    //weth价格修改
    if (MoneyMarket() === undefined) {
      return;
    }
    let wethAddress = '';
    let NetworkName = findNetwork(this.state.NetworkName);
    if (NetworkName === 'Main') {
      wethAddress = Network.Main.WETH;
    } else if (NetworkName === 'Rinkeby') {
      wethAddress = Network.Rinkeby.WETH;
    }
    MoneyMarket().assetPrices(wethAddress, (err, res) => {
      if (res !== undefined && res !== null) {
        if (this.state.usdxAssetPrice !== 0 && res.toNumber() !== 0 && this.state.WETHAssetPrice !== this.web3.fromWei(res.toNumber(), "ether") / this.state.usdxAssetPrice) {
          this.setState({
            WETHAssetPrice: this.web3.fromWei(res.toNumber(), "ether") / this.state.usdxAssetPrice
          });
        }
      }
    });
  }

  getUSDxAssetPrice = () => {
    if (MoneyMarket() === undefined) {
      return;
    }
    let usdxAddress = '';
    let NetworkName = findNetwork(this.state.NetworkName);
    if (NetworkName === 'Main') {
      usdxAddress = Network.Main.USDx;
    } else if (NetworkName === 'Rinkeby') {
      usdxAddress = Network.Rinkeby.USDx;
    }
    MoneyMarket().assetPrices(usdxAddress, (err, res) => {
      if (res !== undefined && res !== null && this.state.usdxAssetPrice !== this.web3.fromWei(res.toNumber(), "ether")) {
        this.setState({
          usdxAssetPrice: this.web3.fromWei(res.toNumber(), "ether")
        });
      }
    });
  }

  getCash = () => {
    if (USDX() === undefined) {
      return;
    }
    let mmAddress = '';
    let NetworkName = findNetwork(this.state.NetworkName);
    if (NetworkName === 'Main') {
      mmAddress = Network.Main.MoneyMarket;
    } else if (NetworkName === 'Rinkeby') {
      mmAddress = Network.Rinkeby.MoneyMarket;
    }
    USDX().balanceOf(mmAddress, (err, res) => {
      let cash = 0;
      if (res !== undefined && res !== null) {
        cash = res.toNumber();
      }
      if (this.state.cash !== toFormatShowNumber(this.web3.fromWei(cash, "ether"))) {
        this.setState({ cash: toFormatShowNumber(this.web3.fromWei(cash, "ether")) })
      }
    });
  }

  refreshData = () => {
    this.getCollateralRatio();
    this.getWETHAssetPrice();
    this.getCurrentSupplyWETHAmount();
    this.getUSDxAssetPrice();
    this.getCash();
    this.getUSDxAllowance();
    this.getBorrowBalance();
    this.getMyAddressUSDxBalance();
    this.getBorrowMarketInfo('USDx');
    this.getBorrowMarketInfo('WETH');
    this.getAccountBalance();
    this.getUSDxBalance();
    this.getMaxBorrowAmount();
    this.getAccountUSDXBalanceByAddress();
  }

  refreshDataEventMonitor = () => {
    if (MoneyMarket() === undefined) {
      return;
    }
    MoneyMarket().allEvents({ toBlock: 'latest' }).watch((error, result) => {
      if (error) {
        console.log('watch error --> ' + JSON.stringify(error));
        return;
      }
      let eventObj = JSON.parse(JSON.stringify(result));
      let event = eventObj.event;
      // console.log('refreshDataEventMonitor eventObj:' + JSON.stringify(result))
      if (event === 'BorrowTaken' || event === 'BorrowRepaid' || event === 'SupplyReceived' || event === 'SupplyWithdrawn') {
        this.getCurrentSupplyWETHAmount();
        this.getWETHAssetPrice();
        this.getUSDxAssetPrice();
        this.getCash();
        this.getAccountBalance();
        this.getMaxBorrowAmount();
        this.getBorrowBalance();

        this.setState({ borrowAmount: null, borrowMax: false, exceedsSafeMax: false, isBorrowEnable: true, repayBorrowAmount: null, isRepayEnable: true, repayBorrowMax: false, isRepayBorrowEnable: true });
      }
    });
  }

  mmEventMonitor = () => {
    if (MoneyMarket() === undefined) {
      return;
    }
    let that = this;
    var borrowTakenEvent = MoneyMarket().BorrowTaken();
    borrowTakenEvent.watch((error, result) => {
      console.log('watch -> borrowTakenEvent:' + JSON.stringify(result));
      if (error) {
        console.log('watch mmEventMonitor borrowTakenEvent error --> ' + JSON.stringify(error));
        return;
      }
      var storage = null;
      var results = null;
      var key = null;
      if (window.localStorage) {
        if (typeof web3 === 'undefined') {
          return;
        }
        storage = window.localStorage;
        key = getTransactionHistoryKey(that.props.account, Asset['Asset'].USDx, that.props.page, that.state.NetworkName);
        results = JSON.parse(`${storage.getItem(key)}`);
      }
      if (results === null) {
        return;
      }
      let resultObj = JSON.parse(JSON.stringify(result));
      var txId = resultObj.transactionHash;
      that.setState({ borrowAmount: null, isBorrowEnable: true, borrowMax: false, exceedsSafeMax: false, borrowInputDisabled: false, borrowMaxClassName: 'max-amount-button-borrow' });
      storage.removeItem(key);
      let argsObj = JSON.parse(JSON.stringify(resultObj.args));
      results = results.map(item => {
        // check is speed up
        if (item.status === 0 && item.transactionType === 'Borrow' && item.realAmount === argsObj.amount && item.txId !== txId) {
          let txnHashHref = getTxnHashHref(that.state.NetworkName) + txId;
          return {
            ...item,
            icon: 'borrow',
            status: 1,
            txId: txId,
            txnHashHref: txnHashHref
          }
        } else if (item.txId === txId) {
          return {
            ...item,
            icon: 'borrow',
            status: 1
          }
        }
        return {
          ...item
        }
      })
      storage.setItem(key, JSON.stringify(results));
    });

    var borrowRepaidEvent = MoneyMarket().BorrowRepaid();
    borrowRepaidEvent.watch((error, result) => {
      console.log('watch -> borrowRepaidEvent:' + JSON.stringify(result));
      if (error) {
        console.log('watch mmEventMonitor borrowRepaidEvent error --> ' + JSON.stringify(error));
        return;
      }
      var storage = null;
      var results = null;
      var key = null;
      if (window.localStorage) {
        if (typeof web3 === 'undefined') {
          return;
        }
        storage = window.localStorage;
        key = getTransactionHistoryKey(that.props.account, Asset['Asset'].USDx, that.props.page, that.state.NetworkName);
        results = JSON.parse(`${storage.getItem(key)}`);
      }
      if (results === null) {
        return;
      }
      let resultObj = JSON.parse(JSON.stringify(result));
      var txId = resultObj.transactionHash;
      this.setState({ isRepayBorrowEnable: true, repayBorrowAmount: null, isBorrowEnable: true, borrowAmount: null, repayBorrowInputDisabled: false, repayBorrowMaxClassName: 'max-amount-button-borrow' });
      this.setState({ isRepayEnable: true, repayBorrowMax: false });
      storage.removeItem(key);
      let argsObj = JSON.parse(JSON.stringify(resultObj.args));
      results = results.map(item => {
        // check is speed up
        if (item.status === 0 && item.transactionType === 'Repay' && item.realAmount === argsObj.amount && item.txId !== txId) {
          let txnHashHref = getTxnHashHref(that.state.NetworkName) + txId;
          return {
            ...item,
            icon: 'borrow',
            status: 1,
            txId: txId,
            txnHashHref: txnHashHref
          }
        } else if (item.txId === txId) {
          return {
            ...item,
            icon: 'repay',
            status: 1
          }
        }
        return {
          ...item
        }
      })
      storage.setItem(key, JSON.stringify(results));
    });

    var failureEvent = MoneyMarket().Failure();
    failureEvent.watch(function (error, result) {
      console.log('watch -> failureEvent:' + JSON.stringify(result));
      if (error) {
        console.log('watch mmEventMonitor failureEvent error --> ' + JSON.stringify(error));
        return;
      }
      var storage = null;
      var results = null;
      var key = null;
      if (window.localStorage) {
        if (typeof web3 === 'undefined') {
          return;
        }
        storage = window.localStorage;
        key = getTransactionHistoryKey(that.props.account, Asset['Asset'].USDx, that.props.page, that.state.NetworkName);
        results = JSON.parse(`${storage.getItem(key)}`);
      }
      if (results === null) {
        return;
      }
      let resultObj = JSON.parse(JSON.stringify(result));
      var txId = resultObj.transactionHash;
      that.setState({ isBorrowEnable: true, borrowAmount: null, borrowMax: false, borrowInputDisabled: false, borrowMaxClassName: 'max-amount-button-borrow' });
      that.setState({ isRepayEnable: true, repayBorrowAmount: null, repayBorrowMax: false, repayBorrowInputDisabled: false, repayBorrowMaxClassName: 'max-amount-button-borrow' });
      // change icon and status = 1 by txId
      storage.removeItem(key);
      results = results.map(item => {
        if (item.txId === txId) {
          let errorArgs = resultObj.args;
          let argsObj = JSON.parse(JSON.stringify(errorArgs));
          console.log('borrow failure info:' + ErrorCode[argsObj.error]);
          return {
            ...item,
            icon: 'failure',
            status: 1,
            failed: true,
            failedInfo: ErrorCode[argsObj.error]
          }
        }
        return {
          ...item
        }
      })
      storage.setItem(key, JSON.stringify(results));
    });
  }

  usdxEventMonitor = () => {
    if (USDX() === undefined) {
      return;
    }
    let that = this;
    var approvalUSDXEvent = USDX().Approval();
    approvalUSDXEvent.watch((error, result) => {
      console.log('watch borrow-> approvalUSDXEvent:' + JSON.stringify(result));
      if (error) {
        console.log('watch borrow usdxEventMonitor approvalUSDXEvent error --> ' + JSON.stringify(error));
        return;
      }
      var storage = null;
      var results = null;
      var key = null;
      if (window.localStorage) {
        if (typeof web3 === 'undefined') {
          return;
        }
        storage = window.localStorage;
        key = getTransactionHistoryKey(that.props.account, Asset['Asset'].USDx, that.props.page, that.state.NetworkName);
        results = JSON.parse(`${storage.getItem(key)}`);
      }
      if (results === null) {
        return;
      }
      let resultObj = JSON.parse(JSON.stringify(result));
      var txId = resultObj.transactionHash;
      that.getUSDxAllowance();
      that.setState({ pendingApproval: false, isApproved: true });
      // change icon and status = 1 by txId
      storage.removeItem(key);
      results = results.map(item => {
        if (item.status === 0 && item.transactionType === 'Enable' && item.txId !== txId) {
          let txnHashHref = getTxnHashHref(that.state.NetworkName) + txId;
          return {
            ...item,
            icon: 'done',
            status: 1,
            txId: txId,
            txnHashHref: txnHashHref
          }
        } else if (item.txId === txId) {
          return {
            ...item,
            icon: 'done',
            status: 1
          }
        }
        return {
          ...item
        }
      })
      storage.setItem(key, JSON.stringify(results));
    });
  }

  //check
  checkWaitingUpdateTransactionRecords = () => {
    var storage = null;
    var results = null;
    var key = null;
    if (window.localStorage) {
      if (typeof web3 === 'undefined') {
        return;
      }
      storage = window.localStorage;
      key = getTransactionHistoryKey(this.web3.eth.accounts[0], Asset['Asset'].USDx, this.props.page, this.state.NetworkName);
      results = JSON.parse(`${storage.getItem(key)}`);
    }
    if (results === null) {
      return;
    }
    storage.removeItem(key);
    results = results.map(item => {
      if (item.icon === 'loading-borrow') {
        if (this.state.borrowUSDxWaitUpdateForSuccessMap.get(item.txId) !== undefined) {
          this.setState({ isBorrowEnable: true, borrowInputDisabled: false });
          //imtoken用
          if (window.ethereum.isImToken !== undefined && window.ethereum.isImToken === true) {
            this.setState({ borrowAmount: null, isBorrowEnable: true, borrowMax: false, exceedsSafeMax: false, borrowInputDisabled: false, borrowMaxClassName: 'max-amount-button-borrow' });
          }
          return {
            ...item,
            icon: 'borrow',
            status: 1
          }
        }
        if (this.state.borrowUSDxWaitUpdateForFailedMap.get(item.txId) !== undefined) {
          this.setState({ isBorrowEnable: true, borrowInputDisabled: false });
          //imtoken用
          if (window.ethereum.isImToken !== undefined && window.ethereum.isImToken === true) {
            this.setState({ borrowAmount: null, isBorrowEnable: true, borrowMax: false, exceedsSafeMax: false, borrowInputDisabled: false, borrowMaxClassName: 'max-amount-button-borrow' });
          }
          return {
            ...item,
            icon: 'failure',
            status: 1,
            failed: true,
            failedInfo: 'BORROW USDx FAILURE'
          }
        }
        //超时则取消控件限制
        if (this.state.borrowUSDxWaitUpdateTimeOutMap.get(item.txId) !== undefined) {
          return {
            ...item,
            timeOutFlag: 1
          }
        }
      }

      if (item.icon === 'loading-borrow-repay') {
        if (this.state.repayUSDxWaitUpdateForSuccessMap.get(item.txId) !== undefined) {
          this.setState({ isRepayBorrowEnable: true, repayBorrowInputDisabled: false });
          //imtoken用
          if (window.ethereum.isImToken !== undefined && window.ethereum.isImToken === true) {
            this.setState({ isRepayBorrowEnable: true, repayBorrowAmount: null, isBorrowEnable: true, borrowAmount: null, repayBorrowInputDisabled: false, repayBorrowMaxClassName: 'max-amount-button-borrow' });
            this.setState({ isRepayEnable: true, repayBorrowMax: false });
          }
          return {
            ...item,
            icon: 'borrow',
            status: 1
          }
        }
        if (this.state.repayUSDxWaitUpdateForFailedMap.get(item.txId) !== undefined) {
          this.setState({ isRepayBorrowEnable: true, repayBorrowInputDisabled: false });
          //imtoken用
          if (window.ethereum.isImToken !== undefined && window.ethereum.isImToken === true) {
            this.setState({ isRepayBorrowEnable: true, repayBorrowAmount: null, isBorrowEnable: true, borrowAmount: null, repayBorrowInputDisabled: false, repayBorrowMaxClassName: 'max-amount-button-borrow' });
            this.setState({ isRepayEnable: true, repayBorrowMax: false });
          }
          return {
            ...item,
            icon: 'failure',
            status: 1,
            failed: true,
            failedInfo: 'REPAY USDx FAILURE'
          }
        }
        //超时则取消控件限制
        if (this.state.repayUSDxWaitUpdateTimeOutMap.get(item.txId) !== undefined) {
          return {
            ...item,
            timeOutFlag: 1
          }
        }
      }

      if (item.icon === 'loading-borrow-approve') {
        if (this.state.enableUSDxWaitUpdateForSuccessMap.get(item.txId) !== undefined) {
          this.setState({ pendingApproval: false });
          //imtoken用
          if (window.ethereum.isImToken !== undefined && window.ethereum.isImToken === true) {
            this.getUSDxAllowance();
            this.setState({ pendingApproval: false, isApproved: true });
          }
          return {
            ...item,
            icon: 'done',
            status: 1
          }
        }
        if (this.state.enableUSDxWaitUpdateForFailedMap.get(item.txId) !== undefined) {
          this.setState({ pendingApproval: false });
          //imtoken用
          if (window.ethereum.isImToken !== undefined && window.ethereum.isImToken === true) {
            this.getUSDxAllowance();
            this.setState({ pendingApproval: false, isApproved: true });
          }
          return {
            ...item,
            icon: 'failure',
            status: 1,
            failed: true,
            failedInfo: 'ENABLE USDx FAILURE'
          }
        }
        //超时则取消控件限制
        if (this.state.enableUSDxWaitUpdateTimeOutMap.get(item.txId) !== undefined) {
          return {
            ...item,
            timeOutFlag: 1
          }
        }
      }

      return {
        ...item
      }
    })
    storage.setItem(key, JSON.stringify(results));
  }

  checkTransactionsStatus = () => {
    var storage = null;
    var results = null;
    var key = null;
    if (window.localStorage) {
      if (typeof web3 === 'undefined') {
        return;
      }
      storage = window.localStorage;
      key = getTransactionHistoryKey(this.web3.eth.accounts[0], Asset['Asset'].USDx, this.props.page, this.state.NetworkName);
      results = JSON.parse(`${storage.getItem(key)}`);
    }
    if (results === null) {
      return;
    }
    results.map(item => {
      if (item.icon === 'loading-borrow') {
        //超时则取消控件限制
        if (item.timestamp !== undefined && diffMin(item.timestamp) >= this.state.timeOutTimes && item.timeOutFlag !== undefined && item.timeOutFlag === 1) {
          return 0;
        }
        if (item.status === 0) {
          //超时则取消控件限制
          let timeOutFlag = -1;
          if (item.timestamp !== undefined && diffMin(item.timestamp) >= this.state.timeOutTimes && item.timeOutFlag !== undefined && item.timeOutFlag !== 1) {
            timeOutFlag = 1;
            this.setState({ isBorrowEnable: true, borrowAmount: '', borrowMax: false, exceedsSafeMax: false, buttonText: this.props.borrowButtonInfo, borrowInputDisabled: false, borrowMaxClassName: 'max-amount-button-borrow' });
          } else {
            this.setState({ isBorrowEnable: false, borrowButtonText: 'SUBMITTING…', borrowInputDisabled: true, borrowMaxClassName: 'max-amount-button-borrow-disable' });
          }
          let flag = -1;
          this.web3.eth.getTransactionReceipt(item.txId, (err, data) => {
            if (data && data.status === '0x1') { // success
              flag = 1;
            }
            if (data && data.status === '0x0') { // failed
              flag = 0;
            }
          });
          setTimeout(() => {
            if (flag === 1) {
              if (this.state.borrowUSDxWaitUpdateForSuccessMap.get(item.txId) === undefined) {
                this.state.borrowUSDxWaitUpdateForSuccessMap.set(item.txId, item);
              }
            }
            if (flag === 0) {
              if (this.state.borrowUSDxWaitUpdateForFailedMap.get(item.txId) === undefined) {
                this.state.borrowUSDxWaitUpdateForFailedMap.set(item.txId, item);
              }
            }
            //超时则取消控件限制
            if (timeOutFlag === 1) {
              if (this.state.borrowUSDxWaitUpdateTimeOutMap.get(item.txId) === undefined) {
                this.state.borrowUSDxWaitUpdateTimeOutMap.set(item.txId, item);
              }
            }
          }, 3000);
        } else {
          this.setState({ isBorrowEnable: true, borrowInputDisabled: false });
        }
      }
      if (item.icon === 'loading-borrow-repay') {
        //超时则取消控件限制
        if (item.timestamp !== undefined && diffMin(item.timestamp) >= this.state.timeOutTimes && item.timeOutFlag !== undefined && item.timeOutFlag === 1) {
          return 0;
        }
        if (item.status === 0) {
          //超时则取消控件限制
          let timeOutFlag = -1;
          if (item.timestamp !== undefined && diffMin(item.timestamp) >= this.state.timeOutTimes && item.timeOutFlag !== undefined && item.timeOutFlag !== 1) {
            timeOutFlag = 1;
            this.setState({ repayBorrowMax: false, isRepayBorrowEnable: true, repayBorrowAmount: '', buttonText: this.props.repayButtonInfo, repayBorrowInputDisabled: false, repayBorrowMaxClassName: 'max-amount-button-borrow' });
          } else {
            this.setState({ isRepayBorrowEnable: false, repayButtonText: 'SUBMITTING…', repayBorrowInputDisabled: true, repayBorrowMaxClassName: 'max-amount-button-borrow-disable' });
          }
          let flag = -1;
          this.web3.eth.getTransactionReceipt(item.txId, (err, data) => {
            if (data && data.status === '0x1') { // success
              flag = 1;
            }
            if (data && data.status === '0x0') { // failed
              flag = 0;
            }
          });
          setTimeout(() => {
            if (flag === 1) {
              if (this.state.repayUSDxWaitUpdateForSuccessMap.get(item.txId) === undefined) {
                this.state.repayUSDxWaitUpdateForSuccessMap.set(item.txId, item);
              }
            }
            if (flag === 0) {
              if (this.state.repayUSDxWaitUpdateForFailedMap.get(item.txId) === undefined) {
                this.state.repayUSDxWaitUpdateForFailedMap.set(item.txId, item);
              }
            }
            //超时则取消控件限制
            if (timeOutFlag === 1) {
              if (this.state.repayUSDxWaitUpdateTimeOutMap.get(item.txId) === undefined) {
                this.state.repayUSDxWaitUpdateTimeOutMap.set(item.txId, item);
              }
            }
          }, 3000);
        } else {
          this.setState({ isRepayBorrowEnable: true, repayBorrowInputDisabled: false });
        }
      }
      if (item.icon === 'loading-borrow-approve') {
        //超时则取消控件限制
        if (item.timestamp !== undefined && diffMin(item.timestamp) >= this.state.timeOutTimes && item.timeOutFlag !== undefined && item.timeOutFlag === 1) {
          return 0;
        }
        if (item.status === 0) {
          //超时则取消控件限制
          let timeOutFlag = -1;
          if (item.timestamp !== undefined && diffMin(item.timestamp) >= this.state.timeOutTimes && item.timeOutFlag !== undefined && item.timeOutFlag !== 1) {
            timeOutFlag = 1;
            this.setState({ approveButtonInfo: this.props.approveButtonInfo, pendingApproval: false });
          } else {
            this.setState({ approveButtonInfo: 'ENABLEING USDx...', pendingApproval: true });
          }

          let flag = -1;
          this.web3.eth.getTransactionReceipt(item.txId, (err, data) => {
            if (data && data.status === '0x1') { // success
              flag = 1;
            }
            if (data && data.status === '0x0') { // failed
              flag = 0;
            }
          });
          setTimeout(() => {
            if (flag === 1) {
              if (this.state.enableUSDxWaitUpdateForSuccessMap.get(item.txId) === undefined) {
                this.state.enableUSDxWaitUpdateForSuccessMap.set(item.txId, item);
              }
            }
            if (flag === 0) {
              if (this.state.enableUSDxWaitUpdateForFailedMap.get(item.txId) === undefined) {
                this.state.enableUSDxWaitUpdateForFailedMap.set(item.txId, item);
              }
            }
            //超时则取消控件限制
            if (timeOutFlag === 1) {
              if (this.state.enableUSDxWaitUpdateTimeOutMap.get(item.txId) === undefined) {
                this.state.enableUSDxWaitUpdateTimeOutMap.set(item.txId, item);
              }
            }
          }, 3000);
        } else {
          this.setState({ pendingApproval: false });
        }
      }
      return item.id;
    })
  }

  componentDidMount_temp = () => {
    // this.refreshDataEventMonitor();//imtoken测试临时注释
    // this.usdxEventMonitor();//imtoken测试临时注释
    // this.mmEventMonitor();//imtoken测试临时注释
    //非imtoken用 ，否则用imtoken测试临时注释
    if (window.web3 !== undefined && window.ethereum.isImToken === undefined) {
      this.refreshDataEventMonitor();
      this.usdxEventMonitor();
      this.mmEventMonitor();
    }

    // Recent Transactions status = 0
    this.checkTransactionsStatusTimer = setInterval(() => {
      this.checkTransactionsStatus();
    }, 1000);
    //check
    this.checkWaitingUpdateTimer = setInterval(() => {
      this.checkWaitingUpdateTransactionRecords();
    }, 1000 * 15);

    this.getOriginationFee();
    this.refreshMaxData = setInterval(() => {
      this.getCollateralRatio();
      this.getWETHAssetPrice();
      this.getUSDxAssetPrice();
      this.getCurrentSupplyWETHAmount();
      this.getCash();
      this.getBorrowBalance();
      this.getMyAddressUSDxBalance();
      this.getAccountBalance();
      this.getUSDxBalance();
      this.getMaxBorrowAmount();
      this.getAccountUSDXBalanceByAddress();
      this.getOriginationFee();
    }, 1000 * 5)

    // Initial Loading Component Info 
    this.refreshData();
  }

  // ***** 华丽的分割线 ***** ***** 华丽的分割线 ***** ***** 华丽的分割线 ***** ***** 华丽的分割线 ***** ***** 华丽的分割线 ***** ***** 华丽的分割线 ***** ***** 华丽的分割线 *****


  get_Borrow_Balance = () => {
    if (typeof web3 !== 'undefined' && this.web3.eth.accounts[0] !== undefined && MoneyMarket() !== undefined) {
      let usdxAddress = '';
      let NetworkName = findNetwork(this.state.NetworkName);
      if (NetworkName === 'Main') {
        usdxAddress = Network.Main.USDx;
      } else if (NetworkName === 'Rinkeby') {
        usdxAddress = Network.Rinkeby.USDx;
      }
      MoneyMarket().getBorrowBalance(this.web3.eth.accounts[0], usdxAddress, (err, res_borrowed_BN) => {
        if (res_borrowed_BN) {
          this.setState({ my_borrowed_usdx: this.web3.fromWei(res_borrowed_BN.toNumber(), "ether") });
        }
      });
    }
  };





  componentWillUnmount() {
    clearInterval(this.availableTimer);
    clearInterval(this.getAddressIntervalBorrow);
    clearInterval(this.accountInterval);
    clearInterval(this.refreshMaxData);
    clearInterval(this.checkTransactionsStatusTimer);
    clearInterval(this.checkWaitingUpdateTimer);
  }


  render() {
    const approveProps = {
      enableMessage: `Before Borrowing ${this.props.balanceType} for the first time, you must enable ${this.props.balanceType}.`,
      isEnable: !this.state.pendingApproval,
      buttonInfo: this.state.approveButtonInfo,
      handleClick: this.handleApprove,
      page: this.props.page
    };
    const borrowProps = {
      balanceDescription: '',
      // balanceAmount: this.state.accountBalance,
      balanceAmount: this.state.usdxAvailableAmount,
      balanceType: this.props.balanceType,
      balanceUnit: 'Available',
      minAmount: 0,
      maxAmount: this.state.maxBorrowAmount,
      step: 0.01,
      amount: this.state.borrowAmount,
      isEnable: this.state.isBorrowEnable,
      inputDisabled: this.state.borrowInputDisabled,
      // isEnable: this.state.isApproved,
      // buttonInfo: this.props.borrowButtonInfo,
      buttonInfo: this.state.isBorrowEnable ? this.props.borrowButtonInfo : this.state.borrowButtonText,
      handleChange: this.handleBorrowChange,
      handleClick: this.handleBorrowClick,
      handleMax: this.handleBorrowMax,
      hasLendUSDx: this.props.hasLendUSDx,
      placeholderHint: 'Amount in ' + this.props.balanceType,
      buttonClassName: 'button-wrapper-borrow',
      safeMax: 'SAFE ',
      exceedsSafeMax: this.state.exceedsSafeMax,
      maxClassName: this.state.borrowMaxClassName
    };
    const repayProps = {
      balanceDescription: '',
      balanceAmount: this.state.USDXPersonalBalance,//////
      balanceType: this.props.balanceType,
      balanceUnit: 'Balance',
      minAmount: 0,
      maxAmount: this.state.maxRepayBorrowAmount,
      step: 0.01,
      amount: this.state.repayBorrowAmount,
      isEnable: this.state.isRepayBorrowEnable,
      inputDisabled: this.state.repayBorrowInputDisabled,
      // isEnable: this.state.isRepayEnable,
      // isEnable: this.state.isApproved,
      // buttonInfo: this.props.repayButtonInfo,
      buttonInfo: this.state.isRepayBorrowEnable ? this.props.repayButtonInfo : this.state.repayButtonText,
      handleChange: this.handleRepayChange,
      handleClick: this.handleRepayClick,
      handleMax: this.handleRepayMax,
      hasLendUSDx: this.props.hasLendUSDx,
      placeholderHint: 'Amount in ' + this.props.balanceType,
      buttonClassName: 'button-wrapper-borrow',
      maxClassName: this.state.repayBorrowMaxClassName
    };

    return (
      <IntlProvider locale={'en'} messages={navigator.language === 'zh-CN' ? zh_CN : en_US} >
        <div className='borrow-input'>
          <BalanceInfoWithIcon coin={'USDx'} action={'Borrowed'} login={this.props.login} />
          {/* <div className='info-wrapper'>
            <span className='balance-type'>
              <img style={{ width: '16px', height: '16px', margin: 'auto', marginTop: '-4px' }} src={`images/USDx@2x.png`} alt="" />&nbsp;
            <FormattedMessage id='USDx_Borrowed_borrow' />
            </span>
            <span className='balance-amount'>
              {this.state.my_borrowed_usdx ? toDoubleThousands(this.state.my_borrowed_usdx) : '-'}
            </span>
          </div> */}


          <Tabs className='tab-wrapper' animated={true} size='large' onChange={this.changePane}>
            <TabPane tab={navigator.language === 'zh-CN' ? '借款' : 'BORROW'} key="1" className='tab-content'>
              {
                this.props.father_approve_USDx == 1
                  ?
                  <span>
                    <CoinAvailable coin={'usdx'} action={'repay'} login={this.web3.eth.accounts[0]} />
                    <InputUnit {...borrowProps} />
                  </span>
                  :
                  <Approve {...approveProps} />
              }
            </TabPane>

            <TabPane tab={navigator.language === 'zh-CN' ? '偿还' : 'REPAY'} key="2" className='tab-content'>
              {this.state.isApproved && <CoinBalance coin={'usdx'} login={this.props.login} />}
              {this.state.isApproved
                ?
                <InputUnit {...repayProps} />
                :
                <Approve {...approveProps} />
              }
            </TabPane>
          </Tabs>
        </div>
      </IntlProvider>
    );
  }
}

export default BorrowInput;