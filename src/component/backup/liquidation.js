import React, { Component } from "react";
import { Select, Button, Divider, Input, InputNumber} from 'antd';
import Network from './../constant.json';
import MoneyMarket from "./../MoneyMarket.js";

const InputGroup = Input.Group;
const Option = Select.Option;

class Liquidation extends Component {
  constructor(props) {
    super(props);
    this.state = {
      accounts: [],
      needLiquidityAccounts: [],
      networkName: props.networkName,
      liquidationAddress: null,
      liquidationCollateral: null,
      liquidationtxhash: '',
      liquidateAmount: null,
      maxLiquidateAmount: '',
      txhashHref: 'https://kovan.etherscan.io/tx/'
    };
    this.web3 = window.web3;
  }

  getAllAccounts = () => {
    MoneyMarket().getAllAccounts(
      (err, res) => {
        this.setState({accounts: res})
      }
    )
  }

  selectAddress = (value) => {
    this.setState({liquidationAddress: value});
  }

  selectCollateral = (value) => {
    this.setState({liquidationCollateral: value});
    this.maxLiquidateAmountTimer = setInterval(() => {
        if (this.state.liquidationCollateral !== null) {
          this.getMaxLiquidateAmount();
        }
      }, 3000);
  }

  liquidateBorrow = () => {
    if (this.state.liquidationAddress == null || this.state.liquidationCollateral == null 
      || (this.state.liquidateAmount === null || this.state.liquidateAmount === 0)){
      this.props.liquidationParamsNull(true);
      return;
    }
    let assetBorrow = Network[this.state.networkName]['USDx'];
    let assetCollateral = Network[this.state.networkName][this.state.liquidationCollateral];
    MoneyMarket().liquidateBorrow(this.state.liquidationAddress,
      assetBorrow,
      assetCollateral,
      this.web3.toWei(this.state.liquidateAmount, "ether"),
      (err, res) => {
        this.setState({liquidationtxhash: res});
      }
    );
  }

  getMaxLiquidateAmount = () => {
    let assetBorrow = Network[this.state.networkName]['USDx'];
    let assetCollateral = Network[this.state.networkName][this.state.liquidationCollateral];
    MoneyMarket().getMaxLiquidateAmount(this.state.liquidationAddress,
      assetBorrow,
      assetCollateral,
      (err, res) => {;
        let res0 = res[0]; // TODO res0 正常情况下总是输出0，该如何处理？
        let res1 = res[1];
        this.setState({maxLiquidateAmount: this.web3.fromWei(res1.toNumber(), "ether")});
      }
    );
  }

  handleLiquidateAmount = value => {
    this.setState({ liquidateAmount: value });
  };

  handleLiquidateMax = () => {
    this.setState({ liquidateAmount: this.state.maxLiquidateAmount });
  }

  getAccountLiquidityByAddress = (address, index) => {
    MoneyMarket().getAccountLiquidity(address,
      (err, res) => {
        let liquidity = this.web3.fromWei(res.toNumber(), "ether");
        if (liquidity < 0) {
          this.state.needLiquidityAccounts.push(address);
        }
      }
    );
    if (index === this.state.accounts.length - 1) {
      clearInterval(this.getAccountsTimer);
    }
  }

  getNeedLiquidityAccounts = () => {
    this.getAccountsTimer = setInterval(() => {
      if (this.state.accounts.length !== 0) {
        this.state.accounts.forEach((address,index)=>{
          this.getAccountLiquidityByAddress(address,index);
        });
      }
    }, 3000);
  }

  componentDidMount() {
    this.getAllAccounts();
    this.getNeedLiquidityAccounts();
  }

  componentWillUnmount() {
    clearInterval(this.getAccountsTimer)
    clearInterval(this.maxLiquidateAmountTimer);
  }

  render() {
    const needLiquidityAccountsData = [];
      this.state.needLiquidityAccounts.forEach((item,index)=>{
        needLiquidityAccountsData.push(<Option key={item}>{item}</Option>);
      });

      const assetCollateralArray = ['DF', 'xETH'];
      const assetCollateralData = [];
      assetCollateralArray.forEach((item,index)=>{
        assetCollateralData.push(<Option key={item}>{item}</Option>);
      });

      const liquidationButton = (
        <Button onClick={() => this.liquidateBorrow()}>
          Liquidation
        </Button>
      );

      const liquidateAmountGroup = (
        <InputGroup compact style={{ width: "360px" }}>
          <label>&nbsp;&nbsp;Liquidate Amount:&nbsp;</label>
          <InputNumber
            min={0}
            max={this.state.maxLiquidateAmount}
            step={0.1}
            value={this.state.liquidateAmount}
            style={{ width: "62%" }}
            onChange={this.handleLiquidateAmount}
          />
          <span className="maxLiquidateAmountButton" onClick={this.handleLiquidateMax}>MAX</span>
        </InputGroup>
      );

    return (
      <div className="liquidation">
        <Divider orientation="left">Liquidation</Divider>
        <p>Liquidation txhash: 
          <a href={this.state.txhashHref + this.state.liquidationtxhash} target="_blank" >{this.state.liquidationtxhash}</a>
        </p>
        <p>Need liquidation accounts:
              <Select 
                style={{ width: '400px' }}
                defaultValue="Select an address"
                onChange={this.selectAddress}
              >
                {needLiquidityAccountsData}
              </Select>
              &nbsp;&nbsp;Collateral:
              <Select 
                style={{ width: '200px' }}
                defaultValue="Select an collateral"
                onChange={this.selectCollateral}
              >
                {assetCollateralData}
              </Select>
              <div className="liquidateAmountGroupDiv">
                {liquidateAmountGroup}
              </div>
              
              <p>
                {liquidationButton}
              </p>
            </p>
      </div>
    );
  }
}

export default Liquidation;
