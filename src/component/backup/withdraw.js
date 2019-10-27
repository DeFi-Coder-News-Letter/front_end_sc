import React, { Component } from "react";
import { Button, InputNumber, Input } from "antd";
import Network from "./../constant.json";
import MoneyMarket from "./../MoneyMarket.js";

const InputGroup = Input.Group;

class Withdraw extends Component {
  constructor(props) {
    super(props);
    this.state = {
      supplyType: props.supplyType,
      networkName: props.networkName,
      myAddress: props.myAddress,
      maxWithdrawAmount: null,
      maxWithdrawAmountShow: null,
      withdrawAmount: null,
      withdrawtxhash: "",
      withdrawMax: false,
      txhashHref: 'https://kovan.etherscan.io/tx/'
    };
    this.web3 = window.web3;
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

  withdraw = withdrawAmount => {
    if (withdrawAmount > this.state.maxWithdrawAmount) {
      this.props.greaterThanMaxWithdraw(true);
      return;
    }
    if (this.state.withdrawMax) {
      withdrawAmount = -1;
    }
    let asset = Network[this.state.networkName][this.state.supplyType];
    MoneyMarket().withdraw(
      asset,
      withdrawAmount === -1 ? -1 : this.web3.toWei(withdrawAmount, "ether"),
      (err, res) => {
        if (res !== undefined) {
          this.setState({ withdrawtxhash: res });
        }
      }
    );
  };

  handleWithdrawAmount = value => {
    this.setState({ withdrawAmount: value });
    this.setState({ withdrawMax: false});
  };

  handleWithdrawMax = () => {
    this.setState({ withdrawAmount: -1 });
    this.setState({ withdrawMax: true});
  }

  componentDidMount() {
    this.getAddressIntervalWithdraw = setInterval(() => {
      if(this.web3.eth.accounts[0] !== undefined) {
        this.getMaxWithdrawAmount();
      }
    }, 3000)
  }

  componentWillUnmount() {
    clearInterval(this.getAddressIntervalWithdraw);
  }

  render() {
    const withdrawButton = (
      <Button onClick={() => this.withdraw(this.state.withdrawAmount)}>
        Withdraw
      </Button>
    );
    const withdrawGroup = (
      <InputGroup compact style={{ width: "360px" }}>
        <label>withdraw({this.state.supplyType})</label>
        <InputNumber
          min={0}
          max={this.state.maxWithdrawAmount}
          step={0.1}
          value={this.state.withdrawAmount === -1 ? this.state.maxWithdrawAmount : this.state.withdrawAmount}
          style={{ width: "62%" }}
          onChange={this.handleWithdrawAmount}
        />
        <span className="maxWithdrawAmountButton" onClick={this.handleWithdrawMax}>MAX</span>
      </InputGroup>
    );

    return (
      <div className="withdraw-input">
        <hr />
        <p>maxWithdrawAmount: {this.state.maxWithdrawAmountShow}</p>
        <p>withdrawtxhash: 
          <a href={this.state.txhashHref + this.state.withdrawtxhash} target="_blank" >{this.state.withdrawtxhash}</a>
        </p>
        <div className="withdrawGroupDiv">
          {withdrawGroup}
          {withdrawButton}
        </div>
      </div>
    );
  }
}

export default Withdraw;
