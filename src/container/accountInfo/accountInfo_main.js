import React, { Component } from 'react';
import InfoSection from '../../component/infoSection/infoSection';
import Network from '../../constant.json';

import { getPercentageFormat, toDoubleThousands, findNetwork } from '../../util.js';

import './accountInfo.scss';


class AccountInfo extends Component {
  constructor(props) {
    super(props)
    this.state = {}
    this.web3 = window.web3;
  }





  componentWillUnmount = () => {
    clearInterval(this.timer_main);
  }

  render = () => {
    const accountInfo = [
      {
        title: 'USDx Supplied',
        amount: (typeof web3 === 'undefined' || this.web3.eth.accounts[0] === undefined || !this.props.login) ? '-' : '$' + toDoubleThousands(this.state.USDx_supply),
        page: 'main'
      },
      {
        title: 'USDx Borrowed',
        amount: (typeof web3 === 'undefined' || this.web3.eth.accounts[0] === undefined || !this.props.login) ? '-' : '$' + toDoubleThousands(this.state.USDx_borrow),
        page: 'main'
      },
      {
        title: 'Utilization Rate',
        amount: (typeof web3 === 'undefined' || this.web3.eth.accounts[0] === undefined || !this.props.login) ? '-' : toDoubleThousands(this.state.USDx_borrow_supply_rate) + '%',
        page: 'main'
      },
      {
        title: 'Collateralization ratio',
        amount: (typeof web3 === 'undefined' || this.web3.eth.accounts[0] === undefined || !this.props.login) ? '-' : '125.00%',
        page: 'main'
      },
      {
        title: 'USDx Supply APR',
        amount: (typeof web3 === 'undefined' || this.web3.eth.accounts[0] === undefined || !this.props.login) ? '-' : toDoubleThousands(this.state.USDx_supply_APR) + '%',
        page: 'main'
      },
      {
        title: 'USDx Borrow APR',
        amount: (typeof web3 === 'undefined' || this.web3.eth.accounts[0] === undefined || !this.props.login) ? '-' : toDoubleThousands(this.state.USDx_borrow_APR) + '%',
        page: 'main'
      }
    ];

    return (
      <div className={'main-info-board'}>
        <div className={'main-info-board-content'}>
          <InfoSection accountInfo={accountInfo} currentPage={'main'} />
        </div>
      </div>
    )
  }
}

export default AccountInfo;