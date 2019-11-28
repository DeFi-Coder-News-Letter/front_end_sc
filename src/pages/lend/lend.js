import React, { Component } from "react";
import SupplyContent from "../../container/supplyInput/SupplyContent";
import USDX from "../../ABIs/USDX";
import MoneyMarket from "../../ABIs/MoneyMarket.js";
import Header from '../../component/header/header';
import { withMarketInfo } from '../../HOC/withMarketInfo';
import { toFormatShowNumber, findNetwork, getLoginStatusKey } from '../../util.js'
import RecordBoard from '../../container/recordBoard/recordBoard';
import AccountInfo from '../../container/accountInfo/accountInfo_supply';
import { Link } from "react-router-dom";
import Network from "../../constant.json";
import MediaQuery from 'react-responsive';
import "./lend.scss";


// add i18n.
import { IntlProvider, FormattedMessage } from 'react-intl';
import en_US from '../../language/en_US.js';
import zh_CN from '../../language/zh_CN';


const WithMarketInfoEnhanced = withMarketInfo(Header);

class Lend extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // supplyAssetPrice: 0,
      loadingPhase: true,
      switchAccountLoading: false,
      hasBorrowedUSDx: false,
      isLogIn: false,
      currentUser: window.web3 !== undefined ? window.web3.eth.accounts[0] : null,
      isApproved_USDx: 0,
      not_approve_atfirst_USDX: 0
    };
    this.web3 = window.web3;

    // window.web3.currentProvider.enable().then(
    //   res => {
    //     this.setState({ isLogIn: true }, () => {
    //       console.log(this.state.isLogIn);
    //       this.componentDidMount_temp();
    //     });
    //   }
    // )

    window.web3.currentProvider.enable().then(
      res => {
        this.setState({ isLogIn: true }, () => {
          window.web3.version.getNetwork((e, r) => {
            if (r) {
              this.setState({
                NetworkName: r
              }, () => {
                this.componentDidMount_temp();
              })
            }
          })
        });
      }
    )

    if (window.web3.currentProvider.isMetaMask) {
      window.ethereum.on('accountsChanged', () => {
        this.componentDidMount_temp();
      });
    }

  }


  // *********** has_Borrowed_USDx
  getBorrowBalance = () => {
    if (typeof web3 === 'undefined' || window.web3.eth.accounts[0] === undefined || MoneyMarket() === undefined) {
      return;
    }
    let myAddress = window.web3.eth.accounts[0];
    let usdxAddress = '';
    let NetworkName = findNetwork(this.state.NetworkName);
    if (NetworkName === 'Main') {
      usdxAddress = Network.Main.USDx;
    } else if (NetworkName === 'Rinkeby') {
      usdxAddress = Network.Rinkeby.USDx;
    }
    MoneyMarket().getBorrowBalance(myAddress, usdxAddress, (err, res) => {
      if (res !== undefined && res !== null && Number(window.web3.fromWei(res.toNumber(), "ether")) > 0) {
        this.setState({ hasBorrowedUSDx: true });
      } else {
        this.setState({ hasBorrowedUSDx: false });
      }
    }
    );
  }

  // setLoginStatus = () => {
  //   const { isSMView } = this.props;
  //   if (typeof web3 === 'undefined' || this.web3.eth.accounts[0] === undefined) {
  //     return;
  //   }
  //   var storage = null;
  //   var results = null;
  //   var key = getLoginStatusKey(this.web3.eth.accounts[0]);
  //   if (window.localStorage) {
  //     storage = window.localStorage;
  //     results = JSON.parse(`${storage.getItem(key)}`);
  //   }
  //   if (this.state.isLogIn !== true && isSMView) {
  //     this.setState({ isLogIn: true });
  //   }
  //   if (results === null) {
  //     return;
  //   }
  //   results = results.map(item => {
  //     if (item.account === this.web3.eth.accounts[0] && this.state.isLogIn !== item.isLogin && !isSMView) {
  //       this.setState({ isLogIn: item.isLogin });
  //     }
  //     return item.id;
  //   })
  // }




  // 检测是否 approved USDx
  get_Allowance = () => {
    if (typeof web3 === 'undefined' || this.web3.eth.accounts[0] === undefined) {
      // console.log('11111111111  在这儿卡住了');
      return;
    }
    let mmAddress = '';
    let NetworkName = findNetwork(this.state.NetworkName);
    mmAddress = Network[NetworkName].MoneyMarket;
    USDX().allowance(this.web3.eth.accounts[0], mmAddress, (err, res) => {
      if (res !== undefined && res !== null) {
        if (Number(res) > 0) {
          this.setState({
            isApproved_USDx: 1,
            not_approve_atfirst_USDX: 0
          }, () => {
            // console.log('is_Approved >>>>>>>>>>>>> ')
          });
        } else if (Number(res) == 0) {
          this.setState({
            not_approve_atfirst_USDX: 1,
            isApproved_USDx: 0
          }, () => {
            // console.log('not_Approved >>>>>>>>>>>>> ')
          });
        }
      }
    });
  }

  componentDidMount_temp = () => {
    setTimeout(() => {
      this.get_Allowance();
      this.getBorrowBalance();
    }, 2000);

    this.accountInterval = setInterval(() => {
      this.get_Allowance();
      this.getBorrowBalance();
    }, 1000 * 15);


    return false;

    setTimeout(() => {
      this.get_Allowance();
      this.getAssetPrice();
      this.getBorrowBalance();
      this.setState({ loadingPhase: false });
    }, 700);

    if (typeof web3 !== 'undefined' && window.web3.eth.accounts[0] !== undefined) {
      // this.setState({ currentUser: window.web3.eth.accounts[0] });
      this.accountInterval = setInterval(() => {
        if (window.web3.eth.accounts[0] !== this.state.currentUser) {
          this.setState({ switchAccountLoading: true, currentUser: window.web3.eth.accounts[0] });
          setTimeout(() => this.setState({ switchAccountLoading: false }), 1200);
          this.getBorrowBalance();
        }
        // console.log('lend:' + this.props.isLogIn)
        // this.setLoginStatus();
      }, 1000 * 15);
    }
  }

  componentWillUnmount() {
    clearInterval(this.accountInterval);
  }



  render() {
    const usdxInstance = USDX();
    let currentAccount = null;
    let NetworkName;
    if (typeof web3 !== 'undefined') {
      currentAccount = this.web3.eth.accounts[0];
      NetworkName = findNetwork(this.state.NetworkName);
    }

    const usdxProps = {
      wethCoin: false,
      usdxCoin: true,
      coin: usdxInstance,
      account: currentAccount,
      supplyType: 'USDX',
      withdrawType: 'USDX',
      approveButtonInfo: "ENABLE USDx",
      supplyButtonInfo: "SUPPLY",
      withdrawButtonInfo: "WITHDRAW",
      balanceType: "USDx",
      balanceAmount: "",
      tabLeftName: 'SUPPLY',
      tabRightName: 'WITHDRAW',
      hasBorrowedUSDx: this.state.hasBorrowedUSDx,
      page: 'lend',
      login: window.web3.eth.accounts[0] ? true : false,
      isApproved_USDx: this.state.isApproved_USDx,
      not_approve_atfirst_USDX: this.state.not_approve_atfirst_USDX
    };

    return (
      <IntlProvider locale={'en'} messages={navigator.language === 'zh-CN' ? zh_CN : en_US} >
        <MediaQuery maxWidth={768}>
          {(match) =>
            <div className={'lend-page ' + (match ? 'CM XS ' : 'CM LG ') + (NetworkName === 'Main' ? 'without-banner' : 'with-banner')}>
              <WithMarketInfoEnhanced networkName={NetworkName} account={currentAccount} login={window.web3.eth.accounts[0]} />
              <div className='redirect-button'>
                <div className='go-back-button'>
                  <Link to={'/'}>
                    <img src={'images/icon_home@2x.png'} alt="HOME" />
                    <span>
                      <FormattedMessage id='Home' />
                    </span>
                  </Link>
                </div>
                <div className='go-to-borrow'>
                  <Link to={'/borrow'} >
                    <span>
                      <FormattedMessage id='Borrow' />
                    </span>
                    <img src={'images/icon_borrow@2x.png'} alt="BORROW" />
                  </Link>
                </div>
              </div>
              <AccountInfo networkName={NetworkName} currentPage={'lend'} account={currentAccount} login={window.web3.eth.accounts[0] ? true : false} />

              <div className="lend-page-wrapper">
                <div className="supply-group">
                  <div className="supply-title">
                    <span>
                      <FormattedMessage id='SUPPLY' /></span>
                  </div>
                  <div className="supply-content" style={{}}>
                    {/* <div className="supply-content" style={{ display: (this.state.isApproved_USDx == 1) || (this.state.not_approve_atfirst_USDX == 1) ? 'block' : 'none' }}> */}
                    <SupplyContent {...usdxProps} />

                    {this.state.isLogIn && window.web3.eth.accounts[0] && (this.state.isApproved_USDx == 1 || this.state.not_approve_atfirst_USDX == 1)
                      ?
                      <RecordBoard coinType={'USDx'} account={currentAccount} page={'lend'} />
                      :
                      null
                    }
                  </div>
                </div>
              </div>
            </div>
          }
        </MediaQuery>
      </IntlProvider>
    );
  }
}

export default Lend;
