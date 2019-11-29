import React, { Component } from 'react';
import InfoSection from '../../component/infoSection/infoSection';
import Network from '../../constant.json';
import USDX from "./../../ABIs/USDX.js";

import { toFormatShowNumber, getPercentageFormat, toDoubleThousands, findNetwork, formatBigNumber } from '../../util.js';
import './accountInfo.scss';


// add i18n.
import { IntlProvider, FormattedMessage } from 'react-intl';
import en_US from '../../language/en_US.js';
import zh_CN from '../../language/zh_CN';

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

    if (window.web3) {
      window.web3.currentProvider.enable().then(
        res => {
          console.log(this.web3.eth.accounts[0]);
          // this.componentDidMount_temp();
          window.web3.version.getNetwork((e, r) => {
            if (r) {
              this.setState({
                NetworkName: r
              }, () => {
                this.componentDidMount_temp();
              })
            }
          })
        }
      )
    }

    if (window.web3.currentProvider.isMetaMask) {
      window.ethereum.on('accountsChanged', () => {
        this.componentDidMount_temp();
      });
    }
  }





  componentDidMount_temp = () => {

    setTimeout(() => {
      this.getWETHAssetPrice();
      this.getBorrowBalance();
      this.getBorrowInterestRate();
      this.calculateAccountValuesByAddress();
    }, 2000);
    this.getAddressIntervalBorrow = setInterval(() => {
      if (true) {
        this.getWETHAssetPrice();
        this.getBorrowBalance();
        this.getBorrowInterestRate();
        this.calculateAccountValuesByAddress();
      }
    }, 1000 * 15);
  }


  render = () => {
    const accountInfo = [
      {
        title: 'Supplied Balance',
        amount: (typeof web3 === 'undefined' || this.web3.eth.accounts[0] === undefined || !this.props.login) ? '-' : '$' + toDoubleThousands(this.state.totalSupply),
        page: 'borrow'
      },
      {
        title: 'Borrowed Balance',
        amount: (typeof web3 === 'undefined' || this.web3.eth.accounts[0] === undefined || !this.props.login) ? '-' : '$' + toDoubleThousands(this.state.borrowBalanceShow),
        page: 'borrow'
      },
      {
        title: 'Available to Borrow',
        amount: (typeof web3 === 'undefined' || this.web3.eth.accounts[0] === undefined || !this.props.login) ? '-' : '$' + toDoubleThousands(this.state.availableToBorrow),
        page: 'borrow'
      },
      {
        title: 'Borrow APR',
        amount: (typeof web3 === 'undefined' || this.web3.eth.accounts[0] === undefined || !this.props.login) ? '-' : toDoubleThousands(this.state.borrowInterestRate) + '%',
        page: 'borrow'
      },
      {
        title: 'Collateralization ratio',
        amount: (typeof web3 === 'undefined' || this.web3.eth.accounts[0] === undefined || !this.props.login) ? '-' : toDoubleThousands(this.state.collateralRatioShow) + '%',
        page: 'borrow'
      }
    ];
    return (
      <IntlProvider locale={'en'} messages={navigator.language === 'zh-CN' ? zh_CN : en_US} >
        <div className={'account-info-board'}>
          <div className={'info-board-title'}>
            <FormattedMessage id='Account_Portfolio' />
          </div>
          <div className={'info-board-content'}>
            <InfoSection accountInfo={accountInfo} currentPage={'borrow'} />
          </div>
        </div>
      </IntlProvider>
    )
  }
}

export default AccountInfo;