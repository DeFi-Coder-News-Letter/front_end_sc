import React, { Component } from "react";
import { Button, InputNumber, Input } from "antd";
import Network from "./../constant.json";
import MoneyMarket from "./../MoneyMarket.js";

const InputGroup = Input.Group;

class WithdrawxETH extends Component {
  constructor(props) {
    super(props);
    this.state = {
      xETHName: props.xETHName,
      networkName: props.networkName,
      myAddress: props.myAddress,
      maxWithdrawxETHAmount: null,
      maxWithdrawxETHAmountShow: null,
      withdrawxETHAmount: null,
      withdrawxETHtxhash: "",
      withdrawxETHMax: false,
      txhashHref: 'https://kovan.etherscan.io/tx/'
    };
    this.web3 = window.web3;
  }

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

  withdrawxETH = withdrawxETHAmount => {
    if (withdrawxETHAmount > this.state.maxWithdrawxETHAmount) {
      this.props.greaterThanMaxWithdrawxETH(true);
      return;
    }
    if (this.state.withdrawxETHMax) {
      withdrawxETHAmount = -1;
    }
    let asset = Network[this.state.networkName][this.state.xETHName];
    MoneyMarket().withdraw(
      asset,
      withdrawxETHAmount === -1 ? -1 : this.web3.toWei(withdrawxETHAmount, "ether"),
      (err, res) => {
        if (res !== undefined) {
          this.setState({ withdrawxETHtxhash: res });
        }
      }
    );
  };

  handleWithdrawxETHAmount = value => {
    this.setState({ withdrawxETHAmount: value });
    this.setState({ withdrawxETHMax: false});
  };

  handleWithdrawxETHMax = () => {
    this.setState({ withdrawxETHAmount: -1 });
    this.setState({ withdrawxETHMax: true});
  }

  componentDidMount() {
    this.getAddressIntervalWithdrawxETH = setInterval(() => {
      if(this.web3.eth.accounts[0] !== undefined) {
        this.getMaxWithdrawxETHAmount();
      }
    }, 3000)
  }

  componentWillUnmount() {
    clearInterval(this.getAddressIntervalWithdrawxETH);
  }

  render() {
    const withdrawxETHButton = (
      <Button onClick={() => this.withdrawxETH(this.state.withdrawxETHAmount)}>
        Withdraw
      </Button>
    );
    const withdrawxETHGroup = (
      <InputGroup compact style={{ width: "360px" }}>
        <label>withdraw({this.state.xETHName})</label>
        <InputNumber
          min={0}
          max={this.state.maxWithdrawxETHAmount}
          step={0.1}
          value={this.state.withdrawxETHAmount === -1 ? this.state.maxWithdrawxETHAmount : this.state.withdrawxETHAmount}
          style={{ width: "62%" }}
          onChange={this.handleWithdrawxETHAmount}
        />
        <span className="maxWithdrawxETHAmountButton" onClick={this.handleWithdrawxETHMax}>MAX</span>
      </InputGroup>
    );

    return (
      <div className="withdraw-input">
        <hr />
        <p>maxWithdrawxETHAmount: {this.state.maxWithdrawxETHAmountShow}</p>
        <p>withdrawxETHtxhash: 
          <a href={this.state.txhashHref + this.state.withdrawxETHtxhash} target="_blank" >{this.state.withdrawxETHtxhash}</a>
        </p>
        <div className="withdrawxETHGroupDiv">
          {withdrawxETHGroup}
          {withdrawxETHButton}
        </div>
      </div>
    );
  }
}

export default WithdrawxETH;
