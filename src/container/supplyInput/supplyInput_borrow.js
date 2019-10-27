import React, { Component } from 'react';
import { Tabs } from 'antd'
import Approve from '../../component/approve/approve';
import InputUnit from '../../component/inputUnit/inputUnit';
import WrapInputUnit from '../../component/inputUnit/wrapInputUnit';
import UnWrapInputUnit from '../../component/inputUnit/unWrapInputUnit';
import WETH from '../../ABIs/WETH'
import USDX from "../../ABIs/USDX.js";
import MoneyMarket from './../../ABIs/MoneyMarket.js';
import { saveTransaction, getTxnHashHref, toDoubleThousands, validNumber, toFormatShowNumber, toFormat10Number, getTransactionHistoryKey, findNetwork, diffMin, formatBigNumber } from '../../util.js'
import Asset from '../../constant.json';
import Network from '../../constant.json';
import './supplyInput.scss';
import CoinAvailable from './../coinAvailable/coinAvailable_2_1';
import CoinBalance from './../coinBalance/coinBalance';
import BalanceInfoWithIcon from './../balanceInfoWithIcon/balanceInfoWithIcon_borrow';
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
      maxUnwrapAmount: 0,
      wrapAmount: '',
      unwrapAmount: '',
      coinAllowance: 0,
      accountBalance: 0,
      ethAccountBalance: 0,
      wethAccountBalance: 0,
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
      i_clicked_approve_btn: 0
    }
    this.web3 = window.web3;

    if (window.ethereum === undefined) {
      return;
    }
    window.ethereum.on('accountsChanged', (accounts) => {
      setTimeout(this.refreshData(), 500);
      this.getAllowance();
      this.getMaxWithdrawAmount();
      this.getAccountBalance();
      this.getMyAddressWETHBalance();
      this.setState({ supplyAmount: '', withdrawAmount: '', wrapAmount: '', unwrapAmount: '' });
      // reset button&inputText status
      this.setState({ isWrapEnable: true, wrapInputDisabled: false });
      this.setState({ isunwrapEnable: true, unwrapInputDisabled: false });
      this.setState({ isSupplyEnable: true, supplyInputDisabled: false });
      this.setState({ isWithdrawEnable: true, withdrawInputDisabled: false });
      this.setState({ pendingApproval: false });
    });

    this.componentDidMount_temp();

    window.ethereum.on('accountsChanged', () => {
      this.componentDidMount_temp();
    });
  };

  // get_Account_ETH_Balance
  getAccountETHBalance = () => {
    if (typeof web3 !== 'undefined' && this.web3.eth.accounts[0] !== undefined) {
      this.web3.eth.getBalance(this.web3.eth.accounts[0], (err, balance) => {
        if (balance !== undefined && balance !== null) {
          this.setState({ ethAccountBalance: toFormatShowNumber(this.web3.fromWei(balance.toNumber(), "ether")) }, () => {
            // console.log(this.state.ethAccountBalance);
          });
        }
      });
    }
  }

  // get_MyAddress_WETH_Balance
  getMyAddressWETHBalance = () => {
    // console.log('wethBalanceAmount');
    if (typeof web3 !== 'undefined' && this.web3.eth.accounts[0] !== undefined && WETH() !== undefined) {
      WETH().balanceOf(this.web3.eth.accounts[0], (err, res) => {
        let wethBalanceAmount = 0;
        if (res !== undefined && res !== null) {
          wethBalanceAmount = res.toNumber();
          this.setState({
            wethAccountBalance: toFormatShowNumber(this.web3.fromWei(wethBalanceAmount, "ether")),
            maxUnwrapAmount: toFormat10Number(this.web3.fromWei(wethBalanceAmount, "ether"))
          }, () => {
            // console.log(this.state.wethAccountBalance);
          });
        }
      });
    }
  }

  getAccountBalance = () => {
    if (window.web3 !== undefined && this.web3.eth.accounts[0] !== undefined && this.props.coin !== undefined) {
      this.props.coin.balanceOf(this.web3.eth.accounts[0], (err, res) => {
        let balance = 0;
        //SupplyMax
        if (res !== undefined && res !== null) {
          balance = formatBigNumber(res);
        }
        // let AccountBalance = toFormatShowNumber(this.web3.fromWei(balance, "ether"))
        let AccountBalance = toFormatShowNumber(balance)
        // let MaxSupplyAmount = this.web3.fromWei(balance, "ether");
        let MaxSupplyAmount = balance;
        if (this.state.accountBalance !== AccountBalance) {
          this.setState({ accountBalance: AccountBalance });
          this.setState({ isSupplyEnable: true });
          // this.setState({ buttonText: this.props.supplyButtonInfo });
          this.setState({ supplyAmount: '' });
        }
        if (this.state.maxSupplyAmount !== MaxSupplyAmount) {
          // this.setState({ maxSupplyAmount: this.web3.fromWei(balance, "ether") });
          this.setState({ maxSupplyAmount: balance });
        }
      });
    }
  }


  getAllowance = () => {
    // console.log('---------------------------')
    // console.log('into Allowance.. this.web3.eth.accounts[0]:' + this.web3.eth.accounts[0] + ' / this.props.coin:' + this.props.coin)
    if (typeof web3 === 'undefined' || this.web3.eth.accounts[0] === undefined || this.props.coin === undefined) {
      console.log('---------ka zai zhe li le')
      return;
    }
    let mmAddress = '';
    let NetworkName = findNetwork(window.web3.version.network);
    mmAddress = Network[NetworkName].MoneyMarket;
    this.props.coin.allowance(
      this.web3.eth.accounts[0],
      mmAddress,
      (err, res) => {
        let allowanceVal = -1;
        if (res !== undefined && res !== null) {
          allowanceVal = res.toNumber();
        }
        // console.log('===>' + this.web3.eth.accounts[0] + ' / allowanceVal:' + allowanceVal + ' / isApproved:' + this.state.isApproved)

        if (allowanceVal > 0) {
          this.setState({ coinAllowance: allowanceVal, isApproved: true }, () => {
            // console.log(this.state.isApproved);
          });
        } else {
          this.setState({ isApproved: false, pendingApproval: false, buttonText: this.props.approveButtonInfo });
        }
      });
  }



  getMaxWithdrawAmount = () => {
    if (typeof web3 === 'undefined' || this.web3.eth.accounts[0] === undefined || MoneyMarket() === undefined) {
      return;
    }
    let usdxAddress = '';
    let wethAddress = '';
    let withdrawAddress = '';
    let mmAddress = '';
    let NetworkName = findNetwork(window.web3.version.network);
    if (NetworkName === 'Main') {
      usdxAddress = Network.Main.USDx;
      wethAddress = Network.Main.WETH;
      withdrawAddress = Network.Main.WETH;
      mmAddress = Network.Main.MoneyMarket;
    } else if (NetworkName === 'Rinkeby') {
      usdxAddress = Network.Rinkeby.USDx;
      wethAddress = Network.Rinkeby.WETH;
      withdrawAddress = Network.Rinkeby.WETH;
      mmAddress = Network.Rinkeby.MoneyMarket;
    }
    MoneyMarket().assetPrices(wethAddress, (err, res_wethP) => {
      if (res_wethP !== undefined && res_wethP !== null) {
        this.setState({
          calcWETHPrice: this.web3.fromWei(res_wethP.toNumber(), "ether")
        }, () => {
          MoneyMarket().assetPrices(usdxAddress, (err, res_usdxP) => {
            if (res_usdxP !== undefined && res_usdxP !== null && this.state.calcWETHPrice !== 0) {
              this.setState({
                supplyAssetPrice: this.state.calcWETHPrice / this.web3.fromWei(res_usdxP.toNumber(), "ether")
              }, () => {
                MoneyMarket().collateralRatio((err, res_ratio) => {
                  if (res_ratio !== undefined && res_ratio !== null) {
                    this.setState({
                      collateralRatio: this.web3.fromWei(res_ratio.toNumber(), "ether")
                    }, () => {
                      MoneyMarket().getSupplyBalance(this.web3.eth.accounts[0], withdrawAddress, (err, res_s) => {
                        if (res_s !== undefined && res_s !== null) {
                          this.setState({
                            supplyAccountBalance: this.web3.fromWei(res_s.toNumber(), "ether")
                          }, () => {
                            WETH().balanceOf(mmAddress, (err, res_a) => {
                              if (res_a !== undefined && res_a !== null) {
                                this.setState({
                                  assetBalance: this.web3.fromWei(res_a.toNumber(), "ether")
                                }, () => {
                                  MoneyMarket().calculateAccountValues(this.web3.eth.accounts[0], (err, res) => {
                                    if (res === undefined || res === null || this.state.supplyAssetPrice === 0) {
                                      return;
                                    }
                                    let sumofSupplies = this.web3.fromWei(this.web3.fromWei(res[1].toNumber(), "ether"), "ether");
                                    let sumofBorrow = this.web3.fromWei(this.web3.fromWei(res[2].toNumber(), "ether"), "ether") * this.state.collateralRatio;
                                    let max = Math.min((sumofSupplies - sumofBorrow), this.state.supplyAccountBalance, this.state.assetBalance);
                                    if (Number(max) < 0) {
                                      max = 0;
                                    }
                                    this.setState({ maxWithdrawAmount: Number(max) });
                                  }
                                  );
                                });
                              }
                            });
                          });
                        }
                      });
                    })
                  }
                });
              });
            }
          });
        });
      }
    });
  }





  // approve weth
  handleApprove = () => {
    this.setState({ isApproved: false, buttonText: 'ENABLEING WETH...', pendingApproval: true, i_clicked_approve_btn: 1 });
    let mmAddress = '';
    let NetworkName = findNetwork(window.web3.version.network);
    if (NetworkName === 'Main') {
      mmAddress = Network.Main.MoneyMarket;
    } else if (NetworkName === 'Rinkeby') {
      mmAddress = Network.Rinkeby.MoneyMarket;
    }
    this.props.coin.approve.estimateGas(mmAddress, -1, { from: this.web3.eth.accounts[0] }, (err, gasLimit) => {
      this.web3.eth.getGasPrice((err, gasPrice) => {
        console.log('gasLimit:' + gasLimit);
        console.log('gasPrice:' + gasPrice);
        this.props.coin.approve.sendTransaction(
          mmAddress,
          -1,
          {
            from: this.web3.eth.accounts[0],
            gas: gasLimit,
            gasPrice: gasPrice
          },
          (err, res) => {
            if (res !== undefined) {
              let txId = res;
              let txnHashHref = getTxnHashHref(this.web3.version.network) + res;
              this.setState({ getHash: true, hashNumber: res, i_clicked_approve_btn: 0 });
              if (this.props.wethCoin === true) {
                saveTransaction('loading-supply-weth-approve', this.web3.eth.accounts[0], Asset['Asset'].WETH, this.props.page,
                  this.web3.version.network, 'Enable', null, 'WETH', txnHashHref, txId, 0, null, false, null);
              } else if (this.props.usdxCoin === true) {
                saveTransaction('loading-supply-usdx-approve', this.web3.eth.accounts[0], Asset['Asset'].USDx, this.props.page,
                  this.web3.version.network, 'Enable', null, 'USDx', txnHashHref, txId, 0, null, false, null);
              }
            } else {
              this.setState({ isApproved: false, pendingApproval: false, i_clicked_approve_btn: 0, buttonText: this.props.approveButtonInfo });
            }
          }
        )
      }
      )
    }
    );
  };

  // supply_weth
  handleSupplyClick = () => {
    if (this.state.supplyAmount === '' || this.state.supplyAmount === 0 || this.state.supplyAmount === null) {
      return;
    }
    this.setState({ isSupplyEnable: false, supplyButtonText: 'SUBMITTING…', supplyInputDisabled: true, maxClassName: 'max-amount-button-disable' });
    let supplyAddress = '';
    let NetworkName = findNetwork(window.web3.version.network);
    if (NetworkName === 'Main') {
      supplyAddress = Network.Main.WETH;
    } else if (NetworkName === 'Rinkeby') {
      supplyAddress = Network.Rinkeby.WETH;
    }
    MoneyMarket().supply.estimateGas(supplyAddress, this.web3.toWei(this.state.supplyAmount, "ether"), { from: this.web3.eth.accounts[0] }, (err, gasLimit) => {
      this.web3.eth.getGasPrice((err, gasPrice) => {
        console.log('supply_weth_gasLimit:' + gasLimit);
        console.log('supply_weth_gasPrice:' + gasPrice);
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
      })
    });
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
    } else if (value.toString().length > 18 || value > this.state.maxWithdrawAmount) {
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
    this.setState({ withdrawAmount: this.state.maxWithdrawAmount, withdrawMax: true });
    if (Number(this.state.maxWithdrawAmount) === 0) {
      this.setState({ isWithdrawEnable: false, withdrawButtonText: 'INSUFFICIENT LIQUIDITY' });
    } else {
      this.setState({ isWithdrawEnable: true });
    }
  }

  handleWithdrawClick = () => {
    if (this.state.withdrawAmount === '' || Number(this.state.withdrawAmount) === 0 || this.state.withdrawAmount === null) {
      return;
    }
    if (this.state.withdrawAmount > this.state.maxWithdrawAmount) {
      this.setState({ withdrawAmount: this.state.maxWithdrawAmount })
    }
    let amount = this.web3.toWei(this.state.withdrawAmount, "ether");
    if (this.state.withdrawMax) {
      amount = -1;
    }
    this.setState({ isWithdrawEnable: false, withdrawButtonText: 'SUBMITTING…', withdrawInputDisabled: true, withdrawMaxClassName: 'max-amount-button-disable' });
    let withdrawAddress = '';
    let NetworkName = findNetwork(window.web3.version.network);
    if (NetworkName === 'Main') {
      withdrawAddress = Network.Main.WETH;
    } else if (NetworkName === 'Rinkeby') {
      withdrawAddress = Network.Rinkeby.WETH;
    }
    MoneyMarket().withdraw.estimateGas(withdrawAddress, amount, { from: this.web3.eth.accounts[0] }, (err, gasLimit) => {
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
              let recordWithdrawAmount = (amount === -1) ? toDoubleThousands(this.state.maxWithdrawAmount) : toDoubleThousands(this.state.withdrawAmount);
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


  handleWrapChange = (value) => {
    if (value === null || value === '') {
      this.setState({ wrapAmount: '', isWrapEnable: true });
      return;
    } else if (value.toString().length > 18 || value > this.state.ethAccountBalance) {
      this.setState({ wrapAmount: value, isWrapEnable: false });
      return;
    }
    if (value.toString().indexOf('.') === value.toString().length - 1) {
      value = value + '00'
    }
    this.setState({ wrapAmount: value });
    if ((!validNumber(value) && value !== '') || value === 0) {
      this.setState({ isWrapEnable: false });
    } else {
      this.setState({ isWrapEnable: true });
    }
  }

  handleWrapClick = () => {
    if (this.state.wrapAmount === '' || this.web3.eth.accounts[0] === undefined) {
      return;
    }
    this.setState({ isWrapEnable: false, wrapInputDisabled: true })
    WETH().deposit.estimateGas(
      {
        from: this.web3.eth.accounts[0],
        value: this.web3.toWei(this.state.wrapAmount, "ether")
      },
      (err, gasLimit) => {
        console.log('gasLimit:' + gasLimit);
        this.web3.eth.getGasPrice((err, gasPrice) => {
          console.log('gasPrice:' + gasPrice);
          if (gasPrice === undefined && gasPrice === null) {
            console.err('gasPrice is ' + gasPrice)
            return;
          }
          WETH().deposit.sendTransaction(
            {
              from: this.web3.eth.accounts[0],
              value: this.web3.toWei(this.state.wrapAmount, "ether"),
              gas: gasLimit,
              gasPrice: gasPrice
            },
            (err, res) => {
              if (res !== undefined && res !== null) {
                let txId = res;
                let txnHashHref = getTxnHashHref(this.web3.version.network) + res;
                saveTransaction('loading-supply-wrap', this.web3.eth.accounts[0], Asset['Asset'].WETH,
                  this.props.page, this.web3.version.network, 'Wrap', toDoubleThousands(this.state.wrapAmount), 'ETH', txnHashHref, txId, 0, this.web3.toWei(this.state.wrapAmount, "ether"), false, null);
              } else {
                this.setState({ isWrapEnable: true, wrapInputDisabled: false })
              }
            }
          )
        }
        )
      }
    );
  }


  // unwrap
  handleunwrapChange = (value) => {
    // console.log(value);
    if (value === null || value === '') {
      this.setState({ unwrapAmount: '' });
      this.setState({ isunwrapEnable: true });
      return;
    } else if (value.toString().length > 18 || value > this.state.maxUnwrapAmount) {
      this.setState({ unwrapAmount: value });
      this.setState({ isunwrapEnable: false });
      return;
    }

    if (value.toString().indexOf('.') === value.toString().length - 1) {
      value = value + '00'
    }

    this.setState({ unwrapAmount: value });
    if ((!validNumber(value) && value !== '') || value === 0) {
      this.setState({ isunwrapEnable: false });
    } else {
      this.setState({ isunwrapEnable: true });
    }
  }

  // handle_unwrap_Max
  handleunwrapMax = () => {
    this.setState({ unwrapAmount: this.state.maxUnwrapAmount }, () => {
      if (Number(this.state.maxUnwrapAmount) === 0) {
        this.setState({ isunwrapEnable: false });
      } else {
        this.setState({ isunwrapEnable: true });
      }
      // console.log(this.state.unwrapAmount);
    });
  }

  handleunwrapClick = () => {
    if (this.state.unwrapAmount === '' || this.state.unwrapAmount === null || Number(this.state.unwrapAmount) === 0) {
      return;
    }
    this.setState({ isunwrapEnable: false, unwrapInputDisabled: true, unwrapMaxClassName: 'max-amount-button-disable' })

    WETH().withdraw.estimateGas(
      this.web3.toWei(this.state.unwrapAmount, "ether"),
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
          WETH().withdraw.sendTransaction(
            this.web3.toWei(this.state.unwrapAmount, "ether"),
            {
              from: this.web3.eth.accounts[0],
              gas: gasLimit,
              gasPrice: gasPrice
            },
            (err, res) => {
              if (res !== undefined && res !== null) {
                let txId = res;
                let txnHashHref = getTxnHashHref(this.web3.version.network) + res;
                saveTransaction('loading-supply-unwrap', this.web3.eth.accounts[0], Asset['Asset'].WETH, this.props.page,
                  this.web3.version.network, 'Unwrap', toDoubleThousands(this.state.unwrapAmount), 'ETH', txnHashHref, txId, 0, this.web3.toWei(this.state.unwrapAmount, "ether"), false, null);
              } else {
                this.setState({ isunwrapEnable: true, unwrapInputDisabled: false });
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
      console.log('watch lend-> approvalUSDXEvent:' + JSON.stringify(result));
      if (error) {
        console.log('watch lend usdxEventMonitor approvalUSDXEvent error --> ' + JSON.stringify(error));
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

  wethEventMonitor = () => {
    if (WETH() === undefined) {
      return;
    }
    let that = this;
    var approvalWETHEvent = WETH().Approval();
    approvalWETHEvent.watch((error, result) => {
      console.log('watch -> approvalWETHEvent:' + JSON.stringify(result));
      if (error) {
        console.log('watch wethEventMonitor approvalWETHEvent error --> ' + JSON.stringify(error));
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
        key = getTransactionHistoryKey(that.props.account, Asset['Asset'].WETH, that.props.page, that.web3.version.network);
        results = JSON.parse(`${storage.getItem(key)}`);
      }
      if (results === null) {
        return;
      }
      let resultObj = JSON.parse(JSON.stringify(result));
      var txId = resultObj.transactionHash;
      this.getAllowance();
      this.setState({ pendingApproval: false, isApproved: true });
      // change icon and status = 1 by txId
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
    //测试用weth_faucet 暂时注释
    // let NetworkName = findNetwork(window.web3.version.network);
    // if (NetworkName === 'Rinkeby') {//测试用weth_faucet 暂时注释  主网支持后放开判断
    var depositWETHEvent = WETH().Deposit();
    depositWETHEvent.watch((error, result) => {
      console.log('watch -> depositWETHEvent:' + JSON.stringify(result));
      if (error) {
        console.log('watch wethEventMonitor depositWETHEvent error --> ' + JSON.stringify(error));
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
        key = getTransactionHistoryKey(that.props.account, Asset['Asset'].WETH, that.props.page, that.web3.version.network);
        results = JSON.parse(`${storage.getItem(key)}`);
      }
      if (results === null) {
        return;
      }
      let resultObj = JSON.parse(JSON.stringify(result));
      var txId = resultObj.transactionHash;
      // Refresh data
      // console.log('rrrrrrrrrrrrrrrrrrrrrrrrr')
      this.refreshData();
      this.getAccountETHBalance();
      this.setState({ wrapAmount: '', isWrapEnable: true, wrapInputDisabled: false });
      this.setState({ isSupplyEnable: true, supplyButtonText: this.props.supplyButtonInfo, supplyAmount: '' });
      this.setState({ unwrapAmount: '', isunwrapEnable: true });
      this.setState({ withdrawAmount: '', withdrawMax: false, isWithdrawEnable: true });
      storage.removeItem(key);
      let argsObj = JSON.parse(JSON.stringify(resultObj.args));
      results = results.map(item => {
        // check is speed up
        if (item.status === 0 && item.transactionType === 'Wrap' && item.realAmount === argsObj.wad && item.txId !== txId) {
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

    //测试用weth_faucet 暂时注释
    var withdrawalWETHEvent = WETH().Withdrawal();
    withdrawalWETHEvent.watch((error, result) => {
      console.log('watch -> withdrawalWETHEvent:' + JSON.stringify(result));
      if (error) {
        console.log('watch wethEventMonitor withdrawalWETHEvent error --> ' + JSON.stringify(error));
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
        key = getTransactionHistoryKey(that.props.account, Asset['Asset'].WETH, that.props.page, that.web3.version.network);
        results = JSON.parse(`${storage.getItem(key)}`);
      }
      if (results === null) {
        return;
      }
      let resultObj = JSON.parse(JSON.stringify(result));
      var txId = resultObj.transactionHash;
      // Refresh data
      this.refreshData();
      this.setState({ unwrapAmount: '', isunwrapEnable: true, supplyAmount: '', unwrapInputDisabled: false, maxClassName: 'max-amount-button' });
      storage.removeItem(key);
      let argsObj = JSON.parse(JSON.stringify(resultObj.args));
      results = results.map(item => {
        // check is speed up
        if (item.status === 0 && item.transactionType === 'Unwrap' && item.realAmount === argsObj.wad && item.txId !== txId) {
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
    // }
  }

  refreshData = () => {
    this.getAccountETHBalance();
    // this.getCurrentSupplyAssetAmount();
    this.getAccountBalance();
    // this.getAssetBalance();
    // this.getCalcWETHPrice();
    // this.getWETHAssetPrice();
    this.getMaxWithdrawAmount();
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
      if (item.icon === 'loading-supply-wrap') {
        if (this.state.supplyWrapWaitUpdateForSuccessMap.get(item.txId) !== undefined) {
          this.setState({ isWrapEnable: true, wrapInputDisabled: false });
          //imtoken用
          if (window.ethereum.isImToken !== undefined && window.ethereum.isImToken === true) {
            // Refresh data
            this.refreshData();
            this.getAccountETHBalance();
            this.setState({ wrapAmount: '', isWrapEnable: true, wrapInputDisabled: false, });
          }
          return {
            ...item,
            icon: 'done',
            status: 1
          }
        }
        if (this.state.supplyWrapWaitUpdateForFailedMap.get(item.txId) !== undefined) {
          this.setState({ isWrapEnable: true, wrapInputDisabled: false });
          //imtoken用
          if (window.ethereum.isImToken !== undefined && window.ethereum.isImToken === true) {
            // Refresh data
            this.refreshData();
            this.getAccountETHBalance();
            this.setState({ wrapAmount: '', isWrapEnable: true, wrapInputDisabled: false, });
          }
          return {
            ...item,
            icon: 'failure',
            status: 1,
            failed: true,
            failedInfo: 'WRAP FAILURE'
          }
        }
        //超时则取消控件限制
        if (this.state.supplyWrapWaitTimeOutMap.get(item.txId) !== undefined) {
          return {
            ...item,
            timeOutFlag: 1
          }
        }
      }

      if (item.icon === 'loading-supply-unwrap') {
        if (this.state.supplyUnwrapWaitUpdateForSuccessMap.get(item.txId) !== undefined) {
          this.setState({ isunwrapEnable: true, unwrapInputDisabled: false });
          //imtoken用
          if (window.ethereum.isImToken !== undefined && window.ethereum.isImToken === true) {
            // Refresh data
            this.refreshData();
            this.setState({ unwrapAmount: '', isunwrapEnable: true, supplyAmount: '', unwrapInputDisabled: false, maxClassName: 'max-amount-button' });
          }
          return {
            ...item,
            icon: 'done',
            status: 1
          }
        }
        if (this.state.supplyUnwrapWaitUpdateForFailedMap.get(item.txId) !== undefined) {
          this.setState({ isunwrapEnable: true, unwrapInputDisabled: false });
          return {
            ...item,
            icon: 'failure',
            status: 1,
            failed: true,
            failedInfo: 'UNWRAP FAILURE'
          }
        }
        //超时则取消控件限制
        if (this.state.supplyUnwrapWaitUpdateForFailedMap.get(item.txId) !== undefined) {
          return {
            ...item,
            timeOutFlag: 1
          }
        }
      }

      if (item.icon === 'loading-supply-weth') {
        if (this.state.supplyWETHWaitUpdateForSuccessMap.get(item.txId) !== undefined) {
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
        if (this.state.supplyWETHWaitUpdateForFailedMap.get(item.txId) !== undefined) {
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
            failedInfo: 'SUPPLY WETH FAILURE'
          }
        }
        //超时则取消控件限制
        if (this.state.supplyWETHWaitTimeOutMap.get(item.txId) !== undefined) {
          return {
            ...item,
            timeOutFlag: 1
          }
        }
      }

      if (item.icon === 'loading-supply-withdraw-weth') {
        if (this.state.withdrawWETHWaitUpdateForSuccessMap.get(item.txId) !== undefined) {
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
        if (this.state.withdrawWETHWaitUpdateForFailedMap.get(item.txId) !== undefined) {
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
            failedInfo: 'WITHDRAW WETH FAILURE'
          }
        }
        //超时则取消控件限制
        if (this.state.withdrawWETHWaitTimeOutMap.get(item.txId) !== undefined) {
          return {
            ...item,
            timeOutFlag: 1
          }
        }
      }

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

      if (item.icon === 'loading-supply-weth-approve') {
        if (this.state.enableWETHWaitUpdateForSuccessMap.get(item.txId) !== undefined) {
          this.setState({ pendingApproval: false, isApproved: true });
          //imtoken用
          if (window.ethereum.isImToken !== undefined && window.ethereum.isImToken === true) {
            this.setState({ pendingApproval: false, isApproved: true });
          }
          return {
            ...item,
            icon: 'done',
            status: 1
          }
        }
        if (this.state.enableWETHWaitUpdateForFailedMap.get(item.txId) !== undefined) {
          this.setState({ pendingApproval: false, isApproved: true });
          //imtoken用
          if (window.ethereum.isImToken !== undefined && window.ethereum.isImToken === true) {
            this.setState({ pendingApproval: false, isApproved: true });
          }
          return {
            ...item,
            icon: 'failure',
            status: 1,
            failed: true,
            failedInfo: 'ENABLE WETH FAILURE'
          }
        }
        //超时则取消控件限制
        if (this.state.enableWETHWaitTimeOutMap.get(item.txId) !== undefined) {
          return {
            ...item,
            timeOutFlag: 1
          }
        }
      }

      if (item.icon === 'loading-supply-usdx-approve') {
        if (this.state.enableUSDxWaitUpdateForSuccessMap.get(item.txId) !== undefined) {
          this.setState({ pendingApproval: false, isApproved: true });

          //imtoken用
          if (window.ethereum.isImToken !== undefined && window.ethereum.isImToken === true) {
            this.setState({ pendingApproval: false, isApproved: true });
          }
          return {
            ...item,
            icon: 'done',
            status: 1
          }
        }
        if (this.state.enableUSDxWaitUpdateForFailedMap.get(item.txId) !== undefined) {
          this.setState({ pendingApproval: false, isApproved: true });
          //imtoken用
          if (window.ethereum.isImToken !== undefined && window.ethereum.isImToken === true) {
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

  checkTransactionsStatus = () => {
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
        this.getMaxWithdrawAmount();
        this.getAccountBalance();
        this.getMyAddressWETHBalance();
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
      this.wethEventMonitor();
    }
    // Recent Transactions status = 0
    this.checkTransactionsStatusTimer = setInterval(() => {
      this.checkTransactionsStatus();
    }, 1000);
    //check
    this.checkWaitingUpdateTimer = setInterval(() => {
      this.checkWaitingUpdateTransactionRecords();
    }, 1000 * 15);
    // this.mmMonitor();//imtoken测试临时注释
    // this.refreshDataEventMonitor();//imtoken测试临时注释
    //非imtoken用 ，否则用imtoken测试临时注释
    if (window.web3 !== undefined && window.ethereum.isImToken === undefined) {
      this.mmMonitor();
      this.refreshDataEventMonitor()
    }
    // Initial Component Info 
    this.getAllowance();
    this.getAccountETHBalance();
    // this.getCollateralRatio();
    // this.getCurrentSupplyAssetAmount();
    this.getAccountBalance();
    // this.getAssetBalance();
    this.getMyAddressWETHBalance();
    // this.getCalcWETHPrice();
    // this.getWETHAssetPrice();
    this.getMaxWithdrawAmount();

    this.refreshInterval = setInterval(() => {
      // console.log('this.props.father_approve_WETH: ',this.props.father_approve_WETH)
      // this.getCurrentSupplyAssetAmount();
      // this.getAssetBalance();
      this.getMaxWithdrawAmount();
      this.getAccountBalance();
      this.getMyAddressWETHBalance();
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
      enableMessage: `Before supplying ${this.props.balanceType} for the first time, you must enable ${this.props.balanceType}.`,
      isEnable: !this.state.pendingApproval,
      buttonInfo: this.state.isApproved ? this.props.approveButtonInfo : (this.state.buttonText === '' ? this.props.approveButtonInfo : this.state.buttonText),
      handleClick: this.handleApprove,
      page: this.props.page
    };

    const supplyProps = {
      balanceDescription: '',
      balanceAmount: this.state.accountBalance,
      balanceType: this.props.balanceType,
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
      placeholderHint: 'Amount in ' + this.props.balanceType,
      buttonClassName: 'button-wrapper',
      maxClassName: this.state.maxClassName
    };

    const withdrawProps = {
      balanceDescription: '',
      balanceAmount: this.state.maxWithdrawAmount,
      balanceType: this.props.balanceType,
      balanceUnit: 'Available',
      minAmount: 0,
      maxAmount: this.state.maxWithdrawAmount,
      step: 0.01,
      amount: this.state.withdrawAmount,
      isEnable: this.state.isWithdrawEnable,
      inputDisabled: this.state.withdrawInputDisabled,
      buttonInfo: this.state.isWithdrawEnable ? this.props.withdrawButtonInfo : this.state.withdrawButtonText,
      handleChange: this.handleWithdrawChange,
      handleMax: this.handleWithdrawMax,
      handleClick: this.handleWithdrawClick,
      hasBorrowedUSDx: this.props.hasBorrowedUSDx,
      placeholderHint: 'Amount in ' + this.props.balanceType,
      buttonClassName: 'button-wrapper',
      maxClassName: this.state.withdrawMaxClassName
    };

    const wrapProps = {
      balanceDescription: '',
      balanceAmount: this.state.ethAccountBalance,
      balanceType: 'ETH',
      balanceUnit: 'Balance',
      minAmount: 0,
      step: 0.01,
      amount: this.state.wrapAmount,
      isEnable: this.state.isWrapEnable,
      inputDisabled: this.state.wrapInputDisabled,
      buttonInfo: this.props.wrapButtonInfo,
      handleChange: this.handleWrapChange,
      handleClick: this.handleWrapClick,
      placeholderHint: 'Ether to Wrap',
      buttonClassName: 'button-wrapper',
      maxClassName: 'max-amount-button'
    };

    const unwrapProps = {
      balanceDescription: '',
      balanceAmount: this.state.wethAccountBalance,
      balanceType: this.props.balanceType,
      balanceUnit: 'Balance',
      minAmount: 0,
      maxAmount: this.state.maxUnwrapAmount,
      step: 0.01,
      amount: this.state.unwrapAmount,
      isEnable: this.state.isunwrapEnable,
      inputDisabled: this.state.unwrapInputDisabled,
      buttonInfo: this.props.unwrapButtonInfo,
      handleChange: this.handleunwrapChange,
      handleClick: this.handleunwrapClick,
      handleMax: this.handleunwrapMax,
      placeholderHint: 'WETH to Unwrap',
      buttonClassName: 'button-wrapper',
      maxClassName: this.state.unwrapMaxClassName
    };

    return (
      <div className='supply-input'>
        <BalanceInfoWithIcon coin={'WETH'} action={'Supplied'} login={window.web3.eth.accounts[0] ? true : false} />


        <Tabs className='tab-wrapper' animated={true} size='large' onChange={this.changePane}>
          <TabPane tab={this.props.tabLeftName} key="1" className='tab-content'>
            {
              this.props.father_approve_WETH == 1
                ?
                <span>
                  <CoinBalance coin={'eth'} login={this.props.login} />
                  <WrapInputUnit {...wrapProps} />
                  <UnWrapInputUnit {...unwrapProps} />
                  <CoinBalance coin={'weth'} login={this.props.login} father_max_Unwrap_Amount={this.state.maxUnwrapAmount} />
                  <InputUnit {...supplyProps} />
                </span>
                :
                <Approve {...approveProps} />
            }
          </TabPane>

          <TabPane tab={this.props.tabRightName} key="2" className='tab-content'>
            {this.state.isApproved && <CoinAvailable coin={'weth'} action={'withdraw'} login={this.props.login} />}
            {this.state.isApproved ? <InputUnit {...withdrawProps} /> : <Approve {...approveProps} />}
          </TabPane>
        </Tabs>
      </div>
    )
  }
}

export default SupplyInput;