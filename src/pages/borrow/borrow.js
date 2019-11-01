import React, { Component } from 'react';
import SupplyInput from '../../container/supplyInput/supplyInput_borrow';
import BorrowInput from '../../container/borrowInput/borrowInput';
import USDX from '../../ABIs/USDX';
import WETH from '../../ABIs/WETH';
import MoneyMarket from "./../../ABIs/MoneyMarket.js";
import Header from '../../component/header/header';
import RecordBoard from '../../container/recordBoard/recordBoard';
import { withMarketInfo } from '../../HOC/withMarketInfo';
import { findNetwork, getLoginStatusKey } from '../../util.js';
import AccountInfo from '../../container/accountInfo/accountInfo_borrow';
import { Link } from "react-router-dom";
import Network from '../../constant.json';
import MediaQuery from 'react-responsive';
import './borrow.scss';

// add i18n.
import { IntlProvider, FormattedMessage } from 'react-intl';
import en_US from '../../language/en_US.js';
import zh_CN from '../../language/zh_CN';

const WithMarketInfoEnhanced = withMarketInfo(Header);

class Borrow extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // dfAssetPrice: null,
      calcWETHPrice: 0,
      WETHAssetPrice: 0,
      hasLendUSDx: false,
      wethRecentTransactions: [],
      loadingPhase: true,
      switchAccountLoading: false,
      borrowgroup: false,
      hasLendUSDxAmount: 0,
      isLogIn: false,
      currentUser: window.web3 !== undefined ? window.web3.eth.accounts[0] : null,
      isApproved_WETH: 0,
      isApproved_USDx: 0,
      not_approve_atfirst_WETH: 0,
      not_approve_atfirst_USDX: 0
    };
    this.web3 = window.web3;

    window.web3.currentProvider.enable().then(
      res => {
        this.setState({ isLogIn: true }, () => {
          this.componentDidMount_temp();
        });
      }
    )

    if (window.web3.currentProvider.isMetaMask) {
      window.ethereum.on('accountsChanged', () => {
        this.componentDidMount_temp();
      });
    }

  }


  //weth价格修改
  getCalcWETHPrice = () => {
    if (typeof web3 === 'undefined' || MoneyMarket() === undefined) {
      return;
    }
    let wethAddress = '';
    let NetworkName = findNetwork(window.web3.version.network);
    if (NetworkName === 'Main') {
      wethAddress = Network.Main.WETH;
    } else if (NetworkName === 'Rinkeby') {
      wethAddress = Network.Rinkeby.WETH;
    }
    MoneyMarket().assetPrices(wethAddress, (err, res) => {
      if (res !== undefined && res !== null) {
        if (this.state.calcWETHPrice !== this.web3.fromWei(res.toNumber(), "ether")) {
          this.setState({
            calcWETHPrice: this.web3.fromWei(res.toNumber(), "ether")
          });
        }
      }
    });
  }

  getWETHAssetPrice = () => {
    if (typeof web3 === 'undefined' || MoneyMarket() === undefined) {
      return;
    }
    //weth价格修改
    let usdxAddress = '';
    let NetworkName = findNetwork(window.web3.version.network);
    if (NetworkName === 'Main') {
      usdxAddress = Network.Main.USDx;
    } else if (NetworkName === 'Rinkeby') {
      usdxAddress = Network.Rinkeby.USDx;
    }
    MoneyMarket().assetPrices(usdxAddress, (err, res) => {
      if (res !== undefined && res !== null && this.state.calcWETHPrice !== 0) {
        if (this.state.WETHAssetPrice !== this.state.calcWETHPrice / this.web3.fromWei(res.toNumber(), "ether")) {
          this.setState({
            WETHAssetPrice: this.state.calcWETHPrice / this.web3.fromWei(res.toNumber(), "ether")
          });
        }
      }
    });
  }

  getCurrentSupplyAmount = () => {
    if (typeof web3 === 'undefined' || window.web3.eth.accounts[0] === undefined || MoneyMarket() === undefined) {
      return;
    }
    let myAddress = window.web3.eth.accounts[0];
    let usdxAddress = '';
    let NetworkName = findNetwork(window.web3.version.network);
    if (NetworkName === 'Main') {
      usdxAddress = Network.Main.USDx;
    } else if (NetworkName === 'Rinkeby') {
      usdxAddress = Network.Rinkeby.USDx;
    }
    MoneyMarket().getSupplyBalance(myAddress, usdxAddress, (err, res) => {
      if (res === undefined || res === null || this.state.hasLendUSDxAmount === window.web3.fromWei(res.toNumber(), "ether")) {
        return;
      }
      this.setState({ hasLendUSDxAmount: window.web3.fromWei(res.toNumber(), "ether") });
      if (window.web3.fromWei(res.toNumber(), "ether") > 0) {
        this.setState({ hasLendUSDx: true });
      } else if (this.state.hasLendUSDx !== false) {
        this.setState({ hasLendUSDx: false });
      }
    }
    );
  }

  setLoginStatus = () => {
    const { isSMView } = this.props
    if (typeof web3 === 'undefined' || this.web3.eth.accounts[0] === undefined) {
      return;
    }
    var storage = null;
    var results = null;
    var key = getLoginStatusKey(this.web3.eth.accounts[0]);
    if (window.localStorage) {
      storage = window.localStorage;
      results = JSON.parse(`${storage.getItem(key)}`);
    }
    if (this.state.isLogIn !== true && isSMView) {
      this.setState({ isLogIn: true });
    }
    if (results === null) {
      return;
    }
    results = results.map(item => {
      if (item.account === this.web3.eth.accounts[0] && this.state.isLogIn !== item.isLogin && !isSMView) {
        this.setState({ isLogIn: item.isLogin });
      }
      return item.id;
    })
  }

  componentWillMount() { }

  componentDidMount_temp = () => {
    setTimeout(() => {
      this.getCalcWETHPrice();
      // 检查是否 approve
      this.get_Allowance();
      this.getWETHAssetPrice();
      this.getCurrentSupplyAmount();
      this.setState({ loadingPhase: false });
    }, 700);

    this.accountInterval = setInterval(() => {
      if (typeof web3 !== 'undefined' && window.web3.eth.accounts[0] !== undefined) {
        // this.state.isApproved_WETH
        this.get_Allowance();
        // console.log('borrow.js---this.state.isApproved_WETH: ', this.state.isApproved_WETH)
        this.getCalcWETHPrice();
        this.getWETHAssetPrice();
        // Swtich account
        // if (window.web3.eth.accounts[0] !== this.state.currentUser) {
        //   this.setState({ switchAccountLoading: true, currentUser: window.web3.eth.accounts[0] });
        //   setTimeout(() => this.setState({ switchAccountLoading: false }), 1200);
        // }
        this.getCurrentSupplyAmount();
      }

      this.setLoginStatus();
    }, 1000 * 15);

  }

  componentWillUnmount() {
    clearInterval(this.accountInterval);
    // clearInterval(this.check_Login_State);
  }



  // 检测是否 approved USDx && WETH
  get_Allowance = () => {
    if (typeof web3 === 'undefined' || this.web3.eth.accounts[0] === undefined) {
      // console.log('will get Allowance ... kazai zhe li le')
      return;
    }
    let mmAddress = '';
    let NetworkName = findNetwork(window.web3.version.network);
    mmAddress = Network[NetworkName].MoneyMarket;
    WETH().allowance(this.web3.eth.accounts[0], mmAddress, (err, res) => {
      if (res !== undefined) {
        if (Number(res) > 0) {
          // alert('isApproved_WETH >>>>>>>>>>>>>0')
          this.setState({ isApproved_WETH: 1, not_approve_atfirst_WETH: 0 });
        } else if (Number(res) === 0) {
          // alert('not_approve_atfirst_WETH ============0')
          this.setState({ not_approve_atfirst_WETH: 1, isApproved_WETH: 0 });
        }
      }
    });
    USDX().allowance(this.web3.eth.accounts[0], mmAddress, (err, res) => {
      if (res !== undefined) {
        if (Number(res) > 0) {
          this.setState({ isApproved_USDx: 1, not_approve_atfirst_USDX: 0 });
        } else if (Number(res) === 0) {
          this.setState({ not_approve_atfirst_USDX: 1, isApproved_USDx: 0 });
        }
      }
    });
  }



  render() {
    const WETHInstance = WETH();
    const usdxInstance = USDX();
    let currentAccount = null;

    if (typeof web3 !== 'undefined') {
      currentAccount = window.web3.eth.accounts[0];
      var NetworkName = findNetwork(window.web3.version.network);
    }
    // setTimeout(() => this.setState({ switchAccountLoading: false }), 1200);
    const wethProps = {
      // ethCoin: false,
      wethCoin: true,
      // dfCoin : false,
      usdxCoin: false,
      coin: WETHInstance,
      account: currentAccount,
      // moneyMarket: Network.Rinkeby.MoneyMarket,
      supplyType: 'WETH',
      withdrawType: 'WETH',
      approveButtonInfo: 'ENABLE WETH',
      supplyButtonInfo: 'SUPPLY',
      withdrawButtonInfo: 'WITHDRAW',
      unwrapButtonInfo: 'UNWRAP',
      wrapButtonInfo: 'WRAP',
      balanceType: 'WETH',
      balanceAmount: "",
      // supplyAssetPrice: this.state.WETHAssetPrice,
      tabLeftName: 'SUPPLY',
      tabRightName: 'WITHDRAW',
      page: 'borrow',
      login: this.state.isLogIn
    }

    const borrowProps = {
      coin: usdxInstance,
      account: currentAccount,
      // moneyMarket: Network.Rinkeby.MoneyMarket,
      // borrowType:  Network.Rinkeby.USDx,
      // repayType: Network.Rinkeby.USDx,
      approveButtonInfo: 'ENABLE USDx',
      borrowButtonInfo: 'BORROW',
      repayButtonInfo: 'REPAY',
      balanceType: 'USDx',
      balanceAmount: '',
      hasLendUSDx: this.state.hasLendUSDx,
      page: 'borrow',
      login: this.state.isLogIn
    }

    return (
      <IntlProvider locale={'en'} messages={navigator.language === 'zh-CN' ? zh_CN : en_US} >
        <MediaQuery maxWidth={768}>
          {(match) =>
            <div className={'borrow-page ' + (match ? 'CM XS ' : 'CM LG ') + (NetworkName === 'Main' ? 'without-banner' : 'with-banner')}>

              <WithMarketInfoEnhanced networkName={findNetwork(window.web3.version.network)} account={window.web3.eth.accounts[0]} login={window.web3.eth.accounts[0]} />

              <div className='redirect-button'>
                <div className='go-back-button'>
                  <Link to={'/'}>
                    <img src={'images/icon_home@2x.png'} alt="HOME" />
                    <spam>
                      <FormattedMessage id='Home' />
                    </spam>
                  </Link>
                </div>
                <div className='go-to-lend'>
                  <Link to={'/supply'} >
                    <span>
                      <FormattedMessage id='Supply' />
                    </span>
                    <img src={'images/icon_lend@2x.png'} alt="SUPPLY" />
                  </Link>
                </div>
              </div>

              <AccountInfo networkName={NetworkName} currentPage={'borrow'} account={currentAccount} login={window.web3.eth.accounts[0] ? true : false} />

              {match && <label className='input-unit-switch'>
                <input type='checkbox' checked={this.state.borrowgroup} onChange={() => this.setState({ borrowgroup: !this.state.borrowgroup })} />
                <span className="slider round"></span>
                <span className="supply">
                  <FormattedMessage id='Supply' />
                </span>
                <span className="borrow">
                  <FormattedMessage id='Borrow' />
                </span>
              </label>
              }

              <div className='borrow-page-content-wrapper'>
                {(!this.state.borrowgroup || !match) && <div className='supply-group'>
                  <div className='supply-title'>
                    <span className='title-font'>
                      <FormattedMessage id='SUPPLY' />
                    </span>
                  </div>
                  <div className='supply-content' style={{ display: (this.state.isApproved_WETH === 1) || (this.state.not_approve_atfirst_WETH === 1) ? 'block' : 'none' }}>
                    <SupplyInput {...wethProps} father_approve_WETH={this.state.isApproved_WETH} />
                    <RecordBoard coinType={'WETH'} account={currentAccount} page={'borrow'} />
                  </div>
                </div>
                }

                {(this.state.borrowgroup || !match) && <div className='borrow-group'>
                  <div className='borrow-title-borrow'>
                    <span className='title-font'>
                      <FormattedMessage id='BORROW' />
                    </span>
                  </div>
                  <div className='borrow-content' style={{ display: (this.state.isApproved_USDx == 1) || (this.state.not_approve_atfirst_USDX == 1) ? 'block' : 'none' }}>
                    <BorrowInput networkName={NetworkName} {...borrowProps} father_approve_USDx={this.state.isApproved_USDx} />
                    {this.state.isLogIn
                      ?
                      <RecordBoard coinType={'USDx'} account={currentAccount} page={'borrow'} />
                      :
                      null
                    }
                  </div>
                </div>
                }
              </div>
            </div>
          }
        </MediaQuery>
      </IntlProvider>
    );
  }
}

export default Borrow;