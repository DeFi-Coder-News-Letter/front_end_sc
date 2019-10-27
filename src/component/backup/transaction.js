import React, { Component } from 'react';
import {Button, InputNumber, Spin, Icon, Input, Divider} from 'antd';
import DF from './../DF.js';
import Network from './../constant.json';
import USDX from './../USDX.js'
import xETH from './../xETH.js'

import MoneyMarket from './../MoneyMarket.js';


const InputGroup = Input.Group;

class Transaction extends Component {
    constructor(props) {
      super(props);
      this.state = {
        supplyType: props.supplyType,
        borrowType: props.borrowType,
        USDxName: props.USDxName,
        xETHName: props.xETHName,
        networkName: props.networkName,
        web3NoExist: props.web3NoExist,
        pendingApproval: props.pendingApproval,
        approve: props.approve,
        Approval: props.Approval,
        supplyAmount: null,
        supplyUSDxAmount: null,
        supplyxETHAmount: null,
        getHash: false,
        hashNumber: '',
        accountBalance: null,
        allowance: props.allowance,
        supplytxhash: '',
        supplyUSDxtxhash: '',
        supplyxETHtxhash: '',
        myAddressUSDxBalance: null,
        myAddressxETHBalance: null,
        ethBalance: null,
        unWrapxETHAmount: null,
        unWrapxETHtxhash: '',
        withdrawtxhash: "",
        withdrawAmount: null,
        maxWithdrawAmount: null,
        withdrawMax: false,
        wrapxETHAmount: null,
        wrapxETHtxhash: '',
        withdrawxETHAmount: null,
        withdrawxETHtxhash: "",
        withdrawxETHMax: false,
        maxWithdrawxETHAmount: null,
        maxBorrowAmount: null,
        maxBorrowAmountShow: null,
        borrowAmount: null,
        borrowMax: false,
        borrowtxhash: "",
        USDxApproval: props.USDxApproval,
        pendingUSDxApproval: props.pendingUSDxApproval,
        maxRepayBorrowAmount: null,
        maxRepayBorrowAmountShow: null,
        repayBorrowtxhash: '',
        repayBorrowAmount: null,
        repayBorrowMax: false,
        borrowBalance: null,
        txhashHref: 'https://kovan.etherscan.io/tx/'
      };
      this.web3 = window.web3;
    }
  
    getAccountBalance = () => {
        DF().balanceOf(this.web3.eth.accounts[0], (err,res) => {
          this.setState({accountBalance: this.props.toFormatShowNumber(this.web3.fromWei(res.toNumber(), "ether")) })
        });
    }

    getETHBalance = () => {
      this.web3.eth.getBalance(this.web3.eth.accounts[0], (err, balance) => {
        this.setState({ethBalance: this.props.toFormatShowNumber(this.web3.fromWei(balance.toNumber(), "ether"))})
      });
    }

    getDFAllowance = () => {
      DF().allowance(
        this.web3.eth.accounts[0], 
        Network[this.state.networkName].MoneyMarket,
        (err, res) => {
          let allowanceVal = res.toNumber();
          if(allowanceVal > 0) {
            this.setState({allowance: allowanceVal});
          }
      });
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

    getxETHAllowance = () => {
      xETH().allowance(
        this.web3.eth.accounts[0], 
        Network[this.state.networkName].MoneyMarket,
        (err, res) => {
          let allowanceVal = res.toNumber();
          if(allowanceVal > 0) {
            this.setState({xETHAllowance: allowanceVal});
          }
      });
    }

    handleWithdrawAmount = value => {
      this.setState({ withdrawAmount: value });
      this.setState({ withdrawMax: false});
    };

    handleWithdrawMax = () => {
      this.setState({ withdrawAmount: -1 });
      this.setState({ withdrawMax: true});
    }

    handleSupplyAmount = (value) => {
      this.getAccountBalance();
      this.setState({supplyAmount: value});
    }

    handleSupplyUSDxAmount = (value) => {
      this.getMyAddressUSDxBalance();
      this.setState({supplyUSDxAmount: value});
    }

    handleSupplyxETHAmount = (value) => {
      this.getMyAddressxETHBalance();
      this.setState({supplyxETHAmount: value});
    }

    handleWrapxETHAmount = value => {
      this.setState({ wrapxETHAmount: value });
    };

    handleUnWrapxETHAmount = value => {
      this.setState({ unWrapxETHAmount: value });
    };

    getMyAddressUSDxBalance = () => {
        USDX().balanceOf(this.web3.eth.accounts[0], (err,res) => {
          this.setState({myAddressUSDxBalance: this.props.toFormatShowNumber(this.web3.fromWei(res.toNumber(), "ether")) });
        });
    }

    getMyAddressxETHBalance = () => {
      xETH().balanceOf(this.web3.eth.accounts[0], (err,res) => {
        this.setState({myAddressxETHBalance: this.props.toFormatShowNumber(this.web3.fromWei(res.toNumber(), "ether")) });
      });
    }

    getMaxWithdrawAmount = () => {
      let asset = Network[this.state.networkName][this.state.supplyType];
      MoneyMarket().getMaxWithdrawAmount(
        this.web3.eth.accounts[0],
        asset,
        (err, res) => {
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
            maxWithdrawxETHAmount: Number(this.web3.fromWei(res.toNumber(), "ether"))
          });
        }
      );
    };

    wrapxETH = (amount) => {
      xETH().deposit(
        {
          from: this.web3.eth.accounts[0], 
          value: this.web3.toWei(amount, "ether")}, 
          (err, res) => {
            this.setState({wrapxETHtxhash: res})
           }
      )
    }

    unWrapxETH = (amount) => {
      xETH().withdraw(
        this.web3.toWei(amount, "ether"), 
        (err, res) => {
          this.setState({unWrapxETHtxhash: res})
        }
      )
    }

    withdrawDF = withdrawAmount => {
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

    approve = (networkName) => {
      DF().approve(
        Network[networkName].MoneyMarket, 
        -1, 
        (err,res) => 
        {
          if (res !== undefined) {
            this.setState({getHash: true, hashNumber: res, pendingApproval: true});
            const approveEvent = DF().Approval(this.web3.eth.accounts[0], Network[networkName].MoneyMarket, -1);
            approveEvent.watch((err,res) => { 
              if(res.event === "Approval") { 
                this.setState({pendingApproval: false, Approval: true});
              };
            }
          );
          }
        }
      );
      this.props.approvalStatusUpdate(this.state.Approval);
    };

    approvexETH = (networkName) => {
      xETH().approve(
        Network[networkName].MoneyMarket, 
        -1, 
        (err,res) => 
        {
          if (res !== undefined) {
            this.setState({getHash: true, hashNumber: res, pendingxETHApproval: true});
            const approveEvent = xETH().Approval(this.web3.eth.accounts[0], Network[networkName].MoneyMarket, -1);
            approveEvent.watch((err,res) => { 
              if(res.event === "Approval") { 
                this.setState({pendingxETHApproval: false, xETHApproval: true});
              };
            }
          );
          }
        }
      );
      this.props.xETHApprovalStatusUpdate(this.state.xETHApproval);
    };

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
  
    handleSupply = (networkName, supplyType, amount) => {
        if (amount > this.state.accountBalance) {
          this.props.greaterThanSupplyAmount(true)
          return;
        }
        MoneyMarket().supply(Network[networkName][supplyType], 
          this.web3.toWei(amount,"ether"), 
          (err,res) => 
          {
            if (res !== undefined) {
              this.setState({supplytxhash: res});
            }
          }
        );
    };

    handleUSDxSupply = (networkName, USDxName, amount) => {
      MoneyMarket().supply(Network[networkName][USDxName], 
        this.web3.toWei(amount,"ether"), 
        (err,res) => 
        {
          if (res !== undefined) {
            this.setState({supplyUSDxtxhash: res});
          }
        }
      );
  };

    handleSupplyxETH = (networkName, supplyType, amount) => {
      if (amount > this.state.myAddressxETHBalance) {
        this.props.greaterThanSupplyxETHAmount(true)
        return;
      }
      MoneyMarket().supply(Network[networkName][supplyType], 
        this.web3.toWei(amount,"ether"), 
        (err,res) => 
        {
          if (res !== undefined) {
            this.setState({supplyxETHtxhash: res});
          }
        }
      );
  };

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

    calcMaxRepayBorrowAmount = () => {
      let borrowBalanceVal = this.state.borrowBalance;
      let myAddressUSDxBalanceVal = this.state.myAddressUSDxBalance;
      this.setState({maxRepayBorrowAmount: borrowBalanceVal < myAddressUSDxBalanceVal ? borrowBalanceVal : myAddressUSDxBalanceVal});
      this.setState({maxRepayBorrowAmountShow: borrowBalanceVal < myAddressUSDxBalanceVal ? this.props.toFormatShowNumber(borrowBalanceVal) : this.props.toFormatShowNumber(myAddressUSDxBalanceVal)});
      clearInterval(this.transactionInterval);
    }

    componentDidMount() {

      this.transactionInterval = setInterval(() => {
        if (this.state.borrowBalance !== null && this.state.myAddressUSDxBalance !== null) {
          this.calcMaxRepayBorrowAmount();
        }
        if(this.web3.eth.accounts[0] !== undefined) {
          this.getAccountBalance();
          this.getDFAllowance();
          this.getUSDxAllowance();
          this.getxETHAllowance();
          this.getMyAddressUSDxBalance();
          this.getMyAddressxETHBalance();
          this.getETHBalance();
          this.getMaxWithdrawAmount();
          this.getMaxWithdrawxETHAmount();
          this.getMaxBorrowAmount();
          this.getBorrowBalance();
        }
      }, 3000)
    }
  
    componentWillUnmount() {
      clearInterval(this.transactionInterval);
    }

    render() {
      
      const networkName = this.state.networkName;
      const antIcon = <Icon type="loading" style={{ fontSize: 24 , width: "27px", height: "27px"}} spin />;
      
      const disableSupply = !this.props.Approval;
      const disableBorrow = !this.props.USDxApproval;

      const supplyButton = disableSupply 
      ? this.state.web3NoExist 
      ? <Button disabled>Approve</Button> 
      : <Button onClick={() => this.approve(networkName)}>{this.state.pendingApproval ? <Spin indicator={antIcon} />: "Approve"}</Button> 
      : <Button onClick={()=> this.handleSupply(this.state.networkName, this.state.supplyType, this.state.supplyAmount)}>Supply</Button>;

      const supplyGroup = 
      <InputGroup compact style={{width:"360px"}}>
        <label>{this.state.supplyType}&nbsp;</label>
        <InputNumber min={0} max={this.state.accountBalance} style={{width:"62%"}} onChange={this.handleSupplyAmount} disabled={disableSupply}/>
      </InputGroup>

      const dfWithdrawButton = (
        <Button onClick={() => this.withdrawDF(this.state.withdrawAmount)}>Withdraw</Button>
      );
      const dfWithdrawGroup = (
        <InputGroup compact style={{ width: "360px" }}>
          <label>Withdraw DF&nbsp;</label>
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

      const wrapxETHButton = (
        <Button onClick={() => this.wrapxETH(this.state.wrapxETHAmount)}>
          Wrap
        </Button>
      );
      const wrapxETHGroup = (
        <InputGroup compact style={{ width: "360px" }}>
          <label>ETH -> {this.state.xETHName}&nbsp;</label>
          <InputNumber
            min={0}
            max={this.state.ethBalance}
            step={0.1}
            style={{ width: "62%" }}
            onChange={this.handleWrapxETHAmount}
          />
        </InputGroup>
        );

        const withdrawxETHButton = (
          <Button onClick={() => this.withdrawxETH(this.state.withdrawxETHAmount)}>
            Withdraw
          </Button>
        );
        const withdrawxETHGroup = (
          <InputGroup compact style={{ width: "360px" }}>
            <label>Withdraw xETH&nbsp;</label>
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

        const unWrapxETHButton = (
          <Button onClick={() => this.unWrapxETH(this.state.unWrapxETHAmount)}>
            UnWrap
          </Button>
        );
        const unWrapxETHGroup = (
          <InputGroup compact style={{ width: "360px" }}>
            <label>{this.state.xETHName} -> ETH&nbsp;</label>
            <InputNumber
              min={0}
              max={this.state.myAddressxETHBalance}
              step={0.1}
              style={{ width: "62%" }}
              onChange={this.handleUnWrapxETHAmount}
            />
          </InputGroup>
          );

      const disablexETHSupply = !this.props.xETHApproval;
      const supplyxETHButton = disablexETHSupply 
      ? this.state.web3NoExist 
      ? <Button disabled>Approve</Button> 
      : <Button onClick={() => this.approvexETH(networkName)}>{this.state.pendingxETHApproval ? <Spin indicator={antIcon} />: "Approve"}</Button> 
      : <Button onClick={()=> this.handleSupplyxETH(this.state.networkName, this.state.xETHName, this.state.supplyxETHAmount)}>Supply</Button>;

      const supplyxETHGroup = 
      <InputGroup compact style={{width:"360px"}}>
        <label>{this.state.xETHName}&nbsp;</label>
        <InputNumber min={0} max={this.state.myAddressxETHBalance} style={{width:"62%"}} onChange={this.handleSupplyxETHAmount} disabled={disablexETHSupply}/>
      </InputGroup>

      const supplyUSDxButton = (
        <Button onClick={()=> this.handleUSDxSupply(this.state.networkName, this.state.USDxName, this.state.supplyUSDxAmount)}>Supply</Button>
      );
      const supplyUSDxGroup = (
        <InputGroup compact style={{width:"360px"}}>
        <label>{this.state.USDxName}&nbsp;</label>
        <InputNumber min={0} style={{width:"62%"}} onChange={this.handleSupplyUSDxAmount}/>
        </InputGroup>
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
        <Button onClick={() => this.borrow(this.state.borrowAmount)}>Borrow</Button>
      );
      const borrowGroup = (
        <InputGroup compact style={{ width: "370px" }}>
          <label>Borrow USDx&nbsp;</label>
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

      const repayBorrowButton = disableBorrow
      ? this.state.web3NoExist 
      ? <Button disabled>Approve</Button> 
      : <Button onClick={() => this.usdxApprove(networkName)}>{this.state.pendingUSDxApproval ? <Spin indicator={antIcon} />: "Approve"}</Button> 
      : <Button onClick={()=> this.repayBorrow(this.state.repayBorrowAmount)}>RepayBorrow</Button>;
      const repayBorrowGroup = 
      <InputGroup compact style={{width:"360px"}}>
        <label>Repay Borrow USDx&nbsp;</label>
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
        <div className="Transaction">
            <Divider orientation="left">Transaction</Divider>

            <p>DF Supply txhash: 
              <a href={this.state.txhashHref + this.state.supplytxhash} target="_blank" >{this.state.supplytxhash}</a>
            </p>
            <p>{supplyGroup}</p>
            <p>{supplyButton}</p>

            <p>Withdraw DF txhash: 
              <a href={this.state.txhashHref + this.state.withdrawtxhash} target="_blank" >{this.state.withdrawtxhash}</a>
            </p>
            <div className="withdrawGroupDiv">
              {dfWithdrawGroup}
              {dfWithdrawButton}
            </div>
            
            <Divider dashed />
            
            <p>xETH Supply txhash: 
              <a href={this.state.txhashHref + this.state.supplyxETHtxhash} target="_blank" >{this.state.supplyxETHtxhash}</a>
            </p>
            <p>{supplyxETHGroup}</p>
            <p>{supplyxETHButton}</p>

            <p>Withdraw xETH txhash: 
            <a href={this.state.txhashHref + this.state.withdrawxETHtxhash} target="_blank" >{this.state.withdrawxETHtxhash}</a>
            </p>
            <div className="withdrawxETHGroupDiv">
              {withdrawxETHGroup}
              {withdrawxETHButton}
            </div>

            <Divider dashed />

            
            <p>(ETH -> {this.state.xETHName}) wrapxETHtxhash: 
              <a href={this.state.txhashHref + this.state.wrapxETHtxhash} target="_blank" >{this.state.wrapxETHtxhash}</a>
            </p>
            <p>{wrapxETHGroup}</p>
            <p>{wrapxETHButton}</p>
            <p>({this.state.xETHName} -> ETH) unWrapxETHtxhash: 
              <a href={this.state.txhashHref + this.state.unWrapxETHtxhash} target="_blank" >{this.state.unWrapxETHtxhash}</a>
            </p>
            <p>{unWrapxETHGroup}</p>
            <p>{unWrapxETHButton}</p>
            
            <Divider dashed />

            <p>USDx Supply txhash: 
              <a href={this.state.txhashHref + this.state.supplyUSDxtxhash} target="_blank" >{this.state.supplyUSDxtxhash}</a>
            </p>
            <p>{supplyUSDxGroup}</p>
            <p>{supplyUSDxButton}</p>

            <p>Max Borrow USDx Amount: {this.state.maxBorrowAmountShow}</p>
            <p>Borrow USDx Balance: {this.state.borrowBalanceShow}</p>
            <p>Borrow txhash: 
              <a href={this.state.txhashHref + this.state.borrowtxhash} target="_blank" >{this.state.borrowtxhash}</a>
            </p>
            <div className="borrowDiv">
              {borrowGroup}
              {borrowButton}
            </div>

            <p>Max Repay Borrow Amount: {this.state.maxRepayBorrowAmountShow}</p>
            <p>Repay Borrow txhash: 
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
  
  export default Transaction;
  