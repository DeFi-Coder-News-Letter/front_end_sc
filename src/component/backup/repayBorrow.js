import React, { Component } from 'react';
import {Button, InputNumber, Spin, Icon, Input} from 'antd';
import Network from './../constant.json';
import USDX from './../USDX.js'

import MoneyMarket from './../MoneyMarket.js';


const InputGroup = Input.Group;

class RepayBorrow extends Component {
    constructor(props) {
      super(props);
      this.state = {
        supplyType: props.supplyType,
        networkName: props.networkName,
        web3NoExist: props.web3NoExist,
        myAddress: props.myAddress,
        getHash: false,
        hashNumber: '',
        maxBorrowAmount: null,
        borrowType: props.borrowType,
        borrowBalance: null,
        myAddressUSDxBalance: null,
        maxRepayBorrowAmount: null,
        maxRepayBorrowAmountShow: null,
        repayBorrowtxhash: '',
        repayBorrowAmount: null,
        usdxAllowance: props.usdxAllowance,
        USDxApproval: props.USDxApproval,
        pendingUSDxApproval: props.pendingUSDxApproval,
        repayBorrowMax: false,
        txhashHref: 'https://kovan.etherscan.io/tx/'
      };
      this.web3 = window.web3;
    }


    getUSDxAllowance = () => {
      USDX().allowance(
        this.web3.eth.accounts[0], 
        Network[this.state.networkName].MoneyMarket,
        (err, res) => {
          let allowanceVal = res.toNumber();
          if(allowanceVal > 0) {
            this.setState({usdxAllowance: allowanceVal});
          }
      });
    }

    getMaxBorrowAmount = () => {
      let myAddress = this.web3.eth.accounts[0];
      let asset = Network[this.state.networkName][this.state.borrowType];
      MoneyMarket().getMaxBorrowAmount(myAddress, 
        asset,
        (err,res) => 
        {
          this.setState({maxBorrowAmount: Number(this.web3.fromWei(res.toNumber(), "ether")) });
        }
      );
    }

    getBorrowBalance = () => {
      let myAddress = this.web3.eth.accounts[0];
      let asset = Network[this.state.networkName][this.state.borrowType];
      MoneyMarket().getBorrowBalance(myAddress, 
        asset,
        (err,res) => 
        {
          this.setState({borrowBalance: this.web3.fromWei(res.toNumber(), "ether") });
        }
      );
    }

    componentDidMount() {
        this.timerID = setInterval(() => {
          if (this.state.borrowBalance !== null && this.state.myAddressUSDxBalance !== null) {
            this.calcMaxRepayBorrowAmount();
          }
          if (this.web3.eth.accounts[0] !== undefined) {
            this.getUSDxAllowance();
            this.getMaxBorrowAmount();
            this.getBorrowBalance();
            this.getMyAddressUSDxBalance();
          }
        }, 3000);
    }

    componentWillUnmount() {
      clearInterval(this.timerID)
    }

    calcMaxRepayBorrowAmount = () => {
      let borrowBalanceVal = this.state.borrowBalance;
      let myAddressUSDxBalanceVal = this.state.myAddressUSDxBalance;
      this.setState({maxRepayBorrowAmount: borrowBalanceVal < myAddressUSDxBalanceVal ? borrowBalanceVal : myAddressUSDxBalanceVal});
      this.setState({maxRepayBorrowAmountShow: borrowBalanceVal < myAddressUSDxBalanceVal ? this.props.toFormatShowNumber(borrowBalanceVal) : this.props.toFormatShowNumber(myAddressUSDxBalanceVal)});
      clearInterval(this.timerID);
    }

    getMyAddressUSDxBalance = () => {
        USDX().balanceOf(this.web3.eth.accounts[0], (err,res) => {
          this.setState({myAddressUSDxBalance: Number(this.web3.fromWei(res.toNumber(), "ether")) });
        });
    }

      usdxApprove = (networkName) => {
           USDX().approve(
              Network[networkName].MoneyMarket, 
              -1, 
              (err,res) => 
              {
                if (res !== undefined) {
                  this.setState({getHash: true, hashNumber: res, pendingUSDxApproval: true});
                  const approveEvent = USDX().Approval(this.web3.eth.accounts[0], Network[networkName].MoneyMarket, -1);
                  approveEvent.watch((err,res) => { 
                    if(res.event === "Approval") { 
                      this.setState({pendingUSDxApproval: false, USDxApproval: true});
                    };
                  }
                );
                }
              }
            );
            this.props.usdxApprovalStatusUpdate(this.state.USDxApproval);
      };
    
    repayBorrow = (repayBorrowAmount) => {
      if (this.state.repayBorrowMax) {
        repayBorrowAmount = -1;
      }
      let asset = Network[this.state.networkName][this.state.borrowType];
      MoneyMarket().repayBorrow(asset,
        repayBorrowAmount === -1 ? -1 : this.web3.toWei(repayBorrowAmount, "ether"),
        (err,res) => 
        {
          if (res !== undefined) {
            this.setState({repayBorrowtxhash: res});
          }
        }
      );
    }

    handleRepayBorrowAmount = (value) => {
      this.setState({repayBorrowAmount: value});
      this.setState({ repayBorrowMax: false});
    }

    handleRepayBorrowMax = () => {
      this.setState({ repayBorrowAmount: -1 });
      this.setState({ repayBorrowMax: true});
    }
  
    render() {     
      const disableBorrow = !this.props.USDxApproval;
      const networkName = this.state.networkName;
      const antIcon = <Icon type="loading" style={{ fontSize: 24 , width: "27px", height: "27px"}} spin />;
  
      const repayBorrowButton = disableBorrow
      ? this.state.web3NoExist 
      ? <Button disabled>Approve</Button> 
      : <Button onClick={() => this.usdxApprove(networkName)}>{this.state.pendingUSDxApproval ? <Spin indicator={antIcon} />: "Approve"}</Button> 
      : <Button onClick={()=> this.repayBorrow(this.state.repayBorrowAmount)}>RepayBorrow</Button>;
      const repayBorrowGroup = 
      <InputGroup compact style={{width:"360px"}}>
        <label>repay borrow({this.state.borrowType})</label>
        <InputNumber 
        min={0} 
        max={this.state.maxRepayBorrowAmount} 
        step={0.1}
        value={this.state.repayBorrowAmount === -1 ? this.state.maxRepayBorrowAmount : this.state.repayBorrowAmount}
        style={{width:"62%"}} 
        onChange={this.handleRepayBorrowAmount} disabled={disableBorrow}/>
        <span className="maxRepayBorrowAmountButton" onClick={this.handleRepayBorrowMax}>MAX</span>
      </InputGroup>

      return (
        <div className="repayBorrow-input">
            <hr/>
            <p>maxRepayBorrowAmount: {this.state.maxRepayBorrowAmountShow}</p>
            <p>repayBorrowtxhash: 
              <a href={this.state.txhashHref + this.state.repayBorrowtxhash} target="_blank" >{this.state.repayBorrowtxhash}</a>
            </p>
            <div className="repayBorrowDiv">
              {repayBorrowGroup}
              {repayBorrowButton}
            </div>
        </div>
      );
    }
  }
  
  export default RepayBorrow;
  