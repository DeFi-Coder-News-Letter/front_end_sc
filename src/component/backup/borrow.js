import React, { Component } from "react";
import { Button, InputNumber, Spin, Icon, Input } from "antd";
import Network from "./../constant.json";
import USDX from "./../USDX.js";

import MoneyMarket from "./../MoneyMarket.js";

const InputGroup = Input.Group;

class Borrow extends Component {
  constructor(props) {
    super(props);
    this.state = {
      supplyType: props.supplyType,
      networkName: props.networkName,
      web3NoExist: props.web3NoExist,
      myAddress: props.myAddress,
      getHash: false,
      hashNumber: "",
      maxBorrowAmount: null,
      maxBorrowAmountShow: null,
      borrowAmount: null,
      borrowType: props.borrowType,
      borrowtxhash: "",
      borrowBalance: null,
      borrowBalanceShow: null,
      repayBorrowAmount: null,
      DFBorrowMarketInfo: [],
      USDxBorrowMarketInfo: [],
      xETHBorrowMarketInfo: [],
      USDxApproval: props.USDxApproval,
      pendingUSDxApproval: props.pendingUSDxApproval,
      borrowMax: false,
      txhashHref: 'https://kovan.etherscan.io/tx/'
    };
    this.web3 = window.web3;
  }

  getMaxBorrowAmount = () => {
    let myAddress = this.web3.eth.accounts[0];
    let asset = Network[this.state.networkName][this.state.borrowType];
    MoneyMarket().getMaxBorrowAmount(myAddress, asset, (err, res) => {
      this.setState({
        maxBorrowAmount: Number(this.web3.fromWei(res.toNumber(), "ether"))
      });
      this.setState({
        maxBorrowAmountShow: this.props.toFormatShowNumber(this.web3.fromWei(res.toNumber(), "ether"))
      });
    });
  };

  getBorrowMarketInfo = (asset) => {
    MoneyMarket().markets.call(Network[this.state.networkName][asset], 
      (err,res) => {
        const newRes = [res[6],res[7],res[8]];
        const borrowInfo = newRes.map(amount => this.web3.fromWei(amount.toNumber(), "ether"))
        this.setState({
          [`${asset}BorrowMarketInfo`]: borrowInfo
        })
      }
    );
  }

  getBorrowBalance = () => {
    let myAddress = this.web3.eth.accounts[0];
    let asset = Network[this.state.networkName][this.state.borrowType];
    MoneyMarket().getBorrowBalance(myAddress, asset, (err, res) => {
      this.setState({
        borrowBalance: this.web3.fromWei(res.toNumber(), "ether")
      });
      this.setState({
        borrowBalanceShow: this.props.toFormatShowNumber(this.web3.fromWei(res.toNumber(), "ether"))
      });
    });
  };

  componentDidMount() {
    this.getAddressIntervalBorrow = setInterval(() => {
      if(this.web3.eth.accounts[0] !== undefined) {
        this.getMaxBorrowAmount();
        this.getBorrowBalance();
        this.getBorrowMarketInfo('DF');
        this.getBorrowMarketInfo('USDx');
        this.getBorrowMarketInfo('xETH');
      }
    }, 3000)
  }

  componentWillUnmount() {
    clearInterval(this.getAddressIntervalBorrow);
  }

  usdxApprove = networkName => {
    USDX().approve(Network[networkName].MoneyMarket, -1, (err, res) => {
      if (res !== undefined) {
        this.setState({
          getHash: true,
          hashNumber: res,
          pendingUSDxApproval: true
        });
        const approveEvent = USDX().Approval(
          this.web3.eth.accounts[0],
          Network[networkName].MoneyMarket,
          -1
        );
        approveEvent.watch((err, res) => {
          if (res.event === "Approval") {
            this.setState({ pendingUSDxApproval: false, USDxApproval: true });
          }
        });
      }
    });
    this.props.usdxApprovalStatusUpdate(this.state.USDxApproval);
  };

  borrow = (borrowAmount) => {
    if (borrowAmount > this.state.maxBorrowAmount) {
      this.props.greaterThanMaxBorrow(true);
      return;
    }
    if (this.state.borrowMax) {
      borrowAmount = this.props.toFormatShowNumber(borrowAmount);
    }
    let asset = Network[this.state.networkName][this.state.borrowType];
    MoneyMarket().borrow(
      asset,
      this.web3.toWei(borrowAmount, "ether"),
      (err, res) => {
        if (res !== undefined) {
          this.setState({ borrowtxhash: res });
        }
      }
    );
  };

  handleBorrowAmount = value => {
    this.setState({ borrowAmount: value });
    this.setState({ borrowMax: false});
  };

  handleBorrowMax = () => {
    this.setState({ borrowAmount: this.state.maxBorrowAmount });
    this.setState({ borrowMax: true});
  }


  render() {
    const disableBorrow = !this.props.USDxApproval;
    const networkName = this.state.networkName;

    const [usdxTotalBorrow, usdxBorrowRateMantissa, usdxBorrowIndex] = this.state.USDxBorrowMarketInfo;

    const antIcon = (
      <Icon
        type="loading"
        style={{ fontSize: 24, width: "27px", height: "27px" }}
        spin
      />
    );

    const borrowButton = disableBorrow ? (
      this.state.web3NoExist ? (
        <Button disabled>Approve</Button>
      ) : (
        <Button onClick={() => this.usdxApprove(networkName)}>
          {this.state.pendingUSDxApproval ? (
            <Spin indicator={antIcon} />
          ) : (
            "Approve"
          )}
        </Button>
      )
    ) : (
      <Button onClick={() => this.borrow(this.state.borrowAmount)}>
        Borrow
      </Button>
    );
    const borrowGroup = (
      <InputGroup compact style={{ width: "370px" }}>
        <label>borrow({this.state.borrowType})</label>
        <InputNumber
          min={0} 
          max={this.state.maxBorrowAmount} 
          step={0.1}
          value={this.state.borrowAmount === -1 ? this.state.maxBorrowAmount : this.state.borrowAmount}
          style={{width:"62%"}} 
          onChange={this.handleBorrowAmount}
          disabled={disableBorrow}
        />
        <span className="maxBorrowAmountButton" onClick={this.handleBorrowMax}>MAX</span>
      </InputGroup>
    );

    return (
      <div className="borrow-input">
        <hr />
        <p>maxBorrowAmount: {this.state.maxBorrowAmountShow}</p>
        <p>borrowBalance: {this.state.borrowBalanceShow}</p>
        <p>borrowtxhash: 
          <a href={this.state.txhashHref + this.state.borrowtxhash} target="_blank" >{this.state.borrowtxhash}</a>
        </p>
        <div className="borrowDiv">
          {borrowGroup}
          {borrowButton}
        </div>
      </div>
    );
  }
}

export default Borrow;
