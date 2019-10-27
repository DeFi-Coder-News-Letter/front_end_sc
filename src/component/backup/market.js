import React, { Component } from 'react';
import Network from './../constant.json';
import MoneyMarket from './../MoneyMarket.js';
import { Divider } from 'antd';

class Market extends Component {
    constructor(props) {
      super(props);
      this.state = {
        networkName: props.networkName,
        web3NoExist: props.web3NoExist,
        DFSupplyMarketInfo: [],
        USDxSupplyMarketInfo: [],
        xETHSupplyMarketInfo: [],
        DFBorrowMarketInfo: [],
        USDxBorrowMarketInfo: [],
        xETHBorrowMarketInfo: [],
        DFAssetPrice: null,
        xETHAssetPrice: null,
        USDxAssetPrice: null,
        collateralRatio: null,
        liquidationDiscount: null,
        originationFee: null,
        txhashHref: 'https://kovan.etherscan.io/tx/'
      };
      this.web3 = window.web3;
    }

    

  getSupplyMarketInfo = (asset) => {
    MoneyMarket().markets.call(Network[this.state.networkName][asset], 
      (err,res) => {
        const newRes = [res[3],res[4],res[5]];
        const supplyInfo = newRes.map(amount => this.web3.fromWei(amount.toNumber(), "ether"))
        this.setState({
          [`${asset}SupplyMarketInfo`]: supplyInfo
        })
      }
    );  
  }

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

  getAssetPrice = (asset) => {
    MoneyMarket().assetPrices(Network[this.state.networkName][asset], 
      (err,res) => this.setState({[`${asset}AssetPrice`]: this.web3.fromWei(res.toNumber(), "ether")}))
  }

  getCollateralRatio = () => {
    MoneyMarket().collateralRatio((err,res) => this.setState({collateralRatio: this.web3.fromWei(res.toNumber(), "ether")}));
  }

  getLiquidationDiscount = () => {
    MoneyMarket().liquidationDiscount((err,res) => this.setState({liquidationDiscount: this.web3.fromWei(res.toNumber(), "ether")}))
  } 

  getOriginationFee = () => {
    MoneyMarket().originationFee((err,res) => this.setState({originationFee: this.web3.fromWei(res.toNumber(), "ether")}))
  }

    componentDidMount() {
      this.marketInterval = setInterval(() => {
        if(this.web3.eth.accounts[0] !== undefined) {
          this.getSupplyMarketInfo('DF');
          this.getSupplyMarketInfo('xETH');
          this.getBorrowMarketInfo('USDx');
          this.getAssetPrice('DF');
          this.getAssetPrice('xETH');
          this.getAssetPrice('USDx');
          this.getCollateralRatio();
          this.getLiquidationDiscount();
          this.getOriginationFee();
        }
      }, 3000)
    }
  
    componentWillUnmount() {
      clearInterval(this.marketInterval);
    }

    render() {
      const [dfTotalSupply, dfSupplyRateMantissa, dfSupplyIndex] = this.state.DFSupplyMarketInfo;
      const [xethTotalSupply, xethSupplyRateMantissa, xethSupplyIndex] = this.state.xETHSupplyMarketInfo;
      const [usdxTotalBorrow, usdxBorrowRateMantissa, usdxBorrowIndex] = this.state.USDxBorrowMarketInfo;

      return (
        <div className="market">
            <Divider orientation="left">Market</Divider>
            <p>Collateral Ratio: {this.state.collateralRatio}</p>
            <p>Liquidation Discount: {this.state.liquidationDiscount}</p>
            <p>Origination Fee: {this.state.originationFee}</p>
            <Divider dashed />
            <p>DF Asset Price: {this.state.DFAssetPrice}</p>
            <p>DF Total Supply: {dfTotalSupply}</p>
            <p>DF Supply Rate: {dfSupplyRateMantissa}</p>
            <p>DF Supply Index: {dfSupplyIndex}</p>
            <Divider dashed />
            <p>xETH Asset Price: {this.state.xETHAssetPrice}</p>
            <p>xETH Total Supply: {xethTotalSupply}</p>
            <p>xETH Supply Rate: {xethSupplyRateMantissa}</p>
            <p>xETH Supply Index: {xethSupplyIndex}</p>
            <Divider dashed />
            <p>USDx Asset Price: {this.state.USDxAssetPrice}</p>
            <p>USDx Total Borrow: {usdxTotalBorrow}</p>
            <p>USDx Borrow Rate: {usdxBorrowRateMantissa}</p>
            <p>USDx Borrow Index: {usdxBorrowIndex}</p>
        </div>
      );
    }
  }
  
  export default Market;
  