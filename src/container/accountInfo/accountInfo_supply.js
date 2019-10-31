import React, { Component } from 'react';
import InfoSection from '../../component/infoSection/infoSection';
import Network from '../../constant.json';
import USDX from "./../../ABIs/USDX.js";
import MoneyMarket from './../../ABIs/MoneyMarket.js';

import { toFormatShowNumber, getPercentageFormat, toDoubleThousands, findNetwork, formatBigNumber } from '../../util.js';
import './accountInfo.scss';

class AccountInfo extends Component {
  constructor(props) {
    super(props)
    this.state = {
      borrowBalance: 0,
      borrowBalanceShow: 0,
      borrowInterestRate: 0,
      supplyInterestRate: 0,
      totalSupply: 0,
      totalBorrowInMoneyMarket: 0,
      totalBorrowInMoneyMarketUnformat: 0,
      totalSupplyUSDxInMoneyMarket: 0,
      totalSupplyWETHInMoneyMarket: 0,
      availableToBorrow: 0,
      collateralRatio: 0,
      collateralRatioShow: 0,
      usdxBalanceOf: 0,
      cash: 0,
      utilizationRate: 0,
      usdxAssetPrice: 0,
      WETHAssetPrice: 0,
      supplyWETHAmount: 0,
      originationFee: 0,
      tatol_Supplied: 0
    }
    this.web3 = window.web3;

    this.componentDidMount_temp();

    if (window.web3.currentProvider.isMetaMask) {
      window.ethereum.on('accountsChanged', () => {
        this.componentDidMount_temp();
      });
    }
  }


  // ****************** tatol_Supplied    ***************** totalBorrowInMoneyMarket
  getUtilizationRate = () => {
    if (USDX() === undefined) {
      return;
    }
    let mmAddress = '';
    let NetworkName = findNetwork(window.web3.version.network);
    if (NetworkName === 'Main') {
      mmAddress = Network.Main.MoneyMarket;
    } else if (NetworkName === 'Rinkeby') {
      mmAddress = Network.Rinkeby.MoneyMarket;
    }
    // get cash_balance
    USDX().balanceOf(
      mmAddress,
      (err, res) => {
        let cash = 0;
        if (res !== undefined && res !== null) {
          cash = res.toNumber();
          this.setState({ cash: toFormatShowNumber(this.web3.fromWei(cash, "ether")) }, () => {
            // setState 成功后回调函数 
            // console.log('1111111111 ----- this.state.cash: ', this.state.cash);
            if (MoneyMarket() === undefined) {
              return;
            }
            let usdxAddress = '';
            let NetworkName = findNetwork(window.web3.version.network);
            if (NetworkName === 'Main') {
              usdxAddress = Network.Main.USDx;
            } else if (NetworkName === 'Rinkeby') {
              usdxAddress = Network.Rinkeby.USDx;
            }
            MoneyMarket().markets(
              usdxAddress,
              (err, res) => {
                if (res !== undefined && res !== null) {
                  this.setState({
                    totalBorrowInMoneyMarket: this.web3.fromWei(res[6], "ether"),
                    totalBorrowInMoneyMarketUnformat: toFormatShowNumber(this.web3.fromWei(res[6].toNumber(), "ether"))
                  }, () => {
                    // setState 成功后回调函数 
                    // console.log('2222222222 -----this.state.totalBorrowInMoneyMarket： ', this.state.totalBorrowInMoneyMarketUnformat);
                    this.setState({ tatol_Supplied: this.state.totalBorrowInMoneyMarket * 1 + Number(this.state.cash) }, () => {
                      // console.log('33333333333333 -----this.state.totalBorrowInMoneyMarket： ', this.state.tatol_Supplied);
                      let UR = 0;
                      if (Number(this.state.totalBorrowInMoneyMarketUnformat) + Number(this.state.cash) !== 0) {
                        UR = Number(this.state.totalBorrowInMoneyMarketUnformat) / (Number(this.state.totalBorrowInMoneyMarketUnformat) + Number(this.state.cash))
                      }
                      this.setState({ utilizationRate: getPercentageFormat(UR) });
                    });
                  });
                }
              })
          })
        }
      });
  }



  // ***************** borrowInterestRate
  getBorrowInterestRate = () => {
    if (MoneyMarket() === undefined) {
      return;
    }
    let usdxAddress = '';
    let NetworkName = findNetwork(window.web3.version.network);
    if (NetworkName === 'Main') {
      usdxAddress = Network.Main.USDx;
    } else if (NetworkName === 'Rinkeby') {
      usdxAddress = Network.Rinkeby.USDx;
    }
    MoneyMarket().markets.call(usdxAddress,
      (err, res) => {
        if (res !== null && res !== undefined) {
          this.setState({ borrowInterestRate: getPercentageFormat(this.web3.fromWei(res[7].toNumber(), "ether") * 86400 * 365 / 15) })
        }
      }
    );
  }


  // **************** supplyInterestRate
  getSupplyInterestRate = () => {
    if (MoneyMarket() === undefined) {
      return;
    }
    let usdxAddress = '';
    let NetworkName = findNetwork(window.web3.version.network);
    if (NetworkName === 'Main') {
      usdxAddress = Network.Main.USDx;
    } else if (NetworkName === 'Rinkeby') {
      usdxAddress = Network.Rinkeby.USDx;
    }
    MoneyMarket().markets.call(usdxAddress,
      (err, res) => {
        if (res !== undefined && res !== null) {
          this.setState({ supplyInterestRate: getPercentageFormat(this.web3.fromWei(res[4].toNumber(), "ether") * 86400 * 365 / 15) })
        }
      }
    );
  }


  componentDidMount_temp = () => {
    if (window.web3) {
      window.web3.currentProvider.enable().then(
        res => {
          console.log(this.web3.eth.accounts[0]);
        }
      )
    }
    setTimeout(() => {
      this.getBorrowInterestRate();
      this.getSupplyInterestRate();
      this.getUtilizationRate();
    }, 700);
    this.getAddressIntervalBorrow = setInterval(() => {
      if (true) {
        this.getBorrowInterestRate();
        this.getSupplyInterestRate();
        this.getUtilizationRate();
      }
    }, 1000 * 15);
  }


  render = () => {
    const accountInfo = [
      {
        title: 'Total Supplied',
        amount: (typeof web3 === 'undefined' || this.web3.eth.accounts[0] === undefined || !this.props.login) ? '-' : '$' + toDoubleThousands(this.state.tatol_Supplied),
        page: 'lend'
      },
      {
        title: 'Total Borrowed',
        amount: (typeof web3 === 'undefined' || this.web3.eth.accounts[0] === undefined || !this.props.login) ? '-' : '$' + toDoubleThousands(this.state.totalBorrowInMoneyMarket * 1),
        page: 'lend'
      },

      {
        title: 'Supply APR',
        amount: (typeof web3 === 'undefined' || this.web3.eth.accounts[0] === undefined || !this.props.login) ? '-' : toDoubleThousands(this.state.supplyInterestRate) + '%',
        page: 'lend'
      },
      {
        title: 'Borrow APR',
        amount: (typeof web3 === 'undefined' || this.web3.eth.accounts[0] === undefined || !this.props.login) ? '-' : toDoubleThousands(this.state.borrowInterestRate) + '%',
        page: 'lend'
      }
    ];
    return (
      <div className={'account-info-board'}>
        <div className={'info-board-title'}>
          {'USDx Market'}
        </div>
        <div className={'info-board-content'}>
          <InfoSection accountInfo={accountInfo} currentPage={'lend'} />
        </div>
      </div>
    )
  }
}

export default AccountInfo;