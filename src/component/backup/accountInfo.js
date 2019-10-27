import React, { Component } from 'react';
import { Table, Divider } from 'antd';
import DF from './../DF.js'
import USDX from './../USDX.js'
import xETH from './../xETH.js'
import Network from './../constant.json';
import MoneyMarket from './../MoneyMarket.js';


class AccountInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      networkName: props.networkName,
      web3NoExist: props.web3NoExist,
      accounts: [],
      borrowType: 'USDx',
      accountLiquidityMap: new Map(),
      // accountDFBalanceMap: new Map(),
      accountUSDxBalanceMap: new Map(),
      accountxETHBalanceMap: new Map(),
      accountDFSupplyAmountMap: new Map(),
      accountxETHSupplyAmountMap: new Map(),
      accountSumETHSuppliesMap: new Map(),
      accountSumETHBorrowMap: new Map(),
      accountBorrowUSDxBalanceMap: new Map(),
      dataSourceInfo: []
    };
    this.web3 = window.web3;
  }

  getAllAccounts = () => {
    MoneyMarket().getAllAccounts(
      (err, res) => {
        this.setState({ accounts: res })
      }
    )
  }

  compoundAccountInfo = () => {
    this.state.accounts.forEach((address, index) => {
      this.getAccountLiquidityByAddress(address, index);
      // this.getAccountDFBalanceByAddress(address, index);
      this.getAccountUSDxBalanceByAddress(address, index);
      this.getAccountxETHBalanceByAddress(address, index);
      this.getCurrentSupplyDFAmountByAddress(address, index);
      this.getCurrentSupplyxETHAmountByAddress(address, index);
      this.calculateAccountValuesByAddress(address, index);
      this.getBorrowUSDxBalanceByAddress(address, index);
    });
    this.accountInfoMapTimer = setInterval(() => {
      if (this.state.accountLiquidityMap.size === this.state.accounts.length) {
        let dataInfoValStr = '';
        this.state.accounts.forEach((address, index) => {
          dataInfoValStr +=
            '{"address":"' + address + '","liquidity":"' + this.state.accountLiquidityMap.get(address) + '",' +
            // '"DF":"' + this.state.accountDFBalanceMap.get(address) + '",' + 
            '"USDx":"' + this.state.accountUSDxBalanceMap.get(address) + '",' +
            '"xETH":"' + this.state.accountxETHBalanceMap.get(address) + '",' +
            '"supplyDFAmount":"' + this.state.accountDFSupplyAmountMap.get(address) + '",' +
            '"supplyxETHAmount":"' + this.state.accountxETHSupplyAmountMap.get(address) + '",' +
            '"sumETHOfSupplies":"' + this.state.accountSumETHSuppliesMap.get(address) + '",' +
            '"sumETHOfBorrow":"' + this.state.accountSumETHBorrowMap.get(address) + '",' +
            '"borrowUSDxBalance":"' + this.state.accountBorrowUSDxBalanceMap.get(address) + '"},';
        });
        dataInfoValStr = "[" + dataInfoValStr.substring(0, dataInfoValStr.length - 1) + "]";
        this.setState({ dataSourceInfo: JSON.parse(dataInfoValStr) });
        clearInterval(this.accountInfoMapTimer);
      }
    }, 3000);
  }

  getAccountLiquidityByAddress = (address, index) => {
    MoneyMarket().getAccountLiquidity(address,
      (err, res) => {
        let liquidity = this.props.toFormatShowNumber(this.web3.fromWei(res.toNumber(), "ether"));
        this.state.accountLiquidityMap.set(address, liquidity);
      }
    );
    if (index === this.state.accounts.length - 1) {
      clearInterval(this.accountInfoTimer);
    }
  }

  // getAccountDFBalanceByAddress = (address, index) => {
  //   DF().balanceOf(address, 
  //     (err,res) => {
  //       let dfBalance = this.props.toFormatShowNumber(this.web3.fromWei(res.toNumber(), "ether"));
  //       this.state.accountDFBalanceMap.set(address, dfBalance);
  //     }
  //   );
  // }

  getAccountUSDxBalanceByAddress = (address, index) => {
    USDX().balanceOf(address,
      (err, res) => {
        let usdxBalance = this.props.toFormatShowNumber(this.web3.fromWei(res.toNumber(), "ether"));
        this.state.accountUSDxBalanceMap.set(address, usdxBalance);
      }
    );
  }

  getAccountxETHBalanceByAddress = (address, index) => {
    xETH().balanceOf(address,
      (err, res) => {
        let xethBalance = this.props.toFormatShowNumber(this.web3.fromWei(res.toNumber(), "ether"));
        this.state.accountxETHBalanceMap.set(address, xethBalance);
      }
    );
  }

  getCurrentSupplyDFAmountByAddress = (address, index) => {
    let asset = Network[this.state.networkName]['DF'];
    MoneyMarket().getSupplyBalance(address,
      asset,
      (err, res) => {
        if (res !== undefined) {
          let supplyDFAmount = this.props.toFormatShowNumber(this.web3.fromWei(res.toNumber(), "ether"));
          this.state.accountDFSupplyAmountMap.set(address, supplyDFAmount);
        }
      }
    );
  }

  getCurrentSupplyxETHAmountByAddress = (address, index) => {
    let asset = Network[this.state.networkName]['xETH'];
    MoneyMarket().getSupplyBalance(address,
      asset,
      (err, res) => {
        if (res !== undefined) {
          let supplyxETHAmount = this.props.toFormatShowNumber(this.web3.fromWei(res.toNumber(), "ether"));
          this.state.accountxETHSupplyAmountMap.set(address, supplyxETHAmount);
        }
      }
    );
  }

  calculateAccountValuesByAddress = (address, index) => {
    MoneyMarket().calculateAccountValues(address,
      (err, res) => {
        let sumETHofSupplies = this.props.toFormatShowNumber(this.web3.fromWei(this.web3.fromWei(res[1].toNumber(), "ether")), "ether");
        let sumETHofBorrow = this.props.toFormatShowNumber(this.web3.fromWei(this.web3.fromWei(res[2].toNumber(), "ether"), "ether"));
        this.state.accountSumETHSuppliesMap.set(address, sumETHofSupplies);
        this.state.accountSumETHBorrowMap.set(address, sumETHofBorrow);
      }
    );
  }

  getBorrowUSDxBalanceByAddress = (address, index) => {
    let asset = Network[this.state.networkName][this.state.borrowType];
    MoneyMarket().getBorrowBalance(address, asset, (err, res) => {
      let borrowUSDxBalance = this.props.toFormatShowNumber(this.web3.fromWei(res.toNumber(), "ether"));
      this.state.accountBorrowUSDxBalanceMap.set(address, borrowUSDxBalance);
    });
  };


  componentDidMount() {
    this.getAllAccounts();
    this.accountInfoTimer = setInterval(() => {
      if (this.state.accounts.length !== 0) {
        this.compoundAccountInfo();
      }
    }, 3000);
  }

  componentWillUnmount() {
    clearInterval(this.accountInfoTimer);
    clearInterval(this.accountInfoMapTimer);
  }

  render() {
    const addressData = [];
    this.state.accounts.forEach((item, index) => {
      addressData.push(<li>{item}</li>)
    });


    const columns = [
      {
        title: 'Address',
        dataIndex: 'address',
        width: 100,
        fixed: 'left'
      },
      {
        title: 'Liquidity',
        dataIndex: 'liquidity',
        width: 150
      },
      {
        title: 'DF Account Balance',
        dataIndex: 'DF',
        width: 200
      },
      {
        title: 'DF Amount Balance(Supply)',
        dataIndex: 'supplyDFAmount',
        width: 270
      },
      {
        title: 'xETH Account Balance',
        dataIndex: 'xETH',
        width: 220
      },
      {
        title: 'xETH Amount Balance(Supply)',
        dataIndex: 'supplyxETHAmount',
        width: 270
      },
      {
        title: 'USDx Account Balance',
        dataIndex: 'USDx',
        width: 220
      },
      {
        title: 'USDx Amount Balance(borrow)',
        dataIndex: 'borrowUSDxBalance',
        width: 280
      },
      {
        title: 'Supply Value (ETH)',
        dataIndex: 'sumETHOfSupplies',
        width: 190
      },
      {
        title: 'Borrow Value (ETH)',
        dataIndex: 'sumETHOfBorrow',
        width: 180
      },
    ];

    const {
      dataSourceInfo
    } = this.state;


    return (
      <div className="accountInfo">
        <Divider orientation="left">Accounts Info</Divider>
        <Table pagination={false} columns={columns} dataSource={dataSourceInfo}
          scroll={{ x: 2200 }} />
      </div>
    );
  }
}

export default AccountInfo;
