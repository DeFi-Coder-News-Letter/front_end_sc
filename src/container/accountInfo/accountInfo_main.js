import React, { Component } from 'react';
import InfoSection from '../../component/infoSection/infoSection';
import Network from '../../constant.json';
import MoneyMarket from './../../ABIs/MoneyMarket.js';
import { getPercentageFormat, toDoubleThousands, findNetwork } from '../../util.js';

import './accountInfo.scss';


class AccountInfo extends Component {
  constructor(props) {
    super(props)
    this.state = {}
    this.web3 = window.web3;
  }

  get_USDx_supply_borrow = () => {
    let usdxAddress = '';
    let NetworkName = findNetwork(window.web3.version.network);
    if (NetworkName === 'Main') {
      usdxAddress = Network.Main.USDx;
    } else if (NetworkName === 'Rinkeby') {
      usdxAddress = Network.Rinkeby.USDx;
    }
    MoneyMarket().markets.call(usdxAddress, (err, res) => {
      if (res !== undefined && res !== null) {
        // USDx_supply: res[3]
        // USDx_borrow: res[6]
        // USDx_supply_APR: res[4]
        // USDx_borrow_APR: res[7]
        this.setState({
          USDx_supply: this.web3.fromWei(res[3], "ether"),
          USDx_borrow: this.web3.fromWei(res[6], "ether"),
          USDx_supply_APR: getPercentageFormat(this.web3.fromWei(res[4].toNumber(), "ether") * 86400 * 365 / 15),
          USDx_borrow_APR: getPercentageFormat(this.web3.fromWei(res[7].toNumber(), "ether") * 86400 * 365 / 15)
        }, () => {
          this.setState({
            USDx_borrow_supply_rate: getPercentageFormat(this.state.USDx_borrow / this.state.USDx_supply)
          })
        });
      }
    })
  }


  componentDidMount = () => {
    if (window.web3) {
      window.web3.currentProvider.enable().then()
    }

    this.get_USDx_supply_borrow();

    this.timer_main = setInterval(() => {
      this.get_USDx_supply_borrow();
    }, 1000 * 15);

    if (this.web3.currentProvider.isMetaMask) {
      window.ethereum.on('accountsChanged', () => {
        this.get_USDx_supply_borrow();
      });
    }
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