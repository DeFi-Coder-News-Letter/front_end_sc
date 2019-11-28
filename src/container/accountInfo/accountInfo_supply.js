import React, { Component } from 'react';
import InfoSection from '../../component/infoSection/infoSection';
import Network from '../../constant.json';
import MoneyMarket from './../../ABIs/MoneyMarket.js';
import { getPercentageFormat, toDoubleThousands, findNetwork } from '../../util.js';
import './accountInfo.scss';

// add i18n.
import { IntlProvider, FormattedMessage } from 'react-intl';
import en_US from '../../language/en_US.js';
import zh_CN from '../../language/zh_CN';

class AccountInfo extends Component {
  constructor(props) {
    super(props)
    this.state = {}
    this.web3 = window.web3;

  }

  get_USDx_supply_borrow = () => {
    if (typeof web3 === 'undefined' || this.web3.eth.accounts[0] === undefined || MoneyMarket() === undefined) {
      return;
    }
    let usdxAddress = '';
    let NetworkName = findNetwork(this.state.NetworkName);
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
        });
      }
    })
  }


  componentDidMount = () => {
    // this.componentDidMount_temp();


    if (window.web3) {
      window.web3.currentProvider.enable().then(
        res => {
          window.web3.version.getNetwork((e, r) => {
            if (r) {
              this.setState({
                NetworkName: r
              }, () => {
                // this.componentDidMount_temp();
                this.get_USDx_supply_borrow();
              })
            }
          })
        }
      )
    }

    // this.get_USDx_supply_borrow();

    this.timer_supply = setInterval(() => {
      this.get_USDx_supply_borrow();
    }, 1000 * 15);

    if (window.web3.currentProvider.isMetaMask) {
      window.ethereum.on('accountsChanged', () => {
        this.get_USDx_supply_borrow();
      });
    }
  }

  componentWillUnmount = () => {
    clearInterval(this.timer_supply);
  }


  render = () => {
    const accountInfo = [
      {
        title: 'Total Supplied',
        amount: (typeof web3 === 'undefined' || this.web3.eth.accounts[0] === undefined || !this.props.login) ? '-' : '$' + toDoubleThousands(this.state.USDx_supply),
        page: 'lend'
      },
      {
        title: 'Total Borrowed',
        amount: (typeof web3 === 'undefined' || this.web3.eth.accounts[0] === undefined || !this.props.login) ? '-' : '$' + toDoubleThousands(this.state.USDx_borrow),
        page: 'lend'
      },

      {
        title: 'Supply APR',
        amount: (typeof web3 === 'undefined' || this.web3.eth.accounts[0] === undefined || !this.props.login) ? '-' : toDoubleThousands(this.state.USDx_supply_APR) + '%',
        page: 'lend'
      },
      {
        title: 'Borrow APR',
        amount: (typeof web3 === 'undefined' || this.web3.eth.accounts[0] === undefined || !this.props.login) ? '-' : toDoubleThousands(this.state.USDx_borrow_APR) + '%',
        page: 'lend'
      }
    ];
    return (
      <IntlProvider locale={'en'} messages={navigator.language === 'zh-CN' ? zh_CN : en_US} >
        <div className={'account-info-board'}>
          <div className={'info-board-title'}>
            <FormattedMessage id='USDx_Market' />
          </div>
          <div className={'info-board-content'}>
            <InfoSection accountInfo={accountInfo} currentPage={'lend'} />
          </div>
        </div>
      </IntlProvider>
    )
  }
}

export default AccountInfo;