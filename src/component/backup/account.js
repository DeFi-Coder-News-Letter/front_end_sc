import React, { Component } from 'react';
import { Divider } from 'antd';
import DF from './../DF.js';
import Network from './../constant.json';
import USDX from './../USDX.js'
import xETH from './../xETH.js'

import MoneyMarket from './../MoneyMarket.js';

class Account extends Component {
  constructor(props) {
    super(props);
    this.state = {
      supplyType: props.supplyType,
      xETHName: props.xETHName,
      USDxName: props.USDxName,
      networkName: props.networkName,
      web3NoExist: props.web3NoExist,
      supplyAmount: null,
      supplyxETHAmount: null,
      accountBalance: null,
      allowance: props.allowance,
      myAddressUSDxBalance: null,
      myAddressxETHBalance: null,
      currentSupplyAmount: null,
      currentSupplyxETHAmount: null,
      currentSupplyUSDxAmount: null,
      userLiquidity: null,
      ethBalance: null,
      maxWithdrawAmount: null,
      maxWithdrawAmountShow: null,
      maxWithdrawxETHAmount: null,
      maxWithdrawxETHAmountShow: null,
      txhashHref: 'https://kovan.etherscan.io/tx/'
    };
    this.web3 = window.web3;
  }

  getAccountBalance = () => {
    DF().balanceOf(this.web3.eth.accounts[0], (err, res) => {
      this.setState({ accountBalance: this.props.toFormatShowNumber(this.web3.fromWei(res.toNumber(), "ether")) })
    });
  }

  getETHBalance = () => {
    this.web3.eth.getBalance(this.web3.eth.accounts[0], (err, balance) => {
      this.setState({ ethBalance: this.props.toFormatShowNumber(this.web3.fromWei(balance.toNumber(), "ether")) })
    });
  }

  getDFAllowance = () => {
    DF().allowance(
      this.web3.eth.accounts[0],
      Network[this.state.networkName].MoneyMarket,
      (err, res) => {
        let allowanceVal = res.toNumber();
        if (allowanceVal > 0) {
          this.setState({ allowance: allowanceVal });
        }
      });
  }

  getUSDxAllowance = () => {
    USDX().allowance(
      this.web3.eth.accounts[0],
      Network[this.state.networkName].MoneyMarket,
      (err, res) => {
        let allowanceVal = res.toNumber();
        if (allowanceVal > 0) {
          this.setState({ usdxAllowance: allowanceVal });
        }
      });
  }

  getxETHAllowance = () => {
    xETH().allowance(
      this.web3.eth.accounts[0],
      Network[this.state.networkName].MoneyMarket,
      (err, res) => {
        let allowanceVal = res.toNumber();
        if (allowanceVal > 0) {
          this.setState({ xETHAllowance: allowanceVal });
        }
      });
  }

  getAccountLiquidity = () => {
    MoneyMarket().getAccountLiquidity(this.web3.eth.accounts[0],
      (err, res) => {
        this.setState({ userLiquidity: this.props.toFormatShowNumber(this.web3.fromWei(res.toNumber(), "ether")) });
      }
    )
  }
  getMyAddressUSDxBalance = () => {
    USDX().balanceOf(this.web3.eth.accounts[0], (err, res) => {
      this.setState({ myAddressUSDxBalance: this.props.toFormatShowNumber(this.web3.fromWei(res.toNumber(), "ether")) });
    });
  }

  getMyAddressxETHBalance = () => {
    xETH().balanceOf(this.web3.eth.accounts[0], (err, res) => {
      this.setState({ myAddressxETHBalance: this.props.toFormatShowNumber(this.web3.fromWei(res.toNumber(), "ether")) });
    });
  }

  getMaxWithdrawAmount = () => {
    let asset = Network[this.state.networkName][this.state.supplyType];
    MoneyMarket().getMaxWithdrawAmount(
      this.web3.eth.accounts[0],
      asset,
      (err, res) => {
        this.setState({
          maxWithdrawAmountShow: this.props.toFormatShowNumber(this.web3.fromWei(res.toNumber(), "ether"))
        });
        this.setState({
          maxWithdrawAmount: Number(this.web3.fromWei(res.toNumber(), "ether"))
        });
      }
    );
  };

  getMaxWithdrawxETHAmount = () => {
    let asset = Network[this.state.networkName][this.state.xETHName];
    MoneyMarket().getMaxWithdrawAmount(
      this.web3.eth.accounts[0],
      asset,
      (err, res) => {
        this.setState({
          maxWithdrawxETHAmountShow: this.props.toFormatShowNumber(this.web3.fromWei(res.toNumber(), "ether"))
        });
        this.setState({
          maxWithdrawxETHAmount: Number(this.web3.fromWei(res.toNumber(), "ether"))
        });
      }
    );
  };

  getCurrentSupplyAmount = () => {
    let myAddress = this.web3.eth.accounts[0];
    let asset = Network[this.state.networkName][this.state.supplyType];
    MoneyMarket().getSupplyBalance(myAddress,
      asset,
      (err, res) => {
        if (res !== undefined) {
          this.setState({ currentSupplyAmount: this.props.toFormatShowNumber(this.web3.fromWei(res.toNumber(), "ether")) });
        }
      }
    );
  }

  getCurrentSupplyxETHAmount = () => {
    let myAddress = this.web3.eth.accounts[0];
    let asset = Network[this.state.networkName][this.state.xETHName];
    MoneyMarket().getSupplyBalance(myAddress,
      asset,
      (err, res) => {
        if (res !== undefined) {
          this.setState({ currentSupplyxETHAmount: this.props.toFormatShowNumber(this.web3.fromWei(res.toNumber(), "ether")) });
        }
      }
    );
  }

  getCurrentSupplyUSDxAmount = () => {
    let myAddress = this.web3.eth.accounts[0];
    let asset = Network[this.state.networkName][this.state.USDxName];
    MoneyMarket().getSupplyBalance(myAddress,
      asset,
      (err, res) => {
        if (res !== undefined) {
          this.setState({ currentSupplyUSDxAmount: this.props.toFormatShowNumber(this.web3.fromWei(res.toNumber(), "ether")) });
        }
      }
    );
  }


  componentDidMount() {
    this.getAddressIntervalSupply = setInterval(() => {
      if (this.web3.eth.accounts[0] !== undefined) {
        this.getAccountBalance();
        this.getDFAllowance();
        this.getUSDxAllowance();
        this.getxETHAllowance();
        this.getMyAddressUSDxBalance();
        this.getCurrentSupplyUSDxAmount();
        this.getMyAddressxETHBalance();
        this.getCurrentSupplyAmount();
        this.getCurrentSupplyxETHAmount();
        this.getAccountLiquidity();
        this.getETHBalance();
        this.getMaxWithdrawAmount();
        this.getMaxWithdrawxETHAmount();
      }
    }, 3000)
  }

  componentWillUnmount() {
    clearInterval(this.getAddressIntervalSupply);
  }

  render() {

    return (
      <div className="supply-input">
        <Divider orientation="left">Account</Divider>
        <p>Current user address: {this.web3.eth.accounts[0]}</p>
        <p>Current user liquidity: {this.state.userLiquidity}</p>
        <Divider dashed />
        <p>DF Allowance: {this.state.allowance}</p>
        <p>DF Account Balance: {this.state.accountBalance}</p>
        <p>DF Current Supply Amount: {this.state.currentSupplyAmount}</p>
        <p>DF Max Withdraw Amount: {this.state.maxWithdrawAmountShow}</p>
        <Divider dashed />
        <p>ETH Account Balance: {this.state.ethBalance}</p>
        <Divider dashed />
        <p>xETH Allowance: {this.state.xETHAllowance}</p>
        <p>xETH Account Balance: {this.state.myAddressxETHBalance}</p>
        <p>xETH Current Supply Amount: {this.state.currentSupplyxETHAmount}</p>
        <p>xETH Max Withdraw Amount: {this.state.maxWithdrawxETHAmountShow}</p>
        <Divider dashed />
        <p>USDx Allowance: {this.state.usdxAllowance}</p>
        <p>USDx Account Balance: {this.state.myAddressUSDxBalance}</p>
        <p>USDx Current Supply Amount: {this.state.currentSupplyUSDxAmount}</p>
      </div>
    );
  }
}

export default Account;
