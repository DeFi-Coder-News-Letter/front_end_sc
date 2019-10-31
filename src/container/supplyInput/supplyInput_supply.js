import React, { Component } from 'react';
import { Tabs } from 'antd';
import Approve from '../../component/approve/approve';
import InputUnit from '../../component/inputUnit/inputUnit';
import WETH from '../../ABIs/WETH';
import USDX from "../../ABIs/USDX.js";
import MoneyMarket from './../../ABIs/MoneyMarket.js';
import { saveTransaction, getTxnHashHref, toDoubleThousands, validNumber, toFormatShowNumber, getTransactionHistoryKey, findNetwork, diffMin, formatBigNumber, toNonExponential } from '../../util.js';
import Asset from '../../constant.json';
import Network from '../../constant.json';
import './supplyInput.scss';
import CoinAvailable from './../coinAvailable/coinAvailable_supply';
import CoinBalance from './../coinBalance/coinBalance_supply';
import BalanceInfoWithIcon from './../balanceInfoWithIcon/balanceInfoWithIcon_supply';
import ErrorCode from '../../error_code.json';

const { TabPane } = Tabs;

class SupplyInput extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentUser: '',
      pendingApproval: false,
      isApproved: false,
      isSupplyEnable: true,
      isWithdrawEnable: true,
      isWrapEnable: true,
      isunwrapEnable: true,
      supplyAmount: '',
      withdrawAmount: '',
      withdrawMax: false,
      maxWithdrawAmount: 0,
      // maxUnwrapAmount: 0,
      wrapAmount: '',
      unwrapAmount: '',
      coinAllowance: 0,
      accountBalance: 0,
      // ethAccountBalance: 0,
      // wethAccountBalance: 0,
      supplyAccountBalance: 0,
      supplyWETHBalance: 0,
      buttonText: '',
      supplyButtonText: '',
      withdrawButtonText: '',
      collateralRatio: 0,
      assetBalance: 0,
      gasPrice: 0,
      gasLimit: 0,
      supplyAssetPrice: 0,
      calcWETHPrice: 0,
      supplyInputDisabled: false,
      withdrawInputDisabled: false,
      wrapInputDisabled: false,
      unwrapInputDisabled: false,
      maxClassName: 'max-amount-button',
      withdrawMaxClassName: 'max-amount-button',
      unwrapMaxClassName: 'max-amount-button',
      //check
      supplyUSDxWaitUpdateForSuccessMap: new Map(),
      supplyUSDxWaitUpdateForFailedMap: new Map(),
      //超时则取消控件限制
      supplyUSDxWaitTimeOutMap: new Map(),
      withdrawUSDxWaitUpdateForSuccessMap: new Map(),
      withdrawUSDxWaitUpdateForFailedMap: new Map(),
      //超时则取消控件限制
      withdrawUSDxWaitTimeOutMap: new Map(),
      supplyWrapWaitUpdateForSuccessMap: new Map(),
      supplyWrapWaitUpdateForFailedMap: new Map(),
      //超时则取消控件限制
      supplyWrapWaitTimeOutMap: new Map(),
      supplyUnwrapWaitUpdateForSuccessMap: new Map(),
      supplyUnwrapWaitUpdateForFailedMap: new Map(),
      //超时则取消控件限制
      supplyUnwrapWaitTimeOutMap: new Map(),
      supplyWETHWaitUpdateForSuccessMap: new Map(),
      supplyWETHWaitUpdateForFailedMap: new Map(),
      //超时则取消控件限制
      supplyWETHWaitTimeOutMap: new Map(),
      withdrawWETHWaitUpdateForSuccessMap: new Map(),
      withdrawWETHWaitUpdateForFailedMap: new Map(),
      //超时则取消控件限制
      withdrawWETHWaitTimeOutMap: new Map(),
      enableUSDxWaitUpdateForSuccessMap: new Map(),
      enableUSDxWaitUpdateForFailedMap: new Map(),
      //超时则取消控件限制
      enableUSDxWaitTimeOutMap: new Map(),
      enableWETHWaitUpdateForSuccessMap: new Map(),
      enableWETHWaitUpdateForFailedMap: new Map(),
      //超时则取消控件限制
      enableWETHWaitTimeOutMap: new Map(),
      //超时则取消控件限制
      timeOutTimes: 5,
      maxWithdrawUSDXAmount: 0,
      i_clicked_approve_btn: 0
    }
    this.web3 = window.web3;

    if (window.ethereum !== undefined) {
      window.ethereum.on('accountsChanged', (accounts) => {
        setTimeout(this.refreshData(), 500);
        this.getAllowance();
        // this.getMaxWithdrawAmount();
        this.getAccountBalance();
        // this.getMyAddressWETHBalance();
        this.setState({ supplyAmount: '', withdrawAmount: '', wrapAmount: '', unwrapAmount: '' });
        // reset button&inputText status
        this.setState({ isWrapEnable: true, wrapInputDisabled: false });
        this.setState({ isunwrapEnable: true, unwrapInputDisabled: false });
        this.setState({ isSupplyEnable: true, supplyInputDisabled: false });
        this.setState({ isWithdrawEnable: true, withdrawInputDisabled: false });
        this.setState({ pendingApproval: false });
      });
    }

    this.componentDidMount_temp();

    if (window.web3.currentProvider.isMetaMask) {
      window.ethereum.on('accountsChanged', () => {
        this.componentDidMount_temp();
      });
    }

  };


  // ******************* account_Balance
  getAccountBalance = () => {
    if (window.web3 !== undefined && this.web3.eth.accounts[0] !== undefined && this.props.coin !== undefined) {
      this.props.coin.balanceOf(this.web3.eth.accounts[0], (err, res) => {
        let balance = 0;
        // SupplyMax
        if (res !== undefined && res !== null) {
          balance = formatBigNumber(res);
        }
        let AccountBalance = toFormatShowNumber(balance)
        let MaxSupplyAmount = balance;
        if (this.state.accountBalance !== AccountBalance) {
          this.setState({ accountBalance: AccountBalance });
          this.setState({ isSupplyEnable: true });
          this.setState({ supplyAmount: '' });
        }
        if (this.state.maxSupplyAmount !== MaxSupplyAmount) {
          this.setState({ maxSupplyAmount: balance });
        }
      });
    }
  }

  getCurrentSupplyAssetAmount = () => {
    if (window.web3 !== undefined && this.web3.eth.accounts[0] !== undefined && MoneyMarket() !== undefined) {
      let withdrawAddress = '';
      let NetworkName = findNetwork(window.web3.version.network);
      if (NetworkName === 'Main') {
        if (this.props.withdrawType === 'WETH') {
          withdrawAddress = Network.Main.WETH;
        }
        if (this.props.withdrawType === 'USDX') {
          withdrawAddress = Network.Main.USDx;
        }
      } else if (NetworkName === 'Rinkeby') {
        if (this.props.withdrawType === 'WETH') {
          withdrawAddress = Network.Rinkeby.WETH;
        }
        if (this.props.withdrawType === 'USDX') {
          withdrawAddress = Network.Rinkeby.USDx;
        }
      }

      MoneyMarket().getSupplyBalance(this.web3.eth.accounts[0],
        withdrawAddress,
        (err, res) => {
          if (res !== undefined && res !== null && this.state.supplyAccountBalance !== this.web3.fromWei(res.toNumber(), "ether")) {
            this.setState({ supplyAccountBalance: this.web3.fromWei(res.toNumber(), "ether") });
          }
        }
      );
    }
  }

  getAllowance = () => {
    if (typeof web3 === 'undefined' || this.web3.eth.accounts[0] === undefined || this.props.coin === undefined) {
      console.log('---------ka zai zhe li le');
      return;
    }
    let mmAddress = '';
    let NetworkName = findNetwork(window.web3.version.network);
    mmAddress = Network[NetworkName].MoneyMarket;
    this.props.coin.allowance(this.web3.eth.accounts[0], mmAddress, (err, res) => {
      let allowanceVal = -1;
      if (res) {
        allowanceVal = res.toNumber();
        if (allowanceVal > 0) {
          this.setState({ coinAllowance: allowanceVal, isApproved: true });
        } else {
          this.setState({ isApproved: false, pendingApproval: false, buttonText: this.props.approveButtonInfo });
        }
      }
    });
  }


  getAssetBalance = () => {
    let mmAddress = '';
    let NetworkName = window.web3 !== undefined ? findNetwork(window.web3.version.network) : null;
    if (NetworkName === 'Main') {
      mmAddress = Network.Main.MoneyMarket;
    } else if (NetworkName === 'Rinkeby') {
      mmAddress = Network.Rinkeby.MoneyMarket;
    }
    if (typeof web3 !== 'undefined' && this.props.usdxCoin === true && USDX() !== undefined) {
      USDX().balanceOf(mmAddress, (err, res) => {
        let balance = 0;
        if (res !== undefined && res !== null) {
          balance = res.toNumber();
        }
        if (this.state.assetBalance !== this.web3.fromWei(balance, "ether")) {
          this.setState({ assetBalance: this.web3.fromWei(balance, "ether") });
        }
      });
    }
  }

  getCollateralRatio = () => {
    if (MoneyMarket() === undefined) {
      return;
    }
    MoneyMarket().collateralRatio((err, res) => {
      if (res !== undefined && res !== null) {
        this.setState({ collateralRatio: this.web3.fromWei(res.toNumber(), "ether") })
      }
    });
  }

  getUSDxAssetPrice = () => {
    this.getCalcWETHPrice();
    this.getWETHAssetPrice();
  }

  // ***********************
  //weth价格修改
  getCalcWETHPrice = () => {
    if (typeof web3 === 'undefined' || MoneyMarket() === undefined) {
      return;
    }
    let wethAddress = '';
    let NetworkName = findNetwork(window.web3.version.network);
    if (NetworkName === 'Main') {
      wethAddress = Network.Main.WETH;
    } else if (NetworkName === 'Rinkeby') {
      wethAddress = Network.Rinkeby.WETH;
    }
    MoneyMarket().assetPrices(wethAddress, (err, res) => {
      if (res !== undefined && res !== null) {
        this.setState({
          calcWETHPrice: this.web3.fromWei(res.toNumber(), "ether")
        });
      }
    });
  }

  // ***********************
  getWETHAssetPrice = () => {
    //weth价格修改
    if (typeof web3 === 'undefined' || MoneyMarket() === undefined) {
      return;
    }
    let usdxAddress = '';
    let NetworkName = findNetwork(window.web3.version.network);
    if (NetworkName === 'Main') {
      usdxAddress = Network.Main.USDx;
    } else if (NetworkName === 'Rinkeby') {
      usdxAddress = Network.Rinkeby.USDx;
    }
    MoneyMarket().assetPrices(usdxAddress, (err, res) => {
      if (res !== undefined && res !== null && this.state.calcWETHPrice !== 0) {
        this.setState({
          supplyAssetPrice: this.state.calcWETHPrice / this.web3.fromWei(res.toNumber(), "ether")
        });
      }
    });
  }


  // ***********************  get_Max_Withdraw_Amount
  // getMaxWithdrawAmount = () => {
  //   if (typeof web3 === 'undefined' || this.web3.eth.accounts[0] === undefined || MoneyMarket() === undefined) {
  //     return;
  //   }
  //   MoneyMarket().calculateAccountValues(this.web3.eth.accounts[0], (err, res) => {
  //     if (res === undefined || res === null || this.state.supplyAssetPrice === 0) {
  //       return;
  //     }
  //     // console.log(res);
  //     // Supplied Balance = MoneyMarket.calculateAccountValues(address userAddress)[1]
  //     // Borrowed Balance = MoneyMarket.calculateAccountValues(address userAddress)[2]
  //     let sumofSupplies = this.web3.fromWei(this.web3.fromWei(res[1].toNumber(), "ether"), "ether");
  //     let sumofBorrow = this.web3.fromWei(this.web3.fromWei(res[2].toNumber(), "ether"), "ether") * this.state.collateralRatio;
  //     //weth价格修改 增加了下面两行
  //     if (this.props.usdxCoin) {
  //       sumofSupplies = sumofSupplies * this.state.supplyAssetPrice / 1;
  //       sumofBorrow = sumofBorrow * this.state.supplyAssetPrice / 1;
  //     }

  //     let max = Math.min((sumofSupplies - sumofBorrow), this.state.supplyAccountBalance, this.state.assetBalance);

  //     if (Number(max) < 0) {
  //       max = 0;
  //     }

  //     if (this.state.maxWithdrawAmount !== Number(max)) {
  //       this.setState({ maxWithdrawAmount: Number(max) });
  //     }
  //   }
  //   );
  // }


  // ******************* max_Withdraw_USDX_Amount
  getmaxWithdrawUSDXAmount = () => {
    if (typeof web3 !== 'undefined' && this.web3.eth.accounts[0] !== undefined) {
      let wethAddress = '';
      let usdxAddress = '';
      let mmAddress = '';
      let NetworkName = findNetwork(window.web3.version.network);
      if (NetworkName === 'Main') {
        mmAddress = Network.Main.MoneyMarket;
        usdxAddress = Network.Main.USDx;
        wethAddress = Network.Main.WETH;
      } else if (NetworkName === 'Rinkeby') {
        mmAddress = Network.Rinkeby.MoneyMarket;
        usdxAddress = Network.Rinkeby.USDx;
        wethAddress = Network.Rinkeby.WETH;
      }
      MoneyMarket().calculateAccountValues(
        this.web3.eth.accounts[0],
        (err, res) => {
          if (res !== undefined || res !== null) {
            MoneyMarket().collateralRatio((err, res1) => {
              if (res1 !== undefined && res1 !== null) {
                let sumofSupplies = this.web3.fromWei(this.web3.fromWei(res[1].toNumber(), "ether"), "ether");
                let sumofBorrow = this.web3.fromWei(this.web3.fromWei(res[2].toNumber(), "ether"), "ether") * this.web3.fromWei(res1.toNumber(), "ether");
                MoneyMarket().assetPrices(wethAddress, (err, res2) => {
                  MoneyMarket().assetPrices(usdxAddress, (err, res3) => {
                    if (res3 !== undefined && res3 !== null) {
                      sumofSupplies = sumofSupplies * (this.web3.fromWei(res2.toNumber(), "ether") / this.web3.fromWei(res3.toNumber(), "ether")) / 1;
                      sumofBorrow = sumofBorrow * (this.web3.fromWei(res2.toNumber(), "ether") / this.web3.fromWei(res3.toNumber(), "ether")) / 1;
                      MoneyMarket().getSupplyBalance(this.web3.eth.accounts[0], usdxAddress, (err, res5) => {
                        if (res5 !== undefined && res5 !== null) {
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


  // handle_Approve_USDx
  handleApprove = () => {
    this.setState({
      isApproved: false,
      buttonText: 'ENABLEING USDx...',
      pendingApproval: true,
      i_clicked_approve_btn: 1
    });
    let mmAddress = '';
    let NetworkName = findNetwork(window.web3.version.network);
    if (NetworkName === 'Main') {
      mmAddress = Network.Main.MoneyMarket;
    } else if (NetworkName === 'Rinkeby') {
      mmAddress = Network.Rinkeby.MoneyMarket;
    }
    this.props.coin.approve.estimateGas(mmAddress, -1, { from: this.web3.eth.accounts[0] }, (err, gasLimit) => {
      this.web3.eth.getGasPrice((err, gasPrice) => {
        console.log('handle_Approve_USDx_gasLimit:' + gasLimit);
        console.log('handle_Approve_USDx_gasPrice:' + gasPrice);
        this.props.coin.approve.sendTransaction(
          mmAddress,
          -1,
          {
            from: this.web3.eth.accounts[0],
            gas: gasLimit,
            gasPrice: gasPrice
          },
          (err, res) => {
            if (res) {
              let txId = res;
              let txnHashHref = getTxnHashHref(this.web3.version.network) + res;
              this.setState({
                getHash: true,
                hashNumber: res,
                pendingApproval: true,
                i_clicked_approve_btn: 0
              });
              saveTransaction(
                'loading-supply-usdx-approve',
                this.web3.eth.accounts[0],
                Asset['Asset'].USDx,
                this.props.page,
                this.web3.version.network,
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
              this.setState({ isApproved: false, pendingApproval: false, buttonText: this.props.approveButtonInfo, i_clicked_approve_btn: 0 });
            }
          }
        )
      }
      )
    }
    );
  };

  // ********************8 supplyAmount
  handleSupplyClick = () => {
    if (this.state.supplyAmount === '' || this.state.supplyAmount === 0 || this.state.supplyAmount === null) {
      return;
    }
    this.setState({ isSupplyEnable: false, supplyButtonText: 'SUBMITTING…', supplyInputDisabled: true, maxClassName: 'max-amount-button-disable' });
    let supplyAddress = '';
    let NetworkName = findNetwork(window.web3.version.network);
    if (NetworkName === 'Main') {
      if (this.props.supplyType === 'WETH') {
        supplyAddress = Network.Main.WETH;
      }
      if (this.props.supplyType === 'USDX') {
        supplyAddress = Network.Main.USDx;
      }
    } else if (NetworkName === 'Rinkeby') {
      if (this.props.supplyType === 'WETH') {
        supplyAddress = Network.Rinkeby.WETH;
      }
      if (this.props.supplyType === 'USDX') {
        supplyAddress = Network.Rinkeby.USDx;
      }
    }
    MoneyMarket().supply.estimateGas(
      supplyAddress,
      this.web3.toWei(this.state.supplyAmount, "ether"),
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
          MoneyMarket().supply.sendTransaction(
            supplyAddress,
            this.web3.toWei(this.state.supplyAmount, "ether"),
            {
              from: this.web3.eth.accounts[0],
              gas: gasLimit,
              gasPrice: gasPrice
            },
            (err, res) => {
              if (res !== undefined && res !== null) {
                let txId = res;
                let txnHashHref = getTxnHashHref(this.web3.version.network) + res;
                let recordSupplyAmount = toDoubleThousands(this.state.supplyAmount);
                if (this.props.wethCoin === true) {
                  saveTransaction('loading-supply-weth', this.web3.eth.accounts[0], Asset['Asset'].WETH, this.props.page,
                    this.web3.version.network, 'Supply', recordSupplyAmount, 'WETH', txnHashHref, txId, 0, this.web3.toWei(this.state.supplyAmount, "ether"), false, null);
                } else if (this.props.usdxCoin === true) {
                  saveTransaction('loading-supply-usdx', this.web3.eth.accounts[0], Asset['Asset'].USDx, this.props.page,
                    this.web3.version.network, 'Supply', recordSupplyAmount, 'USDx', txnHashHref, txId, 0, this.web3.toWei(this.state.supplyAmount, "ether"), false, null);
                }
              } else {
                this.setState({ isSupplyEnable: true, supplyInputDisabled: false });
              }
            }
          )
        }
        )
      }
    );
  }



  handleSupplyChange = (value) => {
    // console.log(value);
    if (value === null || value === '') {
      this.setState({ isSupplyEnable: true });
      this.setState({ supplyButtonText: this.props.supplyButtonInfo });
      this.setState({ supplyAmount: '' });
      return;
    } else if (value.toString().length > 18 || value > this.state.maxSupplyAmount) {
      let supplyButtonText = 'INSUFFICIENT BALANCE';
      this.setState({ supplyAmount: value });
      this.setState({ isSupplyEnable: false });
      this.setState({ supplyButtonText: supplyButtonText });
      return;
    }
    if (value.toString().indexOf('.') === value.toString().length - 1) {
      value = value + '00'
    }
    this.setState({ supplyAmount: value });
    // let buttonText = 'INSUFFICIENT BALANCE';
    if ((!validNumber(value) && value !== '') || value === 0) {
      this.setState({ isSupplyEnable: false });
      this.setState({ supplyButtonText: this.props.supplyButtonInfo });
    } else {
      this.setState({ isSupplyEnable: true });
    }
  }


  // ************** handle_Supply_Max
  handleSupplyMax = () => {
    // this.setState({ supplyAmount: toFormat4Number(this.state.maxSupplyAmount) });
    this.setState({ supplyAmount: this.state.maxSupplyAmount });
    if (Number(this.state.maxSupplyAmount) === 0) {
      this.setState({ isSupplyEnable: false });
      this.setState({ supplyButtonText: this.props.supplyButtonInfo });
    } else {
      this.setState({ isSupplyEnable: true });
    }
  }

  handleWithdrawChange = (value) => {
    if (value === null || value === '') {
      this.setState({ isWithdrawEnable: true });
      this.setState({ withdrawButtonText: this.state.withdrawButtonInfo });
      this.setState({ withdrawAmount: '' });
      this.setState({ withdrawMax: false });
      return;
    } else if (value.toString().length > 18 || value > this.state.maxWithdrawUSDXAmount) {
      this.setState({ withdrawAmount: value });
      this.setState({ isWithdrawEnable: false });
      this.setState({ withdrawButtonText: 'INSUFFICIENT LIQUIDITY' });
      return;
    }
    if (value.toString().indexOf('.') === value.toString().length - 1) {
      value = value + '00'
    }
    this.setState({ withdrawAmount: value });
    this.setState({ withdrawMax: false });
    if ((!validNumber(value) && value !== '') || value === 0) {
      this.setState({ isWithdrawEnable: false });
      this.setState({ withdrawButtonText: 'INSUFFICIENT LIQUIDITY' });
    } else {
      this.setState({ isWithdrawEnable: true });
    }
  }

  handleWithdrawMax = () => {
    this.setState({ withdrawAmount: this.state.maxWithdrawUSDXAmount, withdrawMax: true }, () => {
      // console.log(this.state.maxWithdrawUSDXAmount);
      if (Number(this.state.maxWithdrawUSDXAmount) === 0) {
        this.setState({ isWithdrawEnable: false, withdrawButtonText: 'INSUFFICIENT LIQUIDITY' });
      } else {
        this.setState({ isWithdrawEnable: true });
      }
    });
  }

  handleWithdrawClick = () => {
    if (this.state.withdrawAmount === '' || Number(this.state.withdrawAmount) === 0 || this.state.withdrawAmount === null) {
      return;
    }
    if (this.state.withdrawAmount > this.state.maxWithdrawUSDXAmount) {
      this.setState({ withdrawAmount: this.state.maxWithdrawUSDXAmount })
    }
    let amount = this.web3.toWei(this.state.withdrawAmount, "ether");
    if (this.state.withdrawMax) {
      // 暂时用-1
      amount = -1;
    }

    this.setState({ isWithdrawEnable: false, withdrawButtonText: 'SUBMITTING…', withdrawInputDisabled: true, withdrawMaxClassName: 'max-amount-button-disable' });
    let withdrawAddress = '';
    let NetworkName = findNetwork(window.web3.version.network);
    if (NetworkName === 'Main') {
      if (this.props.withdrawType === 'WETH') {
        withdrawAddress = Network.Main.WETH;
      }
      if (this.props.withdrawType === 'USDX') {
        withdrawAddress = Network.Main.USDx;
      }
    } else if (NetworkName === 'Rinkeby') {
      if (this.props.withdrawType === 'WETH') {
        withdrawAddress = Network.Rinkeby.WETH;
      }
      if (this.props.withdrawType === 'USDX') {
        withdrawAddress = Network.Rinkeby.USDx;
      }
    }

    MoneyMarket().withdraw.estimateGas(
      withdrawAddress,
      amount,
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
          MoneyMarket().withdraw.sendTransaction(
            withdrawAddress,
            // this.state.withdrawMax === true ? -1 : this.web3.toWei(this.state.withdrawAmount, "ether"),
            amount,
            {
              from: this.web3.eth.accounts[0],
              gas: gasLimit,
              gasPrice: gasPrice
            },
            (err, res) => {
              if (res !== undefined && res !== null) {
                let txId = res;
                let txnHashHref = getTxnHashHref(this.web3.version.network) + res;
                let recordWithdrawAmount = (amount === -1) ? toDoubleThousands(this.state.maxWithdrawUSDXAmount) : toDoubleThousands(this.state.withdrawAmount);
                if (this.props.wethCoin === true) {
                  saveTransaction('loading-supply-withdraw-weth', this.web3.eth.accounts[0], Asset['Asset'].WETH,
                    this.props.page, this.web3.version.network, 'Withdraw', recordWithdrawAmount, 'WETH', txnHashHref, txId, 0, this.state.withdrawMax === true ? -1 : this.web3.toWei(this.state.withdrawAmount, "ether"), false, null);
                } else if (this.props.usdxCoin === true) {
                  saveTransaction('loading-supply-withdraw-usdx', this.web3.eth.accounts[0], Asset['Asset'].USDx,
                    this.props.page, this.web3.version.network, 'Withdraw', recordWithdrawAmount, 'USDx', txnHashHref, txId, 0, this.state.withdrawMax === true ? -1 : this.web3.toWei(this.state.withdrawAmount, "ether"), false, null);
                }
              } else {
                this.setState({ isWithdrawEnable: true, withdrawInputDisabled: false });
              }
            }
          )
        }
        )
      }
    );
  }


  usdxEventMonitor = () => {
    if (USDX() === undefined) {
      return;
    }
    let that = this;
    var approvalUSDXEvent = USDX().Approval();
    approvalUSDXEvent.watch((error, result) => {
      console.log('supply_usdx_Event_Monitor: ' + JSON.stringify(result));
      if (error) {
        console.log('supply_usdx_Event_Monitor error: ' + JSON.stringify(error));
        return;
      }
      var storage = null;
      var results = null;
      var key = null;
      if (window.localStorage) {
        storage = window.localStorage;
        key = getTransactionHistoryKey(that.props.account, Asset['Asset'].USDx, that.props.page, that.web3.version.network);
        results = JSON.parse(`${storage.getItem(key)}`);
      }
      if (results === null) {
        return;
      }
      let resultObj = JSON.parse(JSON.stringify(result));
      var txId = resultObj.transactionHash;
      this.getAllowance();
      this.setState({ pendingApproval: false, isApproved: true });
      storage.removeItem(key);
      results = results.map(item => {
        if (item.status === 0 && item.transactionType === 'Enable' && item.txId !== txId) {
          let txnHashHref = getTxnHashHref(that.web3.version.network) + txId;
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

  // wethEventMonitor = () => {
  //   if (WETH() === undefined) {
  //     return;
  //   }
  //   let that = this;
  //   var approvalWETHEvent = WETH().Approval();
  //   approvalWETHEvent.watch((error, result) => {
  //     console.log('watch -> approvalWETHEvent:' + JSON.stringify(result));
  //     if (error) {
  //       console.log('watch wethEventMonitor approvalWETHEvent error --> ' + JSON.stringify(error));
  //       return;
  //     }
  //     var storage = null;
  //     var results = null;
  //     var key = null;
  //     if (window.localStorage) {
  //       if (typeof web3 === 'undefined') {
  //         return;
  //       }
  //       storage = window.localStorage;
  //       key = getTransactionHistoryKey(that.props.account, Asset['Asset'].WETH, that.props.page, that.web3.version.network);
  //       results = JSON.parse(`${storage.getItem(key)}`);
  //     }
  //     if (results === null) {
  //       return;
  //     }
  //     let resultObj = JSON.parse(JSON.stringify(result));
  //     var txId = resultObj.transactionHash;
  //     this.setState({ pendingApproval: false, isApproved: true });
  //     // change icon and status = 1 by txId
  //     storage.removeItem(key);
  //     results = results.map(item => {
  //       if (item.status === 0 && item.transactionType === 'Enable' && item.txId !== txId) {
  //         let txnHashHref = getTxnHashHref(that.web3.version.network) + txId;
  //         return {
  //           ...item,
  //           icon: 'done',
  //           status: 1,
  //           txId: txId,
  //           txnHashHref: txnHashHref
  //         }
  //       } else if (item.txId === txId) {
  //         return {
  //           ...item,
  //           icon: 'done',
  //           status: 1
  //         }
  //       }
  //       return {
  //         ...item
  //       }
  //     })
  //     storage.setItem(key, JSON.stringify(results));
  //   });
  //   //测试用weth_faucet 暂时注释
  //   // let NetworkName = findNetwork(window.web3.version.network);
  //   // if (NetworkName === 'Rinkeby') {//测试用weth_faucet 暂时注释  主网支持后放开判断
  //   var depositWETHEvent = WETH().Deposit();
  //   depositWETHEvent.watch((error, result) => {
  //     console.log('watch -> depositWETHEvent:' + JSON.stringify(result));
  //     if (error) {
  //       console.log('watch wethEventMonitor depositWETHEvent error --> ' + JSON.stringify(error));
  //       return;
  //     }
  //     var storage = null;
  //     var results = null;
  //     var key = null;
  //     if (window.localStorage) {
  //       if (typeof web3 === 'undefined') {
  //         return;
  //       }
  //       storage = window.localStorage;
  //       key = getTransactionHistoryKey(that.props.account, Asset['Asset'].WETH, that.props.page, that.web3.version.network);
  //       results = JSON.parse(`${storage.getItem(key)}`);
  //     }
  //     if (results === null) {
  //       return;
  //     }
  //     let resultObj = JSON.parse(JSON.stringify(result));
  //     var txId = resultObj.transactionHash;
  //     // Refresh data
  //     // console.log('rrrrrrrrrrrrrrrrrrrrrrrrr')
  //     this.refreshData();
  //     // this.getAccountETHBalance();
  //     this.setState({ wrapAmount: '', isWrapEnable: true, wrapInputDisabled: false });
  //     this.setState({ isSupplyEnable: true, supplyButtonText: this.props.supplyButtonInfo, supplyAmount: '' });
  //     this.setState({ unwrapAmount: '', isunwrapEnable: true });
  //     this.setState({ withdrawAmount: '', withdrawMax: false, isWithdrawEnable: true });
  //     storage.removeItem(key);
  //     let argsObj = JSON.parse(JSON.stringify(resultObj.args));
  //     results = results.map(item => {
  //       // check is speed up
  //       if (item.status === 0 && item.transactionType === 'Wrap' && item.realAmount === argsObj.wad && item.txId !== txId) {
  //         let txnHashHref = getTxnHashHref(that.web3.version.network) + txId;
  //         return {
  //           ...item,
  //           icon: 'done',
  //           status: 1,
  //           txId: txId,
  //           txnHashHref: txnHashHref
  //         }
  //       } else if (item.txId === txId) {
  //         return {
  //           ...item,
  //           icon: 'done',
  //           status: 1
  //         }
  //       }
  //       return {
  //         ...item
  //       }
  //     })
  //     storage.setItem(key, JSON.stringify(results));
  //   });

  //   //测试用weth_faucet 暂时注释
  //   var withdrawalWETHEvent = WETH().Withdrawal();
  //   withdrawalWETHEvent.watch((error, result) => {
  //     console.log('watch -> withdrawalWETHEvent:' + JSON.stringify(result));
  //     if (error) {
  //       console.log('watch wethEventMonitor withdrawalWETHEvent error --> ' + JSON.stringify(error));
  //       return;
  //     }
  //     var storage = null;
  //     var results = null;
  //     var key = null;
  //     if (window.localStorage) {
  //       if (typeof web3 === 'undefined') {
  //         return;
  //       }
  //       storage = window.localStorage;
  //       key = getTransactionHistoryKey(that.props.account, Asset['Asset'].WETH, that.props.page, that.web3.version.network);
  //       results = JSON.parse(`${storage.getItem(key)}`);
  //     }
  //     if (results === null) {
  //       return;
  //     }
  //     let resultObj = JSON.parse(JSON.stringify(result));
  //     var txId = resultObj.transactionHash;
  //     // Refresh data
  //     this.refreshData();
  //     this.setState({ unwrapAmount: '', isunwrapEnable: true, supplyAmount: '', unwrapInputDisabled: false, maxClassName: 'max-amount-button' });
  //     storage.removeItem(key);
  //     let argsObj = JSON.parse(JSON.stringify(resultObj.args));
  //     results = results.map(item => {
  //       // check is speed up
  //       if (item.status === 0 && item.transactionType === 'Unwrap' && item.realAmount === argsObj.wad && item.txId !== txId) {
  //         let txnHashHref = getTxnHashHref(that.web3.version.network) + txId;
  //         return {
  //           ...item,
  //           icon: 'done',
  //           status: 1,
  //           txId: txId,
  //           txnHashHref: txnHashHref
  //         }
  //       } else if (item.txId === txId) {
  //         return {
  //           ...item,
  //           icon: 'done',
  //           status: 1
  //         }
  //       }
  //       return {
  //         ...item
  //       }
  //     })
  //     storage.setItem(key, JSON.stringify(results));
  //   });
  //   // }
  // }

  refreshData = () => {
    // this.getAccountETHBalance();
    this.getCurrentSupplyAssetAmount();
    this.getAccountBalance();
    this.getAssetBalance();
    this.getUSDxAssetPrice();
    // this.getMaxWithdrawAmount();
    this.getmaxWithdrawUSDXAmount();
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
      if (this.props.wethCoin === true) {
        key = getTransactionHistoryKey(this.web3.eth.accounts[0], Asset['Asset'].WETH, this.props.page, this.web3.version.network);
      } else if (this.props.usdxCoin === true) {
        key = getTransactionHistoryKey(this.web3.eth.accounts[0], Asset['Asset'].USDx, this.props.page, this.web3.version.network);
      }
      results = JSON.parse(`${storage.getItem(key)}`);
    }
    if (results === null) {
      return;
    }
    storage.removeItem(key);
    results = results.map(item => {
      // if (item.icon === 'loading-supply-wrap') {
      //   if (this.state.supplyWrapWaitUpdateForSuccessMap.get(item.txId) !== undefined) {
      //     this.setState({ isWrapEnable: true, wrapInputDisabled: false });
      //     //imtoken用
      //     if (window.ethereum.isImToken !== undefined && window.ethereum.isImToken === true) {
      //       // Refresh data
      //       this.refreshData();
      //       // this.getAccountETHBalance();
      //       this.setState({ wrapAmount: '', isWrapEnable: true, wrapInputDisabled: false, });
      //     }
      //     return {
      //       ...item,
      //       icon: 'done',
      //       status: 1
      //     }
      //   }
      //   if (this.state.supplyWrapWaitUpdateForFailedMap.get(item.txId) !== undefined) {
      //     this.setState({ isWrapEnable: true, wrapInputDisabled: false });
      //     //imtoken用
      //     if (window.ethereum.isImToken !== undefined && window.ethereum.isImToken === true) {
      //       // Refresh data
      //       this.refreshData();
      //       // this.getAccountETHBalance();
      //       this.setState({ wrapAmount: '', isWrapEnable: true, wrapInputDisabled: false, });
      //     }
      //     return {
      //       ...item,
      //       icon: 'failure',
      //       status: 1,
      //       failed: true,
      //       failedInfo: 'WRAP FAILURE'
      //     }
      //   }
      //   //超时则取消控件限制
      //   if (this.state.supplyWrapWaitTimeOutMap.get(item.txId) !== undefined) {
      //     return {
      //       ...item,
      //       timeOutFlag: 1
      //     }
      //   }
      // }

      // if (item.icon === 'loading-supply-unwrap') {
      //   if (this.state.supplyUnwrapWaitUpdateForSuccessMap.get(item.txId) !== undefined) {
      //     this.setState({ isunwrapEnable: true, unwrapInputDisabled: false });
      //     //imtoken用
      //     if (window.ethereum.isImToken !== undefined && window.ethereum.isImToken === true) {
      //       // Refresh data
      //       this.refreshData();
      //       this.setState({ unwrapAmount: '', isunwrapEnable: true, supplyAmount: '', unwrapInputDisabled: false, maxClassName: 'max-amount-button' });
      //     }
      //     return {
      //       ...item,
      //       icon: 'done',
      //       status: 1
      //     }
      //   }
      //   if (this.state.supplyUnwrapWaitUpdateForFailedMap.get(item.txId) !== undefined) {
      //     this.setState({ isunwrapEnable: true, unwrapInputDisabled: false });
      //     return {
      //       ...item,
      //       icon: 'failure',
      //       status: 1,
      //       failed: true,
      //       failedInfo: 'UNWRAP FAILURE'
      //     }
      //   }
      //   //超时则取消控件限制
      //   if (this.state.supplyUnwrapWaitUpdateForFailedMap.get(item.txId) !== undefined) {
      //     return {
      //       ...item,
      //       timeOutFlag: 1
      //     }
      //   }
      // }

      // if (item.icon === 'loading-supply-weth') {
      //   if (this.state.supplyWETHWaitUpdateForSuccessMap.get(item.txId) !== undefined) {
      //     this.setState({ isSupplyEnable: true, supplyInputDisabled: false });
      //     //imtoken用
      //     if (window.ethereum.isImToken !== undefined && window.ethereum.isImToken === true) {
      //       // Refresh Data
      //       this.refreshData();
      //       this.setState({ isSupplyEnable: true, supplyAmount: null, supplyInputDisabled: false, maxClassName: 'max-amount-button' });
      //       this.setState({ isWithdrawEnable: true });
      //       this.setState({ withdrawAmount: null, withdrawMax: false, withdrawInputDisabled: false, withdrawMaxClassName: 'max-amount-button' });
      //       if (this.props.wethCoin === true) {
      //         this.setState({ unwrapAmount: '' });
      //       }
      //     }
      //     return {
      //       ...item,
      //       icon: 'supply',
      //       status: 1
      //     }
      //   }
      //   if (this.state.supplyWETHWaitUpdateForFailedMap.get(item.txId) !== undefined) {
      //     this.setState({ isSupplyEnable: true, supplyInputDisabled: false });
      //     //imtoken用
      //     if (window.ethereum.isImToken !== undefined && window.ethereum.isImToken === true) {
      //       this.refreshData();
      //       this.setState({ isSupplyEnable: true, supplyAmount: null, supplyInputDisabled: false, maxClassName: 'max-amount-button' });
      //       if (this.props.wethCoin === true) {
      //         this.setState({ unwrapAmount: '' });
      //       }
      //       this.setState({ isWithdrawEnable: true, supplyAmount: '', withdrawInputDisabled: false, withdrawMaxClassName: 'max-amount-button' });
      //       this.setState({ withdrawAmount: null, withdrawMax: false });
      //     }
      //     return {
      //       ...item,
      //       icon: 'failure',
      //       status: 1,
      //       failed: true,
      //       failedInfo: 'SUPPLY WETH FAILURE'
      //     }
      //   }
      //   //超时则取消控件限制
      //   if (this.state.supplyWETHWaitTimeOutMap.get(item.txId) !== undefined) {
      //     return {
      //       ...item,
      //       timeOutFlag: 1
      //     }
      //   }
      // }

      // if (item.icon === 'loading-supply-withdraw-weth') {
      //   if (this.state.withdrawWETHWaitUpdateForSuccessMap.get(item.txId) !== undefined) {
      //     this.setState({ isWithdrawEnable: true, withdrawInputDisabled: false });
      //     //imtoken用
      //     if (window.ethereum.isImToken !== undefined && window.ethereum.isImToken === true) {
      //       // Refresh data
      //       this.refreshData();
      //       this.setState({ isWithdrawEnable: true, supplyAmount: '' });
      //       this.setState({ withdrawAmount: null, withdrawMax: false, withdrawInputDisabled: false, withdrawMaxClassName: 'max-amount-button' });
      //     }
      //     return {
      //       ...item,
      //       icon: 'withdraw',
      //       status: 1
      //     }
      //   }
      //   if (this.state.withdrawWETHWaitUpdateForFailedMap.get(item.txId) !== undefined) {
      //     this.setState({ isWithdrawEnable: true, withdrawInputDisabled: false });
      //     //imtoken用
      //     if (window.ethereum.isImToken !== undefined && window.ethereum.isImToken === true) {
      //       this.refreshData();
      //       this.setState({ isSupplyEnable: true, supplyAmount: null, supplyInputDisabled: false, maxClassName: 'max-amount-button' });
      //       if (this.props.wethCoin === true) {
      //         this.setState({ unwrapAmount: '' });
      //       }
      //       this.setState({ isWithdrawEnable: true, supplyAmount: '', withdrawInputDisabled: false, withdrawMaxClassName: 'max-amount-button' });
      //       this.setState({ withdrawAmount: null, withdrawMax: false });
      //     }
      //     return {
      //       ...item,
      //       icon: 'failure',
      //       status: 1,
      //       failed: true,
      //       failedInfo: 'WITHDRAW WETH FAILURE'
      //     }
      //   }
      //   //超时则取消控件限制
      //   if (this.state.withdrawWETHWaitTimeOutMap.get(item.txId) !== undefined) {
      //     return {
      //       ...item,
      //       timeOutFlag: 1
      //     }
      //   }
      // }

      if (item.icon === 'loading-supply-usdx') {
        if (this.state.supplyUSDxWaitUpdateForSuccessMap.get(item.txId) !== undefined) {
          this.setState({ isSupplyEnable: true, supplyInputDisabled: false });
          //imtoken用
          if (window.ethereum.isImToken !== undefined && window.ethereum.isImToken === true) {
            // Refresh Data
            this.refreshData();
            this.setState({ isSupplyEnable: true, supplyAmount: null, supplyInputDisabled: false, maxClassName: 'max-amount-button' });
            this.setState({ isWithdrawEnable: true });
            this.setState({ withdrawAmount: null, withdrawMax: false, withdrawInputDisabled: false, withdrawMaxClassName: 'max-amount-button' });
            if (this.props.wethCoin === true) {
              this.setState({ unwrapAmount: '' });
            }
          }
          return {
            ...item,
            icon: 'supply',
            status: 1
          }
        }

        if (this.state.supplyUSDxWaitUpdateForFailedMap.get(item.txId) !== undefined) {
          this.setState({ isSupplyEnable: true, supplyInputDisabled: false });
          //imtoken用
          if (window.ethereum.isImToken !== undefined && window.ethereum.isImToken === true) {
            this.refreshData();
            this.setState({ isSupplyEnable: true, supplyAmount: null, supplyInputDisabled: false, maxClassName: 'max-amount-button' });
            if (this.props.wethCoin === true) {
              this.setState({ unwrapAmount: '' });
            }
            this.setState({ isWithdrawEnable: true, supplyAmount: '', withdrawInputDisabled: false, withdrawMaxClassName: 'max-amount-button' });
            this.setState({ withdrawAmount: null, withdrawMax: false });
          }
          return {
            ...item,
            icon: 'failure',
            status: 1,
            failed: true,
            failedInfo: 'TRANSACTION FAILURE'
          }
        }

        //超时则取消控件限制
        if (this.state.supplyUSDxWaitTimeOutMap.get(item.txId) !== undefined) {
          return {
            ...item,
            timeOutFlag: 1
          }
        }
      }

      if (item.icon === 'loading-supply-withdraw-usdx') {
        if (this.state.withdrawUSDxWaitUpdateForSuccessMap.get(item.txId) !== undefined) {
          this.setState({ isWithdrawEnable: true, withdrawInputDisabled: false });
          //imtoken用
          if (window.ethereum.isImToken !== undefined && window.ethereum.isImToken === true) {
            // Refresh data
            this.refreshData();
            this.setState({ isWithdrawEnable: true, supplyAmount: '' });
            this.setState({ withdrawAmount: null, withdrawMax: false, withdrawInputDisabled: false, withdrawMaxClassName: 'max-amount-button' });
          }
          return {
            ...item,
            icon: 'withdraw',
            status: 1
          }
        }
        if (this.state.withdrawUSDxWaitUpdateForFailedMap.get(item.txId) !== undefined) {
          this.setState({ isWithdrawEnable: true, withdrawInputDisabled: false });
          //imtoken用
          if (window.ethereum.isImToken !== undefined && window.ethereum.isImToken === true) {
            this.refreshData();
            this.setState({ isSupplyEnable: true, supplyAmount: null, supplyInputDisabled: false, maxClassName: 'max-amount-button' });
            if (this.props.wethCoin === true) {
              this.setState({ unwrapAmount: '' });
            }
            this.setState({ isWithdrawEnable: true, supplyAmount: '', withdrawInputDisabled: false, withdrawMaxClassName: 'max-amount-button' });
            this.setState({ withdrawAmount: null, withdrawMax: false });
          }
          return {
            ...item,
            icon: 'failure',
            status: 1,
            failed: true,
            failedInfo: 'WITHDRAW USDx FAILURE'
          }
        }
        //超时则取消控件限制
        if (this.state.withdrawUSDxWaitTimeOutMap.get(item.txId) !== undefined) {
          return {
            ...item,
            timeOutFlag: 1
          }
        }
      }

      // if (item.icon === 'loading-supply-weth-approve') {
      //   if (this.state.enableWETHWaitUpdateForSuccessMap.get(item.txId) !== undefined) {
      //     this.setState({ pendingApproval: false, isApproved: true });
      //     //imtoken用
      //     if (window.ethereum.isImToken !== undefined && window.ethereum.isImToken === true) {
      //       this.setState({ pendingApproval: false, isApproved: true });
      //     }
      //     return {
      //       ...item,
      //       icon: 'done',
      //       status: 1
      //     }
      //   }
      //   if (this.state.enableWETHWaitUpdateForFailedMap.get(item.txId) !== undefined) {
      //     this.setState({ pendingApproval: false, isApproved: true });
      //     //imtoken用
      //     if (window.ethereum.isImToken !== undefined && window.ethereum.isImToken === true) {
      //       this.setState({ pendingApproval: false, isApproved: true });
      //     }
      //     return {
      //       ...item,
      //       icon: 'failure',
      //       status: 1,
      //       failed: true,
      //       failedInfo: 'ENABLE WETH FAILURE'
      //     }
      //   }
      //   //超时则取消控件限制
      //   if (this.state.enableWETHWaitTimeOutMap.get(item.txId) !== undefined) {
      //     return {
      //       ...item,
      //       timeOutFlag: 1
      //     }
      //   }
      // }

      if (item.icon === 'loading-supply-usdx-approve') {
        if (this.state.enableUSDxWaitUpdateForSuccessMap.get(item.txId) !== undefined) {
          this.setState({ pendingApproval: false, isApproved: true });
          return {
            ...item,
            icon: 'done',
            status: 1
          }
        }
        if (this.state.enableUSDxWaitUpdateForFailedMap.get(item.txId) !== undefined) {
          this.setState({ pendingApproval: false, isApproved: true });
          return {
            ...item,
            icon: 'failure',
            status: 1,
            failed: true,
            failedInfo: 'ENABLE USDx FAILURE'
          }
        }
        //超时则取消控件限制
        if (this.state.enableUSDxWaitTimeOutMap.get(item.txId) !== undefined) {
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


  // check_Transactions_Status
  checkTransactionsStatus = () => {
    var storage = null;
    var results = null;
    var key = null;
    if (window.localStorage) {
      if (typeof web3 === 'undefined') {
        return;
      }
      storage = window.localStorage;
      key = getTransactionHistoryKey(this.web3.eth.accounts[0], Asset['Asset'].USDx, this.props.page, this.web3.version.network);
      results = JSON.parse(`${storage.getItem(key)}`);
    }
    // console.log(results);
    if (results === null) {
      return;
    }

    // console.log(results);

    results = results.map(item => {
      // console.log('item item item item item item')
      if (item.icon === 'loading-supply-wrap') {
        //超时则取消控件限制
        if (item.timestamp !== undefined && diffMin(item.timestamp) >= this.state.timeOutTimes && item.timeOutFlag !== undefined && item.timeOutFlag === 1) {
          return 0;
        }
        if (item.status === 0) {
          //超时则取消控件限制
          let timeOutFlag = -1;
          if (item.timestamp !== undefined && diffMin(item.timestamp) >= this.state.timeOutTimes && item.timeOutFlag !== undefined && item.timeOutFlag !== 1) {
            timeOutFlag = 1;
            this.setState({ isWrapEnable: true, wrapInputDisabled: false, wrapAmount: '' })
          } else {
            this.setState({ isWrapEnable: false, wrapInputDisabled: true })
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
              if (this.state.supplyWrapWaitUpdateForSuccessMap.get(item.txId) === undefined) {
                this.state.supplyWrapWaitUpdateForSuccessMap.set(item.txId, item);
              }
            }
            if (flag === 0) {
              if (this.state.supplyWrapWaitUpdateForFailedMap.get(item.txId) === undefined) {
                this.state.supplyWrapWaitUpdateForFailedMap.set(item.txId, item);
              }
            }
            //超时则取消控件限制
            if (timeOutFlag === 1) {
              if (this.state.supplyWrapWaitTimeOutMap.get(item.txId) === undefined) {
                this.state.supplyWrapWaitTimeOutMap.set(item.txId, item);
              }
            }
          }, 3000);
        } else {
          this.setState({ isWrapEnable: true, wrapInputDisabled: false });
        }
      }
      if (item.icon === 'loading-supply-unwrap') {
        // console.log('item item item item item item')
        //超时则取消控件限制
        if (item.timestamp !== undefined && diffMin(item.timestamp) >= this.state.timeOutTimes && item.timeOutFlag !== undefined && item.timeOutFlag === 1) {
          return 0;
        }
        if (item.status === 0) {
          //超时则取消控件限制
          let timeOutFlag = -1;
          if (item.timestamp !== undefined && diffMin(item.timestamp) >= this.state.timeOutTimes && item.timeOutFlag !== undefined && item.timeOutFlag !== 1) {
            timeOutFlag = 1;
            // to be fixed
            this.setState({ isunwrapEnable: true, unwrapAmount: '', unwrapInputDisabled: false, unwrapMaxClassName: 'max-amount-button' })
          } else {
            this.setState({ isunwrapEnable: false, unwrapInputDisabled: true, unwrapMaxClassName: 'max-amount-button-disable' })
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
              if (this.state.supplyUnwrapWaitUpdateForSuccessMap.get(item.txId) === undefined) {
                this.state.supplyUnwrapWaitUpdateForSuccessMap.set(item.txId, item);
              }
            }
            if (flag === 0) {
              if (this.state.supplyUnwrapWaitUpdateForFailedMap.get(item.txId) === undefined) {
                this.state.supplyUnwrapWaitUpdateForFailedMap.set(item.txId, item);
              }
            }
            //超时则取消控件限制
            if (timeOutFlag === 1) {
              if (this.state.supplyUnwrapWaitTimeOutMap.get(item.txId) === undefined) {
                this.state.supplyUnwrapWaitTimeOutMap.set(item.txId, item);
              }
            }
          }, 3000);
        } else {
          this.setState({ isunwrapEnable: true, unwrapInputDisabled: false });
        }
      }
      if (item.icon === 'loading-supply-weth') {
        //超时则取消控件限制
        if (item.timestamp !== undefined && diffMin(item.timestamp) >= this.state.timeOutTimes && item.timeOutFlag !== undefined && item.timeOutFlag === 1) {
          return 0;
        }
        if (item.status === 0) {
          //超时则取消控件限制
          let timeOutFlag = -1;
          if (item.timestamp !== undefined && diffMin(item.timestamp) >= this.state.timeOutTimes && item.timeOutFlag !== undefined && item.timeOutFlag !== 1) {
            timeOutFlag = 1;
            this.setState({ isSupplyEnable: true, supplyAmount: '', supplyButtonText: this.props.supplyButtonInfo, supplyInputDisabled: false, maxClassName: 'max-amount-button' });
          } else {
            this.setState({ isSupplyEnable: false, supplyButtonText: 'SUBMITTING…', supplyInputDisabled: true, maxClassName: 'max-amount-button-disable' });
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
              if (this.state.supplyWETHWaitUpdateForSuccessMap.get(item.txId) === undefined) {
                this.state.supplyWETHWaitUpdateForSuccessMap.set(item.txId, item);
              }
            }
            if (flag === 0) {
              if (this.state.supplyWETHWaitUpdateForFailedMap.get(item.txId) === undefined) {
                this.state.supplyWETHWaitUpdateForFailedMap.set(item.txId, item);
              }
            }
            //超时则取消控件限制
            if (timeOutFlag === 1) {
              if (this.state.supplyWETHWaitTimeOutMap.get(item.txId) === undefined) {
                this.state.supplyWETHWaitTimeOutMap.set(item.txId, item);
              }
            }
          }, 3000);
        } else {
          this.setState({ isSupplyEnable: true, supplyInputDisabled: false });
        }
      }
      if (item.icon === 'loading-supply-withdraw-weth') {
        if (item.status === 0) {
          //超时则取消控件限制
          if (item.timestamp !== undefined && diffMin(item.timestamp) >= this.state.timeOutTimes && item.timeOutFlag !== undefined && item.timeOutFlag === 1) {
            return 0;
          }
          //超时则取消控件限制
          let timeOutFlag = -1;
          if (item.timestamp !== undefined && diffMin(item.timestamp) >= this.state.timeOutTimes && item.timeOutFlag !== undefined && item.timeOutFlag !== 1) {
            timeOutFlag = 1;
            this.setState({ isWithdrawEnable: true, withdrawAmount: '', withdrawMax: false, withdrawButtonText: this.state.withdrawButtonInfo, withdrawInputDisabled: true, withdrawMaxClassName: 'max-amount-button' });
          } else {
            this.setState({ isWithdrawEnable: false, withdrawButtonText: 'SUBMITTING…', withdrawInputDisabled: true, withdrawMaxClassName: 'max-amount-button-disable' });
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
              if (this.state.withdrawWETHWaitUpdateForSuccessMap.get(item.txId) === undefined) {
                this.state.withdrawWETHWaitUpdateForSuccessMap.set(item.txId, item);
              }
            }
            if (flag === 0) {
              if (this.state.withdrawWETHWaitUpdateForFailedMap.get(item.txId) === undefined) {
                this.state.withdrawWETHWaitUpdateForFailedMap.set(item.txId, item);
              }
            }
            //超时则取消控件限制
            if (timeOutFlag === 1) {
              if (this.state.withdrawWETHWaitTimeOutMap.get(item.txId) === undefined) {
                this.state.withdrawWETHWaitTimeOutMap.set(item.txId, item);
              }
            }
          }, 3000);
        } else {
          this.setState({ isWithdrawEnable: true, withdrawInputDisabled: false });
        }
      }

      if (item.icon === 'loading-supply-usdx') {
        //超时则取消控件限制
        if (item.timestamp !== undefined && diffMin(item.timestamp) >= this.state.timeOutTimes && item.timeOutFlag !== undefined && item.timeOutFlag === 1) {
          return 0;
        }
        if (item.status === 0) {
          //超时则取消控件限制
          let timeOutFlag = -1;
          if (item.timestamp !== undefined && diffMin(item.timestamp) >= this.state.timeOutTimes && item.timeOutFlag !== undefined && item.timeOutFlag !== 1) {
            timeOutFlag = 1;
            this.setState({ isSupplyEnable: true, supplyAmount: '', supplyInputDisabled: false, supplyButtonText: this.props.supplyButtonInfo, maxClassName: 'max-amount-button' });
          } else {
            this.setState({ isSupplyEnable: false, supplyButtonText: 'SUBMITTING…', supplyInputDisabled: true, maxClassName: 'max-amount-button-disable' });
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
              if (this.state.supplyUSDxWaitUpdateForSuccessMap.get(item.txId) === undefined) {
                this.state.supplyUSDxWaitUpdateForSuccessMap.set(item.txId, item);
              }
            }
            if (flag === 0) {
              if (this.state.supplyUSDxWaitUpdateForFailedMap.get(item.txId) === undefined) {
                this.state.supplyUSDxWaitUpdateForFailedMap.set(item.txId, item);
              }
            }
            //超时则取消控件限制
            if (timeOutFlag === 1) {
              if (this.state.supplyUSDxWaitTimeOutMap.get(item.txId) === undefined) {
                this.state.supplyUSDxWaitTimeOutMap.set(item.txId, item);
              }
            }
          }, 3000);
        } else {
          this.setState({ isSupplyEnable: true, supplyInputDisabled: false });
        }
      }

      if (item.icon === 'loading-supply-withdraw-usdx') {
        //超时则取消控件限制
        if (item.timestamp !== undefined && diffMin(item.timestamp) >= this.state.timeOutTimes && item.timeOutFlag !== undefined && item.timeOutFlag === 1) {
          return 0;
        }
        if (item.status === 0) {
          //超时则取消控件限制
          let timeOutFlag = -1;
          if (item.timestamp !== undefined && diffMin(item.timestamp) >= this.state.timeOutTimes && item.timeOutFlag !== undefined && item.timeOutFlag !== 1) {
            timeOutFlag = 1;
            this.setState({ isWithdrawEnable: true, withdrawInputDisabled: false, withdrawButtonText: this.props.withdrawButtonInfo, withdrawMax: false, withdrawMaxClassName: 'max-amount-button' });
          } else {
            this.setState({ isWithdrawEnable: false, withdrawButtonText: 'SUBMITTING…', withdrawInputDisabled: true, withdrawMaxClassName: 'max-amount-button-disable' });
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
              if (this.state.withdrawUSDxWaitUpdateForSuccessMap.get(item.txId) === undefined) {
                this.state.withdrawUSDxWaitUpdateForSuccessMap.set(item.txId, item);
              }
            }
            if (flag === 0) {
              if (this.state.withdrawUSDxWaitUpdateForFailedMap.get(item.txId) === undefined) {
                this.state.withdrawUSDxWaitUpdateForFailedMap.set(item.txId, item);
              }
            }
            //超时则取消控件限制
            if (timeOutFlag === 1) {
              if (this.state.withdrawUSDxWaitTimeOutMap.get(item.txId) === undefined) {
                this.state.withdrawUSDxWaitTimeOutMap.set(item.txId, item);
              }
            }
          }, 3000);
        } else {
          this.setState({ isWithdrawEnable: true, withdrawInputDisabled: false });
        }
      }
      if (item.icon === 'loading-supply-weth-approve') {
        //超时则取消控件限制
        if (item.timestamp !== undefined && diffMin(item.timestamp) >= this.state.timeOutTimes && item.timeOutFlag !== undefined && item.timeOutFlag === 1) {
          return 0;
        }
        if (item.status === 0) {
          //超时则取消控件限制
          let timeOutFlag = -1;
          if (item.timestamp !== undefined && diffMin(item.timestamp) >= this.state.timeOutTimes && item.timeOutFlag !== undefined && item.timeOutFlag !== 1) {
            timeOutFlag = 1;
            this.setState({ isApproved: false, pendingApproval: false });
            this.setState({ buttonText: this.props.approveButtonInfo });
          } else {
            this.setState({ buttonText: 'ENABLEING WETH...', pendingApproval: true });
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
              if (this.state.enableWETHWaitUpdateForSuccessMap.get(item.txId) === undefined) {
                this.state.enableWETHWaitUpdateForSuccessMap.set(item.txId, item);
              }
            }
            if (flag === 0) {
              if (this.state.enableWETHWaitUpdateForFailedMap.get(item.txId) === undefined) {
                this.state.enableWETHWaitUpdateForFailedMap.set(item.txId, item);
              }
            }
            //超时则取消控件限制
            if (timeOutFlag === 1) {
              if (this.state.enableWETHWaitTimeOutMap.get(item.txId) === undefined) {
                this.state.enableWETHWaitTimeOutMap.set(item.txId, item);
              }
            }
          }, 3000);
        } else {
          this.setState({ pendingApproval: false });
        }
      }

      if (item.icon === 'loading-supply-usdx-approve') {
        //超时则取消控件限制
        if (item.timestamp !== undefined && diffMin(item.timestamp) >= this.state.timeOutTimes && item.timeOutFlag !== undefined && item.timeOutFlag === 1) {
          return 0;
        }
        if (item.status === 0) {
          //超时则取消控件限制
          let timeOutFlag = -1;
          if (item.timestamp !== undefined && diffMin(item.timestamp) >= this.state.timeOutTimes && item.timeOutFlag !== undefined && item.timeOutFlag !== 1) {
            timeOutFlag = 1;
            this.setState({ isApproved: false, pendingApproval: false });
            this.setState({ buttonText: this.props.approveButtonInfo });
          } else {
            this.setState({ buttonText: 'ENABLEING USDx...', pendingApproval: true });
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
              if (this.state.enableUSDxWaitTimeOutMap.get(item.txId) === undefined) {
                this.state.enableUSDxWaitTimeOutMap.set(item.txId, item);
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

  mmMonitor = () => {
    if (MoneyMarket() === undefined) {
      return;
    }
    let that = this;
    var supplyReceivedEvent = MoneyMarket().SupplyReceived();
    supplyReceivedEvent.watch((error, result) => {
      console.log('watch -> supplyReceivedEvent:' + JSON.stringify(result));
      if (error) {
        console.log('watch mmMonitor supplyReceivedEvent error --> ' + JSON.stringify(error));
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
        if (that.props.wethCoin === true) {
          key = getTransactionHistoryKey(that.props.account, Asset['Asset'].WETH, that.props.page, that.web3.version.network);
        } else if (that.props.usdxCoin === true) {
          key = getTransactionHistoryKey(that.props.account, Asset['Asset'].USDx, that.props.page, that.web3.version.network);
        }
        results = JSON.parse(`${storage.getItem(key)}`);
      }
      if (results === null) {
        return;
      }
      let resultObj = JSON.parse(JSON.stringify(result));
      var txId = resultObj.transactionHash;
      // Refresh Data
      that.refreshData();
      that.setState({ isSupplyEnable: true, supplyAmount: null, supplyInputDisabled: false, maxClassName: 'max-amount-button' });
      that.setState({ withdrawAmount: null, isWithdrawEnable: true, withdrawMax: false, withdrawInputDisabled: false, withdrawMaxClassName: 'max-amount-button' });

      if (that.props.wethCoin === true) {
        that.setState({ unwrapAmount: '' });
      }
      storage.removeItem(key);
      let argsObj = JSON.parse(JSON.stringify(resultObj.args));
      results = results.map(item => {
        // check is speed up
        if (item.status === 0 && item.transactionType === 'Supply' && item.realAmount === argsObj.amount && item.txId !== txId) {
          let txnHashHref = getTxnHashHref(that.web3.version.network) + txId;
          return {
            ...item,
            icon: 'supply',
            status: 1,
            txId: txId,
            txnHashHref: txnHashHref
          }
        } else if (item.txId === txId) { // normal update
          return {
            ...item,
            icon: 'supply',
            status: 1
          }
        }
        return {
          ...item
        }
      })
      storage.setItem(key, JSON.stringify(results));
    });
    var supplyWithdrawnEvent = MoneyMarket().SupplyWithdrawn();
    supplyWithdrawnEvent.watch(function (error, result) {
      console.log('watch -> supplyWithdrawnEvent:' + JSON.stringify(result));
      if (error) {
        console.log('watch mmMonitor supplyWithdrawnEvent error --> ' + JSON.stringify(error));
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
        if (that.props.wethCoin === true) {
          key = getTransactionHistoryKey(that.props.account, Asset['Asset'].WETH, that.props.page, that.web3.version.network);
        } else if (that.props.usdxCoin === true) {
          key = getTransactionHistoryKey(that.props.account, Asset['Asset'].USDx, that.props.page, that.web3.version.network);
        }
        results = JSON.parse(`${storage.getItem(key)}`);
      }
      if (results === null) {
        return;
      }
      let resultObj = JSON.parse(JSON.stringify(result));
      var txId = resultObj.transactionHash;
      // Refresh data
      that.refreshData();
      that.setState({ isWithdrawEnable: true, supplyAmount: '' });
      that.setState({ withdrawAmount: null, withdrawMax: false, withdrawInputDisabled: false, withdrawMaxClassName: 'max-amount-button' });
      storage.removeItem(key);
      let argsObj = JSON.parse(JSON.stringify(resultObj.args));
      results = results.map(item => {
        // check is speed up
        if (item.status === 0 && item.transactionType === 'Withdraw' && item.realAmount === argsObj.amount && item.txId !== txId) {
          let txnHashHref = getTxnHashHref(that.web3.version.network) + txId;
          return {
            ...item,
            icon: 'withdraw',
            status: 1,
            txId: txId,
            txnHashHref: txnHashHref
          }
        } else if (item.txId === txId) {
          return {
            ...item,
            icon: 'withdraw',
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
        console.log('watch mmMonitor failureEvent error --> ' + JSON.stringify(error));
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
        if (that.props.wethCoin === true) {
          key = getTransactionHistoryKey(that.props.account, Asset['Asset'].WETH, that.props.page, that.web3.version.network);
        } else if (that.props.usdxCoin === true) {
          key = getTransactionHistoryKey(that.props.account, Asset['Asset'].USDx, that.props.page, that.web3.version.network);
        }
        results = JSON.parse(`${storage.getItem(key)}`);
      }
      if (results === null) {
        return;
      }
      let resultObj = JSON.parse(JSON.stringify(result));
      var txId = resultObj.transactionHash;
      that.refreshData();
      that.setState({ isSupplyEnable: true, supplyAmount: null, supplyInputDisabled: false, maxClassName: 'max-amount-button' });
      if (that.props.wethCoin === true) {
        that.setState({ unwrapAmount: '' });
      }
      that.setState({ isWithdrawEnable: true, supplyAmount: '', withdrawInputDisabled: false, withdrawMaxClassName: 'max-amount-button' });
      that.setState({ withdrawAmount: null, withdrawMax: false });
      // change icon and status = 1 by txId
      storage.removeItem(key);
      results = results.map(item => {
        if (item.txId === txId) {
          let errorArgs = resultObj.args;
          let argsObj = JSON.parse(JSON.stringify(errorArgs));
          console.log('failure info:' + ErrorCode[argsObj.error]);
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
      if (event === 'BorrowTaken' || event === 'BorrowRepaid') {
        this.setState({ withdrawAmount: '' });
        // this.getMaxWithdrawAmount();
        this.getmaxWithdrawUSDXAmount();
        this.getAccountBalance();
        // this.getMyAddressWETHBalance();
      }
    });
  }

  componentDidMount_temp = () => {
    // event monitor
    // this.usdxEventMonitor();//imtoken测试临时注释
    // this.wethEventMonitor();//imtoken测试临时注释
    //非imtoken用 ，否则用imtoken测试临时注释
    if (window.web3 !== undefined && window.ethereum.isImToken === undefined) {
      this.usdxEventMonitor();
      // this.wethEventMonitor();
    }
    // Recent Transactions status = 0
    this.checkTransactionsStatusTimer = setInterval(() => {
      this.checkTransactionsStatus();
    }, 1000);
    //check
    this.checkWaitingUpdateTimer = setInterval(() => {
      this.checkWaitingUpdateTransactionRecords();
    }, 1000);
    // this.mmMonitor();//imtoken测试临时注释
    // this.refreshDataEventMonitor();//imtoken测试临时注释
    //非imtoken用 ，否则用imtoken测试临时注释
    if (window.web3 !== undefined && window.ethereum.isImToken === undefined) {
      this.mmMonitor();
      this.refreshDataEventMonitor()
    }
    this.getAllowance();
    this.getCollateralRatio();
    this.getCurrentSupplyAssetAmount();
    this.getAccountBalance();
    this.getAssetBalance();
    this.getUSDxAssetPrice();
    // this.getMaxWithdrawAmount();
    this.getmaxWithdrawUSDXAmount();

    this.refreshInterval = setInterval(() => {
      this.getCurrentSupplyAssetAmount();
      this.getAssetBalance();
      // this.getMaxWithdrawAmount();
      this.getmaxWithdrawUSDXAmount();
      this.getAccountBalance();
    }, 1000 * 15)
  }

  componentWillUnmount() {
    // clearInterval(this.gasPriceInterval);
    clearInterval(this.refreshInterval);
    clearInterval(this.accountInterval);
    clearInterval(this.checkTransactionsStatusTimer);
    clearInterval(this.checkWaitingUpdateTimer);
  }


  render() {
    const approveProps = {
      enableMessage: `Before supplying USDx for the first time, you must enable USDx.`,
      isEnable: !this.state.pendingApproval,
      buttonInfo: this.state.isApproved ? this.props.approveButtonInfo : (this.state.buttonText === '' ? this.props.approveButtonInfo : this.state.buttonText),
      handleClick: this.handleApprove,
      page: this.props.page
    };

    const supplyProps = {
      balanceDescription: '',
      balanceAmount: this.state.accountBalance,
      balanceType: 'USDx',
      balanceUnit: 'Balance',
      minAmount: 0,
      maxAmount: this.state.maxSupplyAmount,
      step: 0.01,
      amount: this.state.supplyAmount,
      isEnable: this.state.isSupplyEnable,
      inputDisabled: this.state.supplyInputDisabled,
      buttonInfo: this.state.isSupplyEnable ? this.props.supplyButtonInfo : this.state.supplyButtonText,
      handleChange: this.handleSupplyChange,
      handleClick: this.handleSupplyClick,
      handleMax: this.handleSupplyMax,
      hasBorrowedUSDx: this.props.hasBorrowedUSDx,
      placeholderHint: 'Amount in USDx',
      buttonClassName: 'button-wrapper',
      maxClassName: this.state.maxClassName
    };

    const withdrawProps = {
      balanceDescription: '',
      balanceAmount: this.state.maxWithdrawUSDXAmount,
      balanceType: 'USDx',
      balanceUnit: 'Available',
      minAmount: 0,
      maxAmount: this.state.maxWithdrawUSDXAmount,
      step: 0.01,
      amount: this.state.withdrawAmount,
      isEnable: this.state.isWithdrawEnable,
      inputDisabled: this.state.withdrawInputDisabled,
      buttonInfo: this.state.isWithdrawEnable ? this.props.withdrawButtonInfo : this.state.withdrawButtonText,
      handleChange: this.handleWithdrawChange,
      handleMax: this.handleWithdrawMax,
      handleClick: this.handleWithdrawClick,
      hasBorrowedUSDx: this.props.hasBorrowedUSDx,
      placeholderHint: 'Amount in USDx',
      buttonClassName: 'button-wrapper',
      maxClassName: this.state.withdrawMaxClassName
    };

    return (
      <div className='supply-input'>
        <BalanceInfoWithIcon coin={'USDx'} action={'Supplied'} login={window.web3.eth.accounts[0] ? true : false} />

        <Tabs className='tab-wrapper' animated={true} size='large' onChange={this.changePane}>
          <TabPane tab={this.props.tabLeftName} key="1" className='tab-content'>
            {
              this.props.isApproved_USDx == 1
                ?
                <span>
                  <CoinBalance coin={'usdx'} login={this.props.login} />
                  <InputUnit {...supplyProps} />
                </span>
                :
                null
            }
            {
              this.props.not_approve_atfirst_USDX == 1
                ?
                <Approve {...approveProps} />
                :
                null
            }
          </TabPane>

          <TabPane tab={this.props.tabRightName} key="2" className='tab-content'>
            {this.props.isApproved_USDx == 1 && <CoinAvailable coin={'usdx'} action={'withdraw'} login={this.props.login} father_USDx={this.state.maxWithdrawUSDXAmount} />}
            {this.props.isApproved_USDx == 1 ? <InputUnit {...withdrawProps} /> : <Approve {...approveProps} />}
          </TabPane>

        </Tabs>
      </div>
    )
  }
}

export default SupplyInput;