import React, { Component } from 'react';
import { Tabs, Input, Button, InputNumber } from 'antd'
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

// add i18n.
import { IntlProvider, FormattedMessage } from 'react-intl';
import en_US from '../../language/en_US.js';
import zh_CN from '../../language/zh_CN';

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

    if (window.web3.currentProvider.isMetaMask) {
      window.ethereum.on('accountsChanged', (accounts) => {
        setTimeout(this.refreshData(), 500);
        this.getAllowance();
        this.get_My_WETH_Supplied_max_Withdraw_WETH_Amount();
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
    }



    // this.componentDidMount_temp();
    window.web3.currentProvider.enable().then(
      res => {
        this.setState({ isLogIn: true }, () => {
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

        });
      }
    )

    if (window.web3.currentProvider.isMetaMask) {
      window.ethereum.on('accountsChanged', () => {
        this.componentDidMount_temp();
      });
    }

  };

  // get_Account_ETH_Balance
  getAccountETHBalance = () => {
    if (typeof web3 !== 'undefined' && this.web3.eth.accounts[0] !== undefined) {
      this.web3.eth.getBalance(this.web3.eth.accounts[0], (err, balance) => {
        if (balance !== undefined && balance !== null) {
          this.setState({ ethAccountBalance: toFormatShowNumber(this.web3.fromWei(balance.toNumber(), "ether")), ethAccountBalance_BN: balance });
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
            maxUnwrapAmount: toFormat10Number(this.web3.fromWei(wethBalanceAmount, "ether")),
            maxUnwrapAmount_BN: res
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
          this.setState({ maxSupplyAmount: balance, maxSupplyAmount_BN: res });
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
    let NetworkName = findNetwork(this.state.NetworkName);
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



  get_My_WETH_Supplied_max_Withdraw_WETH_Amount = () => {
    if (typeof web3 === 'undefined' || this.web3.eth.accounts[0] === undefined || WETH() === undefined || MoneyMarket() === undefined) {
      return;
    }
    let wethAddress = '';
    let mmAddress = '';
    let NetworkName = findNetwork(this.state.NetworkName);
    if (NetworkName === 'Main') {
      wethAddress = Network.Main.WETH;
      mmAddress = Network.Main.MoneyMarket;
    } else if (NetworkName === 'Rinkeby') {
      wethAddress = Network.Rinkeby.WETH;
      mmAddress = Network.Rinkeby.MoneyMarket;
    }
    MoneyMarket().getAccountLiquidity(this.web3.eth.accounts[0], (error, res_Account_Liquidity_BN) => {
      if (res_Account_Liquidity_BN) {
        MoneyMarket().assetPrices(wethAddress, (err, res_usdx_price_BN) => {
          if (res_usdx_price_BN) {
            res_Account_Liquidity_BN = res_Account_Liquidity_BN.mul(this.web3.toBigNumber(10 ** 18)).div(res_usdx_price_BN);
            // console.log(res_Account_Liquidity_BN)
            MoneyMarket().getSupplyBalance(this.web3.eth.accounts[0], wethAddress, (err, res_supplied_BN) => {
              if (res_supplied_BN) {
                WETH().balanceOf(mmAddress, (err, res_cash_BN) => {
                  if (res_cash_BN) {
                    // console.log(res_Account_Liquidity_BN.toLocaleString())
                    // console.log(res_supplied_BN.toLocaleString())
                    // console.log(res_cash_BN.toLocaleString())
                    let moreSmallNum = res_Account_Liquidity_BN.sub(res_supplied_BN).toNumber() < 0 ? res_Account_Liquidity_BN : res_supplied_BN;
                    let mostSmallNum = moreSmallNum.sub(res_cash_BN).toNumber() < 0 ? moreSmallNum : res_cash_BN;
                    // console.log(mostSmallNum.toLocaleString())
                    if (!(mostSmallNum.gt(this.web3.toBigNumber(0)))) {
                      this.setState({ maxWithdrawAmount: 0 });
                      return;
                    }
                    this.setState({
                      maxWithdrawAmount: this.web3.fromWei(mostSmallNum.toNumber(), "ether"),
                      maxWithdrawAmount_BN: mostSmallNum
                    });
                  }
                })

              }
            })
          }
        })
      }
    })
  }





  // approve weth
  handleApprove = () => {
    this.setState({ isApproved: false, buttonText: 'ENABLEING WETH...', pendingApproval: true, i_clicked_approve_btn: 1 });
    let mmAddress = '';
    let NetworkName = findNetwork(this.state.NetworkName);
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
              let txnHashHref = getTxnHashHref(this.state.NetworkName) + res;
              this.setState({ getHash: true, hashNumber: res, i_clicked_approve_btn: 0 });
              if (this.props.wethCoin === true) {
                saveTransaction('loading-supply-weth-approve', this.web3.eth.accounts[0], Asset['Asset'].WETH, this.props.page,
                  this.state.NetworkName, 'Enable', null, 'WETH', txnHashHref, txId, 0, null, false, null);
              } else if (this.props.usdxCoin === true) {
                saveTransaction('loading-supply-usdx-approve', this.web3.eth.accounts[0], Asset['Asset'].USDx, this.props.page,
                  this.state.NetworkName, 'Enable', null, 'USDx', txnHashHref, txId, 0, null, false, null);
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
    let NetworkName = findNetwork(this.state.NetworkName);
    if (NetworkName === 'Main') {
      supplyAddress = Network.Main.WETH;
    } else if (NetworkName === 'Rinkeby') {
      supplyAddress = Network.Rinkeby.WETH;
    }

    let amount_num = this.web3.toBigNumber(this.state.supplyAmount).mul(this.web3.toBigNumber(10 ** 18));
    if (this.state.i_will_supply_max) {
      amount_num = this.state.maxSupplyAmount_BN;
    }

    MoneyMarket().supply.estimateGas(supplyAddress, amount_num, { from: this.web3.eth.accounts[0] }, (err, gasLimit) => {
      this.web3.eth.getGasPrice((err, gasPrice) => {
        MoneyMarket().supply.sendTransaction(
          supplyAddress,
          amount_num,
          {
            from: this.web3.eth.accounts[0],
            gas: gasLimit,
            gasPrice: gasPrice
          },
          (err, res) => {
            if (res !== undefined && res !== null) {
              let txId = res;
              let txnHashHref = getTxnHashHref(this.state.NetworkName) + res;
              let recordSupplyAmount = toDoubleThousands(this.state.supplyAmount);
              if (this.props.wethCoin === true) {
                saveTransaction('loading-supply-weth', this.web3.eth.accounts[0], Asset['Asset'].WETH, this.props.page,
                  this.state.NetworkName, 'Supply', recordSupplyAmount, 'WETH', txnHashHref, txId, 0, this.web3.toWei(this.state.supplyAmount, "ether"), false, null);
              } else if (this.props.usdxCoin === true) {
                saveTransaction('loading-supply-usdx', this.web3.eth.accounts[0], Asset['Asset'].USDx, this.props.page,
                  this.state.NetworkName, 'Supply', recordSupplyAmount, 'USDx', txnHashHref, txId, 0, this.web3.toWei(this.state.supplyAmount, "ether"), false, null);
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
    if (value.length > 18) {
      return;
    }
    this.setState({
      i_will_supply_max: false
    });
    // console.log(value);
    if (value === null || value === '') {
      console.log("value === null || value === ''")
      this.setState({
        isSupplyEnable: true,
        supplyButtonText: this.props.supplyButtonInfo,
        supplyAmount: ''
      });
      return;
    } else if (this.web3.toBigNumber(value).mul(this.web3.toBigNumber(10 ** 18)).sub(this.state.maxSupplyAmount_BN) > 0) {
      let supplyButtonText = 'INSUFFICIENT BALANCE';
      this.setState({
        supplyAmount: value,
        isSupplyEnable: false,
        supplyButtonText: supplyButtonText
      });
      return;
    }

    this.setState({ supplyAmount: value });

    if ((Number(value)) === 0) {
      this.setState({ isSupplyEnable: false, supplyButtonText: this.props.supplyButtonInfo });
    } else {
      this.setState({ isSupplyEnable: true });
    }
  }

  handleSupplyMax = () => {
    console.log(this.state.maxSupplyAmount_BN)
    let withdraw_to_show = this.state.maxSupplyAmount_BN.div(this.web3.toBigNumber(10 ** 18)).toLocaleString().substring(0, 18);
    this.setState({
      supplyAmount: withdraw_to_show,
      i_will_supply_max: true
    }, () => {
      if (Number(this.state.maxSupplyAmount) === 0) {
        this.setState({ isSupplyEnable: false, supplyButtonText: this.props.supplyButtonInfo });
      } else {
        this.setState({ isSupplyEnable: true });
      }
    });
  }

  handleWithdrawChange = (value) => {
    if (value.length > 18) {
      return;
    }
    this.setState({
      withdrawMax: false
    });
    console.log(value)
    if (value === null || value === '') {
      this.setState({
        isWithdrawEnable: true,
        withdrawButtonText: this.state.withdrawButtonInfo,
        withdrawAmount: '',
        withdrawMax: false
      });
      return;
    } else if (this.web3.toBigNumber(value).mul(this.web3.toBigNumber(10 ** 18)).sub(this.state.maxWithdrawAmount_BN) > 0) {
      this.setState({
        withdrawAmount: value,
        isWithdrawEnable: false,
        withdrawButtonText: 'INSUFFICIENT LIQUIDITY'
      });
      return;
    }

    this.setState({ withdrawAmount: value });

    if ((Number(value)) === 0) {
      this.setState({ isWithdrawEnable: false, withdrawButtonText: 'INSUFFICIENT LIQUIDITY' });
    } else {
      this.setState({ isWithdrawEnable: true });
    }
  }

  handleWithdrawMax = () => {
    let withdraw_to_show = this.state.maxWithdrawAmount_BN.div(this.web3.toBigNumber(10 ** 18)).toLocaleString().substring(0, 18);
    this.setState({
      withdrawAmount: withdraw_to_show,
      withdrawMax: true
    });

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
    let amount = this.web3.toBigNumber(this.state.withdrawAmount).mul(this.web3.toBigNumber(10 ** 18));
    if (this.state.withdrawMax) {
      amount = -1;
    }
    this.setState({ isWithdrawEnable: false, withdrawButtonText: 'SUBMITTING…', withdrawInputDisabled: true, withdrawMaxClassName: 'max-amount-button-disable' });
    let withdrawAddress = '';
    let NetworkName = findNetwork(this.state.NetworkName);
    if (NetworkName === 'Main') {
      withdrawAddress = Network.Main.WETH;
    } else if (NetworkName === 'Rinkeby') {
      withdrawAddress = Network.Rinkeby.WETH;
    }
    MoneyMarket().withdraw.estimateGas(withdrawAddress, amount, { from: this.web3.eth.accounts[0] }, (err, gasLimit) => {
      this.web3.eth.getGasPrice((err, gasPrice) => {
        MoneyMarket().withdraw.sendTransaction(
          withdrawAddress,
          amount,
          {
            from: this.web3.eth.accounts[0],
            gas: gasLimit,
            gasPrice: gasPrice
          },
          (err, res) => {
            if (res !== undefined && res !== null) {
              let txId = res;
              let txnHashHref = getTxnHashHref(this.state.NetworkName) + res;
              let recordWithdrawAmount = (amount === -1) ? toDoubleThousands(this.state.maxWithdrawAmount) : toDoubleThousands(this.state.withdrawAmount);
              if (this.props.wethCoin === true) {
                saveTransaction('loading-supply-withdraw-weth', this.web3.eth.accounts[0], Asset['Asset'].WETH,
                  this.props.page, this.state.NetworkName, 'Withdraw', recordWithdrawAmount, 'WETH', txnHashHref, txId, 0, this.state.withdrawMax === true ? -1 : this.web3.toWei(this.state.withdrawAmount, "ether"), false, null);
              } else if (this.props.usdxCoin === true) {
                saveTransaction('loading-supply-withdraw-usdx', this.web3.eth.accounts[0], Asset['Asset'].USDx,
                  this.props.page, this.state.NetworkName, 'Withdraw', recordWithdrawAmount, 'USDx', txnHashHref, txId, 0, this.state.withdrawMax === true ? -1 : this.web3.toWei(this.state.withdrawAmount, "ether"), false, null);
              }
            } else {
              this.setState({ isWithdrawEnable: true, withdrawInputDisabled: false });
            }
          }
        )
      })
    });
  }


  handleWrapChange = (value) => {
    if (value.length > 18) {
      return;
    }
    // console.log(value)
    if (value === null || value === '') {
      this.setState({ wrapAmount: '', isWrapEnable: true });
      return;
    } else if (this.web3.toBigNumber(value).mul(this.web3.toBigNumber(10 ** 18)).sub(this.state.ethAccountBalance_BN) > 0) {
      this.setState({ wrapAmount: value, isWrapEnable: false });
      return;
    }

    this.setState({ wrapAmount: value });

    if ((Number(value)) === 0) {
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
                let txnHashHref = getTxnHashHref(this.state.NetworkName) + res;
                saveTransaction('loading-supply-wrap', this.web3.eth.accounts[0], Asset['Asset'].WETH,
                  this.props.page, this.state.NetworkName, 'Wrap', toDoubleThousands(this.state.wrapAmount), 'ETH', txnHashHref, txId, 0, this.web3.toWei(this.state.wrapAmount, "ether"), false, null);
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
    if (value.length > 18) {
      return;
    }
    this.setState({
      i_will_unwrap_max: false
    });
    console.log(value);
    if (value === null || value === '') {
      this.setState({
        unwrapAmount: '',
        isunwrapEnable: true
      });
      return;
    } else if (this.web3.toBigNumber(value).mul(this.web3.toBigNumber(10 ** 18)).sub(this.state.maxUnwrapAmount_BN) > 0) {
      this.setState({ unwrapAmount: value, isunwrapEnable: false });
      return;
    }

    // if (value.toString().indexOf('.') === value.toString().length - 1) {
    //   value = value + '00'
    // }

    this.setState({ unwrapAmount: value });

    if ((Number(value)) === 0) {
      this.setState({ isunwrapEnable: false });
    } else {
      this.setState({ isunwrapEnable: true });
    }
  }

  // handle_unwrap_Max
  handleunwrapMax = () => {
    let withdraw_to_show = this.state.maxUnwrapAmount_BN.div(this.web3.toBigNumber(10 ** 18)).toLocaleString().substring(0, 18);
    this.setState({
      unwrapAmount: withdraw_to_show,
      i_will_unwrap_max: true
    }, () => {
      if (Number(this.state.maxUnwrapAmount) === 0) {
        this.setState({ isunwrapEnable: false });
      } else {
        this.setState({ isunwrapEnable: true });
      }
    });
  }

  handleunwrapClick = () => {
    if (this.state.unwrapAmount === '' || this.state.unwrapAmount === null || Number(this.state.unwrapAmount) === 0) {
      return;
    }
    this.setState({ isunwrapEnable: false, unwrapInputDisabled: true, unwrapMaxClassName: 'max-amount-button-disable' });

    let num_amount = this.web3.toBigNumber(this.state.unwrapAmount).mul(this.web3.toBigNumber(10 ** 18));
    if (this.state.i_will_unwrap_max) {
      num_amount = this.state.maxUnwrapAmount_BN;
    }

    WETH().withdraw.estimateGas(num_amount, { from: this.web3.eth.accounts[0] }, (err, gasLimit) => {
      this.web3.eth.getGasPrice((err, gasPrice) => {
        WETH().withdraw.sendTransaction(
          num_amount,
          {
            from: this.web3.eth.accounts[0],
            gas: gasLimit,
            gasPrice: gasPrice
          },
          (err, res) => {
            if (res !== undefined && res !== null) {
              let txId = res;
              let txnHashHref = getTxnHashHref(this.state.NetworkName) + res;
              saveTransaction('loading-supply-unwrap', this.web3.eth.accounts[0], Asset['Asset'].WETH, this.props.page,
                this.state.NetworkName, 'Unwrap', toDoubleThousands(this.state.unwrapAmount), 'ETH', txnHashHref, txId, 0, this.web3.toWei(this.state.unwrapAmount, "ether"), false, null);
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
        key = getTransactionHistoryKey(that.props.account, Asset['Asset'].USDx, that.props.page, that.state.NetworkName);
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
        key = getTransactionHistoryKey(that.props.account, Asset['Asset'].WETH, that.props.page, that.state.NetworkName);
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
          let txnHashHref = getTxnHashHref(this.state.NetworkName) + txId;
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
        key = getTransactionHistoryKey(that.props.account, Asset['Asset'].WETH, that.props.page, that.state.NetworkName);
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
        key = getTransactionHistoryKey(that.props.account, Asset['Asset'].WETH, that.props.page, that.state.NetworkName);
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
    // }
  }

  refreshData = () => {
    this.getAccountETHBalance();
    // this.getCurrentSupplyAssetAmount();
    this.getAccountBalance();
    // this.getAssetBalance();
    // this.getCalcWETHPrice();
    // this.getWETHAssetPrice();
    this.get_My_WETH_Supplied_max_Withdraw_WETH_Amount();
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
        key = getTransactionHistoryKey(this.web3.eth.accounts[0], Asset['Asset'].WETH, this.props.page, this.state.NetworkName);
      } else if (this.props.usdxCoin === true) {
        key = getTransactionHistoryKey(this.web3.eth.accounts[0], Asset['Asset'].USDx, this.props.page, this.state.NetworkName);
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
        key = getTransactionHistoryKey(this.web3.eth.accounts[0], Asset['Asset'].WETH, this.props.page, this.state.NetworkName);
      } else if (this.props.usdxCoin === true) {
        key = getTransactionHistoryKey(this.web3.eth.accounts[0], Asset['Asset'].USDx, this.props.page, this.state.NetworkName);
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
          key = getTransactionHistoryKey(that.props.account, Asset['Asset'].WETH, that.props.page, that.state.NetworkName);
        } else if (that.props.usdxCoin === true) {
          key = getTransactionHistoryKey(that.props.account, Asset['Asset'].USDx, that.props.page, that.state.NetworkName);
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
          let txnHashHref = getTxnHashHref(that.state.NetworkName) + txId;
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
          key = getTransactionHistoryKey(that.props.account, Asset['Asset'].WETH, that.props.page, that.state.NetworkName);
        } else if (that.props.usdxCoin === true) {
          key = getTransactionHistoryKey(that.props.account, Asset['Asset'].USDx, that.props.page, that.state.NetworkName);
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
          let txnHashHref = getTxnHashHref(that.state.NetworkName) + txId;
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
          key = getTransactionHistoryKey(that.props.account, Asset['Asset'].WETH, that.props.page, that.state.NetworkName);
        } else if (that.props.usdxCoin === true) {
          key = getTransactionHistoryKey(that.props.account, Asset['Asset'].USDx, that.props.page, that.state.NetworkName);
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
        this.get_My_WETH_Supplied_max_Withdraw_WETH_Amount();
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
    this.get_My_WETH_Supplied_max_Withdraw_WETH_Amount();

    this.get_Supplied_WETH();
    this.get_my_ETH();
    this.get_my_WETH();

    this.refreshInterval = setInterval(() => {
      // console.log('this.props.father_approve_WETH: ',this.props.father_approve_WETH)
      // this.getCurrentSupplyAssetAmount();
      // this.getAssetBalance();
      this.get_My_WETH_Supplied_max_Withdraw_WETH_Amount();
      this.getAccountBalance();
      this.getMyAddressWETHBalance();
      this.get_Supplied_WETH();
      this.get_my_ETH();
      this.get_my_WETH();
    }, 1000 * 15)
  }

  componentWillUnmount() {
    // clearInterval(this.gasPriceInterval);
    clearInterval(this.refreshInterval);
    clearInterval(this.accountInterval);
    clearInterval(this.checkTransactionsStatusTimer);
    clearInterval(this.checkWaitingUpdateTimer);
  }


  // ***** 华丽的分割线 ***** ***** 华丽的分割线 ***** ***** 华丽的分割线 ***** ***** 华丽的分割线 ***** ***** 华丽的分割线 ***** ***** 华丽的分割线 ***** ***** 华丽的分割线 *****


  get_Supplied_WETH = () => {
    if (typeof web3 !== 'undefined' && this.web3.eth.accounts[0] !== undefined && MoneyMarket() !== undefined) {
      let wethAddress = '';
      let NetworkName = findNetwork(this.state.NetworkName);
      if (NetworkName === 'Main') {
        wethAddress = Network.Main.WETH;
      } else if (NetworkName === 'Rinkeby') {
        wethAddress = Network.Rinkeby.WETH;
      }
      MoneyMarket().getSupplyBalance(this.web3.eth.accounts[0], wethAddress, (err, res_supplied_WETH_BN) => {
        if (res_supplied_WETH_BN) {
          this.setState({ supplied_weth_Balance: this.web3.fromWei(res_supplied_WETH_BN.toNumber(), "ether") });
        }
      });
    }
  }


  get_my_ETH = () => {
    if (typeof web3 !== 'undefined' && this.web3.eth.accounts[0] !== undefined) {
      this.web3.eth.getBalance(this.web3.eth.accounts[0], (err, ETH_balance_BN) => {
        if (ETH_balance_BN) {
          this.setState({ my_eth_Balance: toFormatShowNumber(this.web3.fromWei(ETH_balance_BN.toNumber(), "ether")) });
        }
      });
    }
  }


  get_my_WETH = () => {
    if (typeof web3 !== 'undefined' && this.web3.eth.accounts[0] !== undefined) {
      WETH().balanceOf(this.web3.eth.accounts[0], (err, WETH_balance_BN) => {
        if (WETH_balance_BN) {
          this.setState({ my_weth_Balance: toFormatShowNumber(this.web3.fromWei(WETH_balance_BN.toNumber(), "ether")) });
        }
      });
    }
  }


  render() {
    const approveProps = {
      enableMessage: `Before supplying ${this.props.balanceType} for the first time, you must enable ${this.props.balanceType}.`,
      isEnable: !this.state.pendingApproval,
      buttonInfo: this.state.isApproved ? this.props.approveButtonInfo : (this.state.buttonText === '' ? this.props.approveButtonInfo : this.state.buttonText),
      handleClick: this.handleApprove,
      page: this.props.page
    };

    // const supplyProps = {
    //   balanceDescription: '',
    //   balanceAmount: this.state.accountBalance,
    //   balanceType: this.props.balanceType,
    //   balanceUnit: 'Balance',
    //   minAmount: 0,
    //   maxAmount: this.state.maxSupplyAmount,
    //   step: 0.01,
    //   amount: this.state.supplyAmount,
    //   isEnable: this.state.isSupplyEnable,
    //   inputDisabled: this.state.supplyInputDisabled,
    //   buttonInfo: this.state.isSupplyEnable ? this.props.supplyButtonInfo : this.state.supplyButtonText,
    //   handleChange: this.handleSupplyChange,
    //   handleClick: this.handleSupplyClick,
    //   handleMax: this.handleSupplyMax,
    //   hasBorrowedUSDx: this.props.hasBorrowedUSDx,
    //   placeholderHint: 'Amount in ' + this.props.balanceType,
    //   buttonClassName: 'button-wrapper',
    //   maxClassName: this.state.maxClassName
    // };

    // const withdrawProps = {
    //   balanceDescription: '',
    //   balanceAmount: this.state.maxWithdrawAmount,
    //   balanceType: this.props.balanceType,
    //   balanceUnit: 'Available',
    //   minAmount: 0,
    //   maxAmount: this.state.maxWithdrawAmount,
    //   step: 0.01,
    //   amount: this.state.withdrawAmount,
    //   isEnable: this.state.isWithdrawEnable,
    //   inputDisabled: this.state.withdrawInputDisabled,
    //   buttonInfo: this.state.isWithdrawEnable ? this.props.withdrawButtonInfo : this.state.withdrawButtonText,
    //   handleChange: this.handleWithdrawChange,
    //   handleMax: this.handleWithdrawMax,
    //   handleClick: this.handleWithdrawClick,
    //   hasBorrowedUSDx: this.props.hasBorrowedUSDx,
    //   placeholderHint: 'Amount in ' + this.props.balanceType,
    //   buttonClassName: 'button-wrapper',
    //   maxClassName: this.state.withdrawMaxClassName
    // };

    // const wrapProps = {
    //   balanceDescription: '',
    //   balanceAmount: this.state.ethAccountBalance,
    //   balanceType: 'ETH',
    //   balanceUnit: 'Balance',
    //   minAmount: 0,
    //   step: 0.01,
    //   amount: this.state.wrapAmount,
    //   isEnable: this.state.isWrapEnable,
    //   inputDisabled: this.state.wrapInputDisabled,
    //   buttonInfo: this.props.wrapButtonInfo,
    //   handleChange: this.handleWrapChange,
    //   handleClick: this.handleWrapClick,
    //   placeholderHint: 'Ether to Wrap',
    //   buttonClassName: 'button-wrapper',
    //   maxClassName: 'max-amount-button'
    // };

    // const unwrapProps = {
    //   balanceDescription: '',
    //   balanceAmount: this.state.wethAccountBalance,
    //   balanceType: this.props.balanceType,
    //   balanceUnit: 'Balance',
    //   minAmount: 0,
    //   maxAmount: this.state.maxUnwrapAmount,
    //   step: 0.01,
    //   amount: this.state.unwrapAmount,
    //   isEnable: this.state.isunwrapEnable,
    //   inputDisabled: this.state.unwrapInputDisabled,
    //   buttonInfo: this.props.unwrapButtonInfo,
    //   handleChange: this.handleunwrapChange,
    //   handleClick: this.handleunwrapClick,
    //   handleMax: this.handleunwrapMax,
    //   placeholderHint: 'WETH to Unwrap',
    //   buttonClassName: 'button-wrapper',
    //   maxClassName: this.state.unwrapMaxClassName
    // };

    return (
      <IntlProvider locale={'en'} messages={navigator.language === 'zh-CN' ? zh_CN : en_US} >
        <div className='supply-input'>
          {/* <BalanceInfoWithIcon coin={'WETH'} action={'Supplied'} login={window.web3.eth.accounts[0] ? true : false} /> */}
          <div className='info-wrapper'>
            <span className='balance-type'>
              <img style={{ width: '16px', height: '16px', margin: 'auto', marginTop: '-4px' }} src={`images/WETH@2x.png`} alt="" />&nbsp;
            <FormattedMessage id='WETH_Supplied' />
            </span>
            <span className='balance-amount'>
              {this.state.supplied_weth_Balance ? toDoubleThousands(this.state.supplied_weth_Balance) : '-'}
            </span>
          </div>


          <Tabs className='tab-wrapper' animated={true} size='large' onChange={this.changePane}>
            <TabPane tab={this.props.tabLeftName === 'SUPPLY' ? navigator.language === 'zh-CN' ? '存款' : 'SUPPLY' : this.props.tabLeftName} key="1" className='tab-content'>
              {
                this.props.father_approve_WETH == 1
                  ?
                  <span>
                    {/* <CoinBalance coin={'eth'} login={this.props.login} /> */}
                    <div className='balance-info'>
                      <span className='balance-desc'>
                        <FormattedMessage id='ETH_Balance' />
                      </span>
                      <span className='balance-amount'>
                        {this.state.my_eth_Balance ? toDoubleThousands(this.state.my_eth_Balance) : '-'}&nbsp;ETH
                        </span>
                    </div>

                    {/* <WrapInputUnit {...wrapProps} /> */}
                    <div className='input-wrap-unit-wrapper'>
                      <div className='wrap-input-wrapper'>
                        <div className='input-wrapper'>
                          <Input
                            type='number'
                            placeholder={'Ether to Wrap'}
                            min={0}
                            value={this.state.wrapAmount}
                            onChange={(e) => this.handleWrapChange(e.target.value)}
                            className='input-number'
                            disabled={this.state.wrapInputDisabled}
                          />
                        </div>
                        <div className='button-wrapper'>
                          <Button
                            size='large'
                            className={!this.state.isWrapEnable ? 'disable-button' : ''}
                            onClick={this.handleWrapClick}
                            disabled={!this.state.isWrapEnable}>
                            {this.props.wrapButtonInfo}
                          </Button>
                        </div>
                      </div>
                    </div>
                    {/* <UnWrapInputUnit {...unwrapProps} /> */}
                    <div className='input-unwrap-unit-wrapper'>
                      <div className='input-wrapper'>
                        <Input
                          type='number'
                          placeholder={'WETH to Unwrap'}
                          min={0}
                          value={this.state.unwrapAmount}
                          onChange={(e) => this.handleunwrapChange(e.target.value)}
                          className='input-number'
                          disabled={this.state.unwrapInputDisabled} />
                        <span className={this.state.unwrapMaxClassName} onClick={this.state.unwrapInputDisabled ? '' : this.handleunwrapMax}>MAX</span>
                      </div>
                      <div className='button-wrapper'>
                        <Button
                          size='large'
                          className={!this.state.isunwrapEnable ? 'disable-button' : ''}
                          onClick={this.handleunwrapClick}
                          disabled={!this.state.isunwrapEnable}>
                          {this.props.unwrapButtonInfo}
                        </Button>
                      </div>
                    </div>
                    {/* <CoinBalance coin={'weth'} login={this.props.login} father_max_Unwrap_Amount={this.state.maxUnwrapAmount} /> */}
                    <div className='balance-info'>
                      <span className='balance-desc'>
                        <FormattedMessage id='WETH_Balance' />
                      </span>
                      <span className='balance-amount'>{this.state.my_weth_Balance ? toDoubleThousands(this.state.my_weth_Balance) : '-'}&nbsp;WETH</span>
                    </div>
                    {/* <InputUnit {...supplyProps} /> */}
                    <div className='input-unit-wrapper'>
                      {!(false || this.props.hasBorrowedUSDx)
                        ?
                        <div className='input-wrapper'>
                          <Input
                            type='number'
                            placeholder={'Amount in ' + this.props.balanceType}
                            min={0}
                            value={this.state.supplyAmount}
                            onChange={(e) => this.handleSupplyChange(e.target.value)}
                            className='input-number'
                            disabled={this.state.supplyInputDisabled}
                          />
                          <span className={this.state.maxClassName} onClick={this.state.supplyInputDisabled ? '' : this.handleSupplyMax}>MAX</span>
                        </div>
                        :
                        <div className='alert-message'>
                          <FormattedMessage id='Already_borrowed' />
                        </div>
                      }
                      <div className={'button-wrapper'}>
                        <Button
                          size='large'
                          className={!!(this.props.hasBorrowedUSDx || false || !this.state.isSupplyEnable) ? 'disable-button' : ''}
                          onClick={this.handleSupplyClick}
                          disabled={!this.state.isSupplyEnable || !!(this.props.hasBorrowedUSDx || false)}
                        >
                          {this.state.isSupplyEnable ? this.props.supplyButtonInfo : this.state.supplyButtonText}
                        </Button>
                      </div>
                    </div>
                  </span>
                  :
                  <Approve {...approveProps} />
              }
            </TabPane>

            <TabPane tab={this.props.tabRightName === 'WITHDRAW' ? navigator.language === 'zh-CN' ? '取出' : 'WITHDRAW' : this.props.tabRightName} key="2" className='tab-content'>
              {
                this.props.father_approve_WETH == 1
                  ?
                  <CoinAvailable coin={'weth'} action={'withdraw'} login={this.props.login} fa_maxWithdrawAmount={this.state.maxWithdrawAmount} />
                  :
                  null
              }
              {
                this.props.father_approve_WETH == 1
                  ?
                  // <InputUnit {...withdrawProps} />
                  <div className='input-unit-wrapper'>
                    {!(false || this.props.hasBorrowedUSDx)
                      ?
                      <div className='input-wrapper'>
                        <Input
                          type='number'
                          placeholder={'Amount in ' + this.props.balanceType}
                          min={0}
                          value={this.state.withdrawAmount}
                          onChange={(e) => { this.handleWithdrawChange(e.target.value) }}
                          className='input-number'
                          disabled={this.state.withdrawInputDisabled}
                        />
                        <span className={this.state.withdrawMaxClassName} onClick={this.state.withdrawInputDisabled ? '' : this.handleWithdrawMax}>MAX</span>
                      </div>
                      :
                      <div className='alert-message'>
                        <FormattedMessage id='Already_borrowed' />
                      </div>
                    }

                    <div className={'button-wrapper'}>
                      <Button
                        size='large'
                        className={!!(this.props.hasBorrowedUSDx || false || !this.state.isWithdrawEnable) ? 'disable-button' : ''}
                        onClick={this.handleWithdrawClick}
                        disabled={!this.state.isWithdrawEnable || !!(this.props.hasBorrowedUSDx || false)}>
                        {this.state.isWithdrawEnable ? this.props.withdrawButtonInfo : this.state.withdrawButtonText}
                      </Button>
                    </div>
                  </div>
                  :
                  <Approve {...approveProps} />
              }
            </TabPane>
          </Tabs>
        </div>
      </IntlProvider>
    )
  }
}

export default SupplyInput;