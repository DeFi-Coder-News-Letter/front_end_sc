import React, { Component } from 'react';
import { Tabs, Button, InputNumber, Input } from 'antd';
import Approve from '../../component/approve/approve';
// import InputUnit from '../../component/inputUnit/inputUnit';
// import WETH from '../../ABIs/WETH';
import USDX from "../../ABIs/USDX.js";
import MoneyMarket from './../../ABIs/MoneyMarket.js';
import { saveTransaction, getTxnHashHref, toDoubleThousands, validNumber, toFormatShowNumber, getTransactionHistoryKey, findNetwork, diffMin, formatBigNumber, toNonExponential } from '../../util.js';
import Asset from '../../constant.json';
import Network from '../../constant.json';
import './supplyInput.scss';
// import CoinAvailable from './../coinAvailable/coinAvailable_supply';
// import CoinBalance from './../coinBalance/coinBalance_supply';
import ErrorCode from '../../error_code.json';


// add i18n.
import { IntlProvider, FormattedMessage } from 'react-intl';
import en_US from '../../language/en_US.js';
import zh_CN from '../../language/zh_CN';

const { TabPane } = Tabs;

class SupplyContent extends Component {
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

    // if (window.ethereum !== undefined) {
    if (window.web3.currentProvider.isMetaMask) {
      window.ethereum.on('accountsChanged', (accounts) => {
        setTimeout(this.refreshData(), 500);
        this.getAllowance();
        // this.getMaxWithdrawAmount();
        // this.getAccountBalance();
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
  // getAccountBalance = () => {
  //   if (window.web3 !== undefined && this.web3.eth.accounts[0] !== undefined && this.props.coin !== undefined) {
  //     this.props.coin.balanceOf(this.web3.eth.accounts[0], (err, res) => {
  //       console.log(res)
  //       let balance = 0;
  //       if (res !== undefined && res !== null) {
  //         balance = formatBigNumber(res);
  //       }

  //       let AccountBalance = toFormatShowNumber(balance)
  //       let MaxSupplyAmount = balance;

  //       if (this.state.accountBalance !== AccountBalance) {
  //         this.setState({ accountBalance: AccountBalance, isSupplyEnable: true, supplyAmount: '' });
  //       }
  //         this.setState({ maxSupplyAmount: balance }, ()=>{     });

  //     });
  //   }
  // }

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


  refreshData = () => {
    // this.getAccountETHBalance();
    this.getCurrentSupplyAssetAmount();
    // this.getAccountBalance();
    this.getAssetBalance();
    this.getUSDxAssetPrice();
    // this.getMaxWithdrawAmount();
    // this.getmaxWithdrawUSDXAmount();
    this.get_My_USDx_Supplied_max_Withdraw_USDx_Amount();
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
    MoneyMarket().SupplyReceived().watch((error, result) => {
      console.log('supply_USDx_Received_Event: ' + JSON.stringify(result));
      if (error) {
        console.log('supply_USDx_Received_Event eeeeeeeeeeerror --> ' + JSON.stringify(error));
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
        // this.getmaxWithdrawUSDXAmount();
        this.get_My_USDx_Supplied_max_Withdraw_USDx_Amount();
        // this.getAccountBalance();
        // this.getMyAddressWETHBalance();
      }
    });
  }




  // ***** 华丽的分割线 ***** ***** 华丽的分割线 ***** ***** 华丽的分割线 ***** ***** 华丽的分割线 ***** ***** 华丽的分割线 ***** ***** 华丽的分割线 ***** ***** 华丽的分割线 *****



  Get_My_USDx_Balance = () => {
    if (typeof web3 === 'undefined' || this.web3.eth.accounts[0] === undefined || USDX() === undefined) {
      return;
    }
    USDX().balanceOf(this.web3.eth.accounts[0], (err, res) => {
      if (res) {
        this.setState({
          My_USDx_Balance: this.web3.fromWei(res.toNumber(), "ether"),
          My_USDx_Balance_BN: res
        }, () => {
          // console.log(this.state.My_USDx_Balance_BN)//this.state.My_USDx_Balance_BN.toLocaleString().replace(/,/g, '')
          // console.log(this.state.My_USDx_Balance_BN.toLocaleString().replace(/,/g, ''))
          // console.log(this.state.My_USDx_Balance_BN.div(this.web3.toBigNumber(10 ** 18))) // BN
          // console.log(this.state.My_USDx_Balance_BN.div(this.web3.toBigNumber(10 ** 18)).toLocaleString())
        })
      }
    });
  }



  get_My_USDx_Supplied_max_Withdraw_USDx_Amount = () => {
    if (typeof web3 === 'undefined' || this.web3.eth.accounts[0] === undefined || USDX() === undefined || MoneyMarket() === undefined) {
      return;
    }
    let usdxAddress = '';
    let mmAddress = '';
    let NetworkName = findNetwork(window.web3.version.network);
    if (NetworkName === 'Main') {
      usdxAddress = Network.Main.USDx;
      mmAddress = Network.Main.MoneyMarket;
    } else if (NetworkName === 'Rinkeby') {
      usdxAddress = Network.Rinkeby.USDx;
      mmAddress = Network.Rinkeby.MoneyMarket;
    }
    MoneyMarket().getAccountLiquidity(this.web3.eth.accounts[0], (error, res_Account_Liquidity_BN) => {
      if (res_Account_Liquidity_BN) {


        MoneyMarket().assetPrices(usdxAddress, (err, res_usdx_price_BN) => {
          if (res_usdx_price_BN) {
            // console.log(res_Account_Liquidity_BN)
            res_Account_Liquidity_BN = res_Account_Liquidity_BN.mul(this.web3.toBigNumber(10 ** 18)).div(res_usdx_price_BN);
            // console.log(res_Account_Liquidity_BN)
            MoneyMarket().getSupplyBalance(this.web3.eth.accounts[0], usdxAddress, (err, res_supplied_BN) => {
              if (res_supplied_BN) {
                this.setState({
                  My_USDx_Supplied: this.web3.fromWei(res_supplied_BN.toNumber(), "ether"),
                }, () => {
                  USDX().balanceOf(mmAddress, (err, res_cash_BN) => {
                    if (res_cash_BN) {
                      // console.log(res_Account_Liquidity_BN.toLocaleString())
                      // console.log(res_supplied_BN.toLocaleString())
                      // console.log(res_cash_BN.toLocaleString())
                      let moreSmallNum = res_Account_Liquidity_BN.sub(res_supplied_BN).toNumber() < 0 ? res_Account_Liquidity_BN : res_supplied_BN;
                      let mostSmallNum = moreSmallNum.sub(res_cash_BN).toNumber() < 0 ? moreSmallNum : res_cash_BN;
                      // console.log(mostSmallNum.toLocaleString())
                      if (!(mostSmallNum.gt(this.web3.toBigNumber(0)))) {
                        this.setState({ maxWithdrawUSDXAmount: 0 });
                        return;
                      }
                      this.setState({
                        maxWithdrawUSDXAmount: this.web3.fromWei(mostSmallNum.toNumber(), "ether"),
                        maxWithdrawUSDXAmount_BN: mostSmallNum
                      });
                    }
                  })
                })
              }
            })
          }
        })
      }
    })
  }



  handle_Supply_Max = () => {
    let supply_to_show = this.state.My_USDx_Balance_BN.div(this.web3.toBigNumber(10 ** 18)).toLocaleString().substring(0, 18);
    this.setState({
      i_will_supply_max: true,
      supplyAmount: supply_to_show
    });
    if (Number(this.state.My_USDx_Balance_BN) === 0) {
      this.setState({ isSupplyEnable: false, supplyButtonText: this.props.supplyButtonInfo });
    } else {
      this.setState({ isSupplyEnable: true });
    }
  }



  handle_Supply_Change = (value) => {
    if (value.length > 18) {
      return;
    }
    this.setState({
      i_will_supply_max: false
    });
    console.log(value)
    if (value === null || value === '') {

      console.log("value === null || value === ''")
      this.setState({
        isSupplyEnable: true,
        supplyButtonText: this.props.supplyButtonInfo,
        supplyAmount: ''
      });
      return;
    } else if (value.length > 18 || this.web3.toBigNumber(value).mul(this.web3.toBigNumber(10 ** 18)).sub(this.state.My_USDx_Balance_BN) > 0) {
      let supplyButtonText = 'INSUFFICIENT BALANCE';
      console.log(this.web3.toBigNumber(value).mul(this.web3.toBigNumber(10 ** 18)).sub(this.state.My_USDx_Balance_BN) > 0)
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
      return;
    } else {
      this.setState({ isSupplyEnable: true });
    }
  }



  handle_Supply_Click = () => {
    if (this.state.supplyAmount === '' || this.state.supplyAmount === 0 || this.state.supplyAmount === null) {
      return;
    }
    this.setState({
      isSupplyEnable: false,
      supplyButtonText: 'SUBMITTING…',
      supplyInputDisabled: true,
      maxClassName: 'max-amount-button-disable'
    });

    let supplyAddress = '';
    let NetworkName = findNetwork(window.web3.version.network);
    if (NetworkName === 'Main') {
      supplyAddress = Network.Main.USDx;
    } else if (NetworkName === 'Rinkeby') {
      supplyAddress = Network.Rinkeby.USDx;
    }

    let to_supply_amount_BN = this.web3.toBigNumber(0);
    if (this.state.i_will_supply_max) {
      to_supply_amount_BN = this.state.My_USDx_Balance_BN;
    } else {
      to_supply_amount_BN = this.web3.toBigNumber(this.state.supplyAmount).mul(this.web3.toBigNumber(10 ** 18));
    }

    MoneyMarket().supply.estimateGas(supplyAddress, to_supply_amount_BN, { from: this.web3.eth.accounts[0] }, (err, gasLimit) => {
      this.web3.eth.getGasPrice((err, gasPrice) => {
        MoneyMarket().supply.sendTransaction(
          supplyAddress,
          to_supply_amount_BN,
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

              saveTransaction(
                'loading-supply-usdx',
                this.web3.eth.accounts[0],
                Asset['Asset'].USDx,
                this.props.page,
                this.web3.version.network,
                'Supply',
                recordSupplyAmount,
                'USDx',
                txnHashHref,
                txId,
                0,
                this.web3.toWei(this.state.supplyAmount, "ether"),
                false,
                null
              );
            } else {
              this.setState({ isSupplyEnable: true, supplyInputDisabled: false });
            }
          }
        )
      })
    });
  }



  handle_Withdraw_Max = () => {
    let withdraw_to_show = this.state.maxWithdrawUSDXAmount_BN.div(this.web3.toBigNumber(10 ** 18)).toLocaleString().substring(0, 18);
    this.setState({
      withdrawAmount: withdraw_to_show,
      withdrawMax: true
    }, () => {
      if (Number(this.state.maxWithdrawUSDXAmount) === 0) {
        this.setState({ isWithdrawEnable: false, withdrawButtonText: 'INSUFFICIENT LIQUIDITY' });
      } else {
        this.setState({ isWithdrawEnable: true });
      }
    });
  }



  handle_Withdraw_Change = (value) => {
    if (value.length > 18) {
      return;
    }
    this.setState({
      withdrawMax: false
    });
    if (value === null || value === '') {
      this.setState({
        isWithdrawEnable: true,
        withdrawButtonText: this.state.withdrawButtonInfo,
        withdrawAmount: '',
        withdrawMax: false
      });
      return;
    } else if (this.web3.toBigNumber(value).mul(this.web3.toBigNumber(10 ** 18)).sub(this.state.maxWithdrawUSDXAmount_BN) > 0) {
      this.setState({
        withdrawAmount: value,
        isWithdrawEnable: false,
        withdrawButtonText: 'INSUFFICIENT LIQUIDITY'
      });
      return;
    }
    this.setState({ withdrawAmount: value });
    if (Number(value) === 0) {
      this.setState({ isWithdrawEnable: false, withdrawButtonText: 'INSUFFICIENT LIQUIDITY' });
    } else {
      this.setState({ isWithdrawEnable: true });
    }
  }




  handle_Withdraw_Click = () => {
    if (this.state.withdrawAmount === '' || Number(this.state.withdrawAmount) === 0 || this.state.withdrawAmount === null) {
      return;
    }
    // if (this.state.withdrawAmount > this.state.maxWithdrawUSDXAmount) {
    //   this.setState({ withdrawAmount: this.state.maxWithdrawUSDXAmount })
    // }
    // let amount = this.web3.toWei(this.state.withdrawAmount, "ether");
    let amount = this.web3.toBigNumber(this.state.withdrawAmount).mul(this.web3.toBigNumber(10 ** 18));
    if (this.state.withdrawMax) {
      amount = -1;
    }

    this.setState({
      isWithdrawEnable: false,
      withdrawButtonText: 'SUBMITTING…',
      withdrawInputDisabled: true,
      withdrawMaxClassName: 'max-amount-button-disable'
    });
    let withdrawAddress = '';
    let NetworkName = findNetwork(window.web3.version.network);
    if (NetworkName === 'Main') {
      withdrawAddress = Network.Main.USDx;
    } else if (NetworkName === 'Rinkeby') {
      withdrawAddress = Network.Rinkeby.USDx;
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
              let txnHashHref = getTxnHashHref(this.web3.version.network) + res;
              let recordWithdrawAmount = (amount === -1) ? toDoubleThousands(this.state.maxWithdrawUSDXAmount) : toDoubleThousands(this.state.withdrawAmount);
              saveTransaction(
                'loading-supply-withdraw-usdx',
                this.web3.eth.accounts[0],
                Asset['Asset'].USDx,
                this.props.page,
                this.web3.version.network,
                'Withdraw',
                recordWithdrawAmount,
                'USDx',
                txnHashHref,
                txId,
                0,
                this.state.withdrawMax === true ? -1 : this.web3.toWei(this.state.withdrawAmount, "ether"),
                false,
                null
              );
            } else {
              this.setState({ isWithdrawEnable: true, withdrawInputDisabled: false });
            }
          }
        )
      })
    });
  }



  refresh_status = () => {
    this.Get_My_USDx_Balance();
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
    // this.getAccountBalance();
    this.getAssetBalance();
    this.getUSDxAssetPrice();
    // this.getMaxWithdrawAmount();
    // this.getmaxWithdrawUSDXAmount();
    this.get_My_USDx_Supplied_max_Withdraw_USDx_Amount();
    this.Get_My_USDx_Balance();


    this.refreshInterval = setInterval(() => {
      this.getCurrentSupplyAssetAmount();
      this.getAssetBalance();
      // this.getMaxWithdrawAmount();
      // this.getmaxWithdrawUSDXAmount();
      this.get_My_USDx_Supplied_max_Withdraw_USDx_Amount();
      // this.getAccountBalance();
      this.Get_My_USDx_Balance();
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


    return (
      <IntlProvider locale={'en'} messages={navigator.language === 'zh-CN' ? zh_CN : en_US} >
        <div className='supply-input'>
          <div className='info-wrapper'>
            <span className='balance-type'>
              <img style={{ width: '16px', height: '16px', margin: 'auto', marginTop: '-4px' }} src={`images/USDx@2x.png`} alt="" />&nbsp;<FormattedMessage id='USDx_Supplied' />
            </span>
            <span className='balance-amount'>
              {this.state.My_USDx_Supplied ? toDoubleThousands(this.state.My_USDx_Supplied) : '-'}
            </span>
          </div>

          <Tabs className='tab-wrapper' animated={true} size='large' onChange={this.changePane}>
            <TabPane tab={this.props.tabLeftName === 'SUPPLY' ? navigator.language === 'zh-CN' ? '存款' : 'SUPPLY' : this.props.tabLeftName} key="1" className='tab-content'>
              {
                this.props.isApproved_USDx == 1
                  ?
                  <span>
                    <div className='balance-info'>
                      <span className='balance-desc'>
                        <FormattedMessage id='USDx_Balance' />
                      </span>
                      <span className='balance-amount'>{this.state.My_USDx_Balance ? toDoubleThousands(this.state.My_USDx_Balance) : '-'}&nbsp;USDx</span>
                    </div>
                    <div className='input-unit-wrapper'>
                      {
                        !(this.props.hasBorrowedUSDx || false)
                          ?
                          <div className='input-wrapper'>
                            <Input
                              type='number'
                              placeholder={'Amount in USDx'}
                              min={0}
                              value={this.state.supplyAmount}
                              onChange={(e) => this.handle_Supply_Change(e.target.value)}
                              className='input-number'
                              disabled={this.state.supplyInputDisabled}
                            />
                            <span className={this.state.maxClassName} onClick={this.state.supplyInputDisabled ? '' : this.handle_Supply_Max}>MAX</span>
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
                          onClick={() => { this.handle_Supply_Click() }}
                          disabled={!this.state.isSupplyEnable || !!(this.props.hasBorrowedUSDx || false)}
                        >
                          {this.state.isSupplyEnable ? this.props.supplyButtonInfo : this.state.supplyButtonText}
                        </Button>
                      </div>
                    </div>
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

            <TabPane tab={this.props.tabRightName === 'WITHDRAW' ? navigator.language === 'zh-CN' ? '取出' : 'WITHDRAW' : this.props.tabRightName} key="2" className='tab-content'>
              {
                this.props.isApproved_USDx == 1
                  ?
                  <div className='balance-info'>
                    <span className='balance-desc'>
                      <FormattedMessage id='USDx_Available_supply' />
                    </span>
                    <span className='balance-amount'>{this.state.maxWithdrawUSDXAmount ? toDoubleThousands(this.state.maxWithdrawUSDXAmount) : '-'}&nbsp;</span>
                  </div>
                  :
                  null
              }
              {
                this.props.isApproved_USDx == 1
                  ?
                  <div className='input-unit-wrapper'>
                    {!(false || this.props.hasBorrowedUSDx)
                      ?
                      <div className='input-wrapper'>
                        <Input
                          type='number'
                          placeholder={'Amount in USDx'}
                          min={0}
                          value={this.state.withdrawAmount}
                          onChange={(e) => { this.handle_Withdraw_Change(e.target.value) }}
                          className='input-number'
                          disabled={this.state.withdrawInputDisabled}
                        />
                        <span className={this.state.withdrawMaxClassName} onClick={this.state.withdrawInputDisabled ? '' : this.handle_Withdraw_Max}>MAX</span>
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
                        onClick={this.handle_Withdraw_Click}
                        disabled={!this.state.isWithdrawEnable || !!(this.props.hasBorrowedUSDx || false)}
                      >
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

export default SupplyContent;