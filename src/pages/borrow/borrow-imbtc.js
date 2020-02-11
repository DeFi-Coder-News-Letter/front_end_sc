import React, { Component } from 'react';
import RecordBoard from '../../container/recordBoard/recordBoard';
import { Link } from "react-router-dom";
import MediaQuery from 'react-responsive';
import './borrow.scss';
import { Tabs, Input, Button } from 'antd';
import Footer from '../../component/footer/footer';
import {
  get_tokens_decimals,
  get_allowance,
  get_borrow_balance,
  format_bn,
  get_my_balance,
  get_available_to_borrow,
  handle_borrow_click,
  handle_borrow_change,
  handle_repay_change,
  handle_repay_click,
  handle_borrow_max,
  handle_repay_max,
  handle_approve,
  format_num_to_K
} from '../../util.js';

// add i18n.
import { IntlProvider, FormattedMessage } from 'react-intl';
import en_US from '../../language/en_US.js';
import zh_CN from '../../language/zh_CN';

import Web3 from 'web3';
import MyStatus from '../../component/header/my-status';
import TopStatus from '../../component/header/top-status';


// tokens ABIs
let USDx_abi = require('../../ABIs/USDX_ABI.json');
let WETH_abi = require('../../ABIs/WETH_ABI.json');
let imBTC_abi = require('../../ABIs/imBTC_ABI.json');
let USDT_abi = require('../../ABIs/USDT_ABI.json');
let mMarket_abi = require('../../ABIs/moneyMarket.json');
// tokens address
let address = require('../../ABIs/address_map.json');
// 常量
let constant = require('../../ABIs/constant.json');

// const WithMarketInfoEnhanced = withMarketInfo(Header);

class BorrowimBTC extends Component {
  constructor(props) {
    super(props);

    this.state = {
      is_borrow_enable: true,
      is_repay_enable: true
    };

    this.new_web3 = window.new_web3 = new Web3(Web3.givenProvider || null);
    this.bn = this.new_web3.utils.toBN;

    this.decimal_precision = constant.decimal_precision;
    this.gas_limit_coefficient = constant.gas_limit_coefficient;
    this.collateral_rate = constant.collateral_rate;
    this.originationFee = constant.originationFee;

    this.placeholder = navigator.language === 'zh-CN' ? '输入数量' : 'Amount in imBTC';
    this.img_src = 'imBTC';
    this.token_name = 'imBTC';

    this.new_web3.eth.net.getNetworkType().then(
      (net_type) => {
        let USDx = new this.new_web3.eth.Contract(USDx_abi, address[net_type]['address_USDx']);
        let WETH = new this.new_web3.eth.Contract(WETH_abi, address[net_type]['address_WETH']);
        let imBTC = new this.new_web3.eth.Contract(imBTC_abi, address[net_type]['address_imBTC']);
        let USDT = new this.new_web3.eth.Contract(USDT_abi, address[net_type]['address_USDT']);
        let HBTC = new this.new_web3.eth.Contract(imBTC_abi, address[net_type]['address_HBTC']);
        let mMarket = new this.new_web3.eth.Contract(mMarket_abi, address[net_type]['address_mMarket']);
        console.log(' *** init contract finished *** ');
        this.setState({ net_type: net_type, USDx: USDx, WETH: WETH, imBTC: imBTC, USDT: USDT, mMarket: mMarket, HBTC: HBTC }, () => {
          get_tokens_decimals(this.state.USDx, this.state.WETH, this.state.imBTC, this.state.USDT, this.state.HBTC, this);
          this.new_web3.givenProvider.enable().then(res_accounts => {
            this.setState({ my_account: res_accounts[0] }, async () => {
              console.log('connected: ', this.state.my_account)
              let is_approved = await get_allowance(this.state.imBTC, this.state.my_account, address[net_type]['address_mMarket'], this.bn);
              console.log('is_approved: ', is_approved)
              this.setState({ is_approved: is_approved })
              let timer_Next = setInterval(() => {
                if (!this.state.imBTC_decimals) {
                  console.log('111111111: not get yet...');
                } else {
                  console.log('2222222222: i got it...');
                  clearInterval(timer_Next);
                  this.setState({ i_am_ready: true })
                  // to do something...
                  get_available_to_borrow(this.state.mMarket, this.state.imBTC, address[this.state.net_type]['address_mMarket'], address[this.state.net_type]['address_imBTC'], this.state.my_account, this.collateral_rate, this.originationFee, this);
                  get_borrow_balance(this.state.mMarket, this.state.my_account, address[this.state.net_type]['address_imBTC'], this);
                  get_my_balance(this.state.imBTC, this.state.my_account, this);
                }
              }, 100)
            })
          })
        })
      }
    )

    // add accounts changed
    if (window.ethereum.on) {
      window.ethereum.on('accountsChanged', (accounts) => {
        console.log('accountsChanged: ', accounts[0]);
        this.setState({ my_account: accounts[0] }, async () => {
          console.log('connected: ', this.state.my_account)
          let is_approved = await get_allowance(this.state.imBTC, this.state.my_account, address[this.state.net_type]['address_mMarket'], this.bn);
          console.log('is_approved: ', is_approved)
          this.setState({ is_approved: is_approved })
          let timer_Next = setInterval(() => {
            if (!this.state.imBTC_decimals) {
              console.log('111111111: not get yet...');
            } else {
              console.log('2222222222: i got it...');
              clearInterval(timer_Next);
              this.setState({ i_am_ready: true, load_new_history: Math.random() })
              // to do something...
              get_available_to_borrow(this.state.mMarket, this.state.imBTC, address[this.state.net_type]['address_mMarket'], address[this.state.net_type]['address_imBTC'], this.state.my_account, this.collateral_rate, this.originationFee, this);
              get_borrow_balance(this.state.mMarket, this.state.my_account, address[this.state.net_type]['address_imBTC'], this);
              get_my_balance(this.state.imBTC, this.state.my_account, this);
            }
          }, 100)
        })
      });
    }
  }


  componentDidMount = () => {
    this.timer_get_data = setInterval(() => {
      if (!this.state.my_account) {
        console.log('account not available.')
        return false;
      }
      console.log('update new data... (---borrow imbtc---) ');
      get_available_to_borrow(this.state.mMarket, this.state.imBTC, address[this.state.net_type]['address_mMarket'], address[this.state.net_type]['address_imBTC'], this.state.my_account, this.collateral_rate, this.originationFee, this);
      get_borrow_balance(this.state.mMarket, this.state.my_account, address[this.state.net_type]['address_imBTC'], this);
      get_my_balance(this.state.imBTC, this.state.my_account, this);
    }, 1000 * 5)
  }


  componentWillUnmount() {
    clearInterval(this.timer_get_data);
  }


  render() {
    return (
      <IntlProvider locale={'en'} messages={navigator.language === 'zh-CN' ? zh_CN : en_US} >
        <MediaQuery maxWidth={768}>
          {(match) =>
            <div className={'borrow-page ' + (match ? 'CM XS ' : 'CM LG ') + ('without-banner')}>

              <TopStatus token_name={this.token_name} data={this.props.data} />

              <div className='redirect-button'>
                <div className='go-back-button'>
                  <Link to={'/'}>
                    <img src={'images/icon_home@2x.png'} alt="HOME" />
                    <span>
                      <FormattedMessage id='Home' />
                    </span>
                  </Link>
                </div>
              </div>

              <MyStatus data={this.props.data} borrow_APR={this.props.borrow_APR} />

              <div className='lend-page-wrapper'>
                <div className='borrow-group'>
                  <div className='borrow-title-borrow'>
                    <span className='title-font'>
                      <FormattedMessage id='BORROW' />
                    </span>
                  </div>

                  <div className='borrow-content'>
                    <div className='borrow-input'>
                      <div className='info-wrapper'>
                        <span className='balance-type'>
                          <img style={{ width: '16px', height: '16px', margin: 'auto', marginTop: '-4px' }} src={`images/${this.img_src}.svg`} alt="" />
                          &nbsp;
                          {this.token_name}
                          <FormattedMessage id='borrowed' />
                        </span>
                        <span className='balance-amount'>
                          {this.state.my_borrowed ? format_num_to_K(format_bn(this.state.my_borrowed, this.state.imBTC_decimals, this.decimal_precision)) : '···'}
                        </span>
                      </div>


                      <Tabs className='tab-wrapper' animated={true} size='large' onChange={this.changePane}>
                        <Tabs.TabPane tab={navigator.language === 'zh-CN' ? '借款' : 'BORROW'} key="1" className='tab-content'>
                          {
                            (this.state.i_am_ready && this.state.is_approved) &&
                            <React.Fragment>
                              <div className='balance-info'>
                                <span className='balance-desc'>
                                  <FormattedMessage id='available_borrow' />
                                </span>
                                <span className='balance-amount'>
                                  {
                                    this.state.available_to_borrow ?
                                      format_num_to_K(format_bn(this.state.available_to_borrow, this.state.imBTC_decimals, this.decimal_precision))
                                      :
                                      Number(this.state.available_to_borrow) === 0 ?
                                        '0.00' : '···'
                                  }
                                </span>
                              </div>
                              <div className='input-unit-wrapper'>
                                {
                                  this.props.data.i_have_supply_imbtc &&
                                  <div className='alert-message'>
                                    <FormattedMessage id='already_supply_imbtc' />
                                  </div>
                                }
                                {
                                  !this.props.data.i_have_supply_imbtc &&
                                  <div className='input-wrapper'>
                                    <Input
                                      type='number'
                                      placeholder={this.placeholder}
                                      min={0}
                                      onChange={(e) => handle_borrow_change(e.target.value, this, this.state.imBTC_decimals, this.state.available_to_borrow)}
                                      className='input-number'
                                      value={this.state.borrow_amount}
                                    />
                                    <span className={'max-amount-button-borrow'} onClick={() => { handle_borrow_max(this, this.state.available_to_borrow_safe, this.state.imBTC_decimals) }}>
                                      <FormattedMessage id='SAFE_MAX' />
                                    </span>

                                    {/* <div className='alert-tips'>
                                      <div className='tips1'>
                                        ?
                                      </div>
                                      <div className='tips2'>
                                        <FormattedMessage id='safe_max_tips' />
                                      </div>
                                    </div> */}
                                  </div>
                                }

                                {
                                  this.state.borrow_exceed &&
                                  <div className='safe-max-alert-message'><FormattedMessage id='exceed_massage' /></div>
                                }

                                <div className='button-wrapper-borrow'>
                                  <Button
                                    size='large'
                                    className={this.state.is_borrow_enable && !this.props.data.i_have_supply_imbtc ? null : 'disable-button'}
                                    disabled={false}
                                    onClick={() => { handle_borrow_click(this, this.state.imBTC_decimals, address[this.state.net_type]['address_imBTC']) }}
                                  >
                                    {
                                      this.state.no_such_borrow_balance ?
                                        <FormattedMessage id='INSUFFICIENT_LIQUIDITY' /> : <FormattedMessage id='BORROW' />
                                    }
                                  </Button>
                                </div>
                              </div>
                            </React.Fragment>
                          }
                          {
                            (this.state.i_am_ready && !this.state.is_approved) &&
                            <div className='approve-section'>
                              <div className='enable-message'>
                                <FormattedMessage id='before_borrowing_imbtc' />
                              </div>
                              <div className={'button-wrapper-borrow'}>
                                <Button
                                  size='large'
                                  className={this.state.isEnableing ? 'disable-button' : null}
                                  disabled={false}
                                  onClick={() => { handle_approve(this.state.imBTC, this, address[this.state.net_type]['address_mMarket']) }}
                                >
                                  <FormattedMessage id='ENABLE' />
                                </Button>
                              </div>
                            </div>
                          }
                        </Tabs.TabPane>






                        <Tabs.TabPane tab={navigator.language === 'zh-CN' ? '偿还' : 'REPAY'} key="2" className='tab-content'>
                          {
                            (this.state.i_am_ready && this.state.is_approved) &&
                            <React.Fragment>
                              <div className='balance-info'>
                                <span className='balance-desc'>
                                  {this.token_name}
                                  <FormattedMessage id='balance' />
                                </span>
                                <span className='balance-amount'>
                                  {this.state.my_balance ? format_num_to_K(format_bn(this.state.my_balance, this.state.imBTC_decimals, this.decimal_precision)) : '···'}
                                </span>
                              </div>

                              <div className='input-unit-wrapper'>
                                {
                                  this.props.data.i_have_supply_imbtc &&
                                  <div className='alert-message'>
                                    <FormattedMessage id='already_supply_imbtc' />
                                  </div>
                                }
                                {
                                  !this.props.data.i_have_supply_imbtc &&
                                  <div className='input-wrapper'>
                                    <Input
                                      type='number'
                                      placeholder={this.placeholder}
                                      min={0}
                                      onChange={(e) => handle_repay_change(e.target.value, this, this.state.imBTC_decimals, this.state.my_balance)}
                                      className='input-number'
                                      value={this.state.repay_amount}
                                    />
                                    <span className={'max-amount-button-borrow'} onClick={() => { handle_repay_max(this, this.state.my_balance, this.state.my_borrowed, this.state.imBTC_decimals) }}>
                                      <FormattedMessage id='MAX' />
                                    </span>
                                  </div>
                                }

                                <div className={'button-wrapper-borrow'}>
                                  <Button
                                    size='large'
                                    className={this.state.is_repay_enable && !this.props.data.i_have_supply_imbtc ? null : 'disable-button'}
                                    disabled={false}
                                    onClick={() => { handle_repay_click(this, this.state.imBTC_decimals, address[this.state.net_type]['address_imBTC']) }}
                                  >
                                    {
                                      this.state.no_such_repay_balance ?
                                        <FormattedMessage id='INSUFFICIENT_BALANCE' /> : <FormattedMessage id='REPAY' />
                                    }
                                  </Button>
                                </div>
                              </div>
                            </React.Fragment>
                          }
                          {
                            (this.state.i_am_ready && !this.state.is_approved) &&
                            <div className='approve-section'>
                              <div className='enable-message'>
                                <FormattedMessage id='before_borrowing_imbtc' />
                              </div>
                              <div className={'button-wrapper-borrow'}>
                                <Button
                                  size='large'
                                  className={this.state.isEnableing ? 'disable-button' : null}
                                  disabled={false}
                                  onClick={() => { handle_approve(this.state.imBTC, this, address[this.state.net_type]['address_mMarket']) }}
                                >
                                  <FormattedMessage id='ENABLE' />
                                </Button>
                              </div>
                            </div>
                          }
                        </Tabs.TabPane>
                      </Tabs>
                    </div>


                    {/* ***** ***** ***** RecordBoard ***** ***** ***** */}
                    {
                      this.state.i_am_ready &&
                      <RecordBoard
                        account={this.state.my_account}
                        net_type={this.state.net_type}
                        decimal={this.state.imBTC_decimals}
                        token={this.token_name}
                        load_new_history={this.state.load_new_history}
                        new_web3={this.new_web3}
                      />
                    }
                  </div>
                </div>
              </div>

              <Footer />

            </div>
          }
        </MediaQuery>
      </IntlProvider>
    );
  }
}

export default BorrowimBTC;