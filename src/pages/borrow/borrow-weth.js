import React, { Component } from 'react';
import RecordBoard from '../../container/recordBoard/recordBoard';
import { Link } from "react-router-dom";
import MediaQuery from 'react-responsive';
import './borrow.scss';
import { Tabs, Button, Input } from 'antd';
import Footer from '../../component/footer/footer';

import {
  get_tokens_decimals,
  format_bn,
  get_available_to_borrow,
  get_borrow_balance,
  get_allowance,
  handle_approve,
  handle_borrow_change,
  handle_borrow_click,
  handle_repay_click,
  handle_repay_change,
  handle_repay_max,
  format_num_to_K,
  handle_borrow_max
} from '../../util.js';

import {
  get_my_ETH,
  get_my_WETH,
  handle_wrap_change,
  handle_wrap_click,
  handle_unwrap_change,
  handle_unwrap_click,
  handle_unwrap_max
} from '../../util-weth';

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

class BorrowWETH extends Component {
  constructor(props) {
    super(props);

    this.state = {
      is_borrow_enable: true,
      is_repay_enable: true,
      is_wrap_enable: true,
      is_unwrap_enable: true
    };

    this.new_web3 = window.new_web3 = new Web3(Web3.givenProvider || null);
    this.bn = this.new_web3.utils.toBN;

    this.decimal_precision = constant.decimal_precision;
    this.gas_limit_coefficient = constant.gas_limit_coefficient;
    this.collateral_rate = constant.collateral_rate;
    this.originationFee = constant.originationFee;

    this.placeholder = navigator.language === 'zh-CN' ? '输入数量' : 'Amount in WETH';
    this.to_wrap = navigator.language === 'zh-CN' ? 'ETH数量' : 'Ether to Wrap';
    this.to_unwrap = navigator.language === 'zh-CN' ? 'WETH数量' : 'WETH to Unwrap';
    this.img_src = 'WETH';
    this.token_name = 'WETH';

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
              let is_approved = await get_allowance(this.state.WETH, this.state.my_account, address[net_type]['address_mMarket'], this.bn);
              console.log('is_approved: ', is_approved)
              this.setState({ is_approved: is_approved })
              let timer_Next = setInterval(() => {
                if (!this.state.WETH_decimals) {
                  console.log('111111111: not get yet...');
                } else {
                  console.log('2222222222: i got it...');
                  clearInterval(timer_Next);
                  this.setState({ i_am_ready: true })
                  // to do something...
                  get_my_ETH(this);
                  get_my_WETH(this);
                  get_available_to_borrow(this.state.mMarket, this.state.WETH, address[this.state.net_type]['address_mMarket'], address[this.state.net_type]['address_WETH'], this.state.my_account, this.collateral_rate, this.originationFee, this);
                  get_borrow_balance(this.state.mMarket, this.state.my_account, address[this.state.net_type]['address_WETH'], this);
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
          let is_approved = await get_allowance(this.state.WETH, this.state.my_account, address[this.state.net_type]['address_mMarket'], this.bn);
          console.log('is_approved: ', is_approved)
          this.setState({ is_approved: is_approved })
          let timer_Next = setInterval(() => {
            if (!this.state.WETH_decimals) {
              console.log('111111111: not get yet...');
            } else {
              console.log('2222222222: i got it...');
              clearInterval(timer_Next);
              this.setState({ i_am_ready: true, load_new_history: Math.random() })
              // to do something...
              get_my_ETH(this);
              get_my_WETH(this);
              get_available_to_borrow(this.state.mMarket, this.state.WETH, address[this.state.net_type]['address_mMarket'], address[this.state.net_type]['address_WETH'], this.state.my_account, this.collateral_rate, this.originationFee, this);
              get_borrow_balance(this.state.mMarket, this.state.my_account, address[this.state.net_type]['address_WETH'], this);
            }
          }, 100)
        })
      });
    }
  }


  componentDidMount = () => {
    this.timer_get_data = setInterval(() => {
      if (!this.state.my_account) {
        console.log('account not ailableav')
        return false;
      }
      get_my_ETH(this);
      get_my_WETH(this);
      get_available_to_borrow(this.state.mMarket, this.state.WETH, address[this.state.net_type]['address_mMarket'], address[this.state.net_type]['address_WETH'], this.state.my_account, this.collateral_rate, this.originationFee, this);
      get_borrow_balance(this.state.mMarket, this.state.my_account, address[this.state.net_type]['address_WETH'], this);
    }, 1000 * 5)
  }


  componentWillUnmount = () => {
    clearInterval(this.timer_get_data)
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
                    <FormattedMessage id='Home' />
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
                          <img style={{ width: '16px', height: '16px', margin: 'auto', marginTop: '-4px' }} src={`images/${this.img_src}.png`} alt="" />
                          &nbsp;
                          {this.token_name}
                          <FormattedMessage id='borrowed' />
                        </span>
                        <span className='balance-amount'>
                          {this.state.my_borrowed ? format_num_to_K(format_bn(this.state.my_borrowed, this.state.WETH_decimals, 2)) : '···'}
                        </span>
                      </div>


                      <Tabs className='tab-wrapper' animated={true} size='large' onChange={this.changePane}>
                        <Tabs.TabPane tab={navigator.language === 'zh-CN' ? '借款' : 'BORROW'} key="1" className='tab-content'>
                          {
                            (this.state.i_am_ready && this.state.is_approved) &&
                            <React.Fragment>
                              <div className='balance-info'>
                                <span className='balance-desc'>
                                  {'ETH'}
                                  <FormattedMessage id='balance' />
                                </span>
                                <span className='balance-amount'>
                                  {this.state.my_ETH ? format_num_to_K(format_bn(this.state.my_ETH, 18, 2)) : '···'}
                                </span>
                              </div>
                              <div className='input-wrap-unit-wrapper'>
                                <div className='wrap-input-wrapper'>
                                  <div className='input-wrapper'>
                                    <Input
                                      type='number'
                                      placeholder={this.to_wrap}
                                      min={0}
                                      value={this.state.wrap_amount}
                                      onChange={(e) => handle_wrap_change(this, e.target.value, this.state.my_ETH)}
                                      className='input-number'
                                    />
                                  </div>
                                  <div className='button-wrapper-borrow'>
                                    <Button
                                      size='large'
                                      className={this.state.is_wrap_enable ? null : 'disable-button'}
                                      onClick={() => handle_wrap_click(this)}
                                    >
                                      <FormattedMessage id='WRAP' />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                              <div className='input-unwrap-unit-wrapper'>
                                <div className='wrap-input-wrapper'>
                                  <div className='input-wrapper'>
                                    <Input
                                      type='number'
                                      placeholder={this.to_unwrap}
                                      min={0}
                                      value={this.state.unwrap_amount}
                                      onChange={(e) => handle_unwrap_change(this, e.target.value, this.state.my_balance)}
                                      className='input-number'
                                    />
                                    {
                                      /* <span className={'max-amount-button special-clolr'} onClick={() => { handle_unwrap_max(this, this.state.my_balance, this.state.WETH_decimals) }}>
                                        <FormattedMessage id='MAX' />
                                      </span> */
                                    }
                                  </div>
                                  <div className='button-wrapper-borrow'>
                                    <Button
                                      size='large'
                                      className={this.state.is_unwrap_enable ? null : 'disable-button'}
                                      disabled={false}
                                      onClick={() => handle_unwrap_click(this)}
                                    >
                                      <FormattedMessage id='UNWRAP' />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                              <div className='balance-info'>
                                <span className='balance-desc'>
                                  <FormattedMessage id='available_borrow' />
                                </span>
                                <span className='balance-amount'>
                                  {this.state.available_to_borrow ? format_num_to_K(format_bn(this.state.available_to_borrow, 18, 2)) : '···'}
                                </span>
                              </div>
                              <div className='input-unit-wrapper'>
                                {
                                  this.props.data.i_have_supply_weth &&
                                  <div className='alert-message'>
                                    <FormattedMessage id='already_supply_weth' />
                                  </div>
                                }
                                {
                                  !this.props.data.i_have_supply_weth &&
                                  <div className='input-wrapper'>
                                    <Input
                                      type='number'
                                      placeholder={this.placeholder}
                                      min={0}
                                      value={this.state.borrow_amount}
                                      onChange={(e) => handle_borrow_change(e.target.value, this, this.state.WETH_decimals, this.state.available_to_borrow)}
                                      className='input-number'
                                      disabled={false}
                                    />
                                    <span className={'max-amount-button special-clolr'} onClick={() => { handle_borrow_max(this, this.state.available_to_borrow_safe, this.state.WETH_decimals) }}>
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
                                <div className={'button-wrapper-borrow'}>
                                  <Button
                                    size='large'
                                    className={this.state.is_borrow_enable && !this.props.data.i_have_supply_weth ? null : 'disable-button'}
                                    disabled={false}
                                    onClick={() => { handle_borrow_click(this, this.state.WETH_decimals, address[this.state.net_type]['address_WETH']) }}
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
                                <FormattedMessage id='before_borrowing_weth' />
                              </div>
                              <div className={'button-wrapper-borrow'}>
                                <Button
                                  size='large'
                                  className={this.state.isEnableing ? 'disable-button' : null}
                                  disabled={false}
                                  onClick={() => { handle_approve(this.state.WETH, this, address[this.state.net_type]['address_mMarket']) }}
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
                                  {'ETH'}
                                  <FormattedMessage id='balance' />
                                </span>
                                <span className='balance-amount'>
                                  {this.state.my_ETH ? format_num_to_K(format_bn(this.state.my_ETH, 18, 2)) : '···'}
                                </span>
                              </div>
                              <div className='input-wrap-unit-wrapper'>
                                <div className='wrap-input-wrapper'>
                                  <div className='input-wrapper'>
                                    <Input
                                      type='number'
                                      placeholder={this.to_wrap}
                                      min={0}
                                      value={this.state.wrap_amount}
                                      onChange={(e) => handle_wrap_change(this, e.target.value, this.state.my_ETH)}
                                      className='input-number'
                                    />
                                  </div>
                                  <div className='button-wrapper-borrow'>
                                    <Button
                                      size='large'
                                      className={this.state.is_wrap_enable ? null : 'disable-button'}
                                      onClick={() => handle_wrap_click(this)}
                                    >
                                      <FormattedMessage id='WRAP' />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                              <div className='input-unwrap-unit-wrapper'>
                                <div className='wrap-input-wrapper'>
                                  <div className='input-wrapper'>
                                    <Input
                                      type='number'
                                      placeholder={this.to_unwrap}
                                      min={0}
                                      value={this.state.unwrap_amount}
                                      onChange={(e) => handle_unwrap_change(this, e.target.value, this.state.my_balance)}
                                      className='input-number'
                                    />
                                    {
                                      /* <span className={'max-amount-button special-clolr'} onClick={() => { handle_unwrap_max(this, this.state.my_balance, this.state.WETH_decimals) }}>
                                        <FormattedMessage id='MAX' />
                                      </span> */
                                    }
                                  </div>
                                  <div className='button-wrapper-borrow'>
                                    <Button
                                      size='large'
                                      className={this.state.is_unwrap_enable ? null : 'disable-button'}
                                      disabled={false}
                                      onClick={() => handle_unwrap_click(this)}
                                    >
                                      <FormattedMessage id='UNWRAP' />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                              <div className='balance-info'>
                                <span className='balance-desc'>
                                  {this.token_name}
                                  <FormattedMessage id='balance' />
                                </span>
                                <span className='balance-amount' style={{ cursor: 'pointer' }} onClick={() => { handle_unwrap_max(this, this.state.my_balance, this.state.WETH_decimals) }}>
                                  {this.state.my_balance ? format_num_to_K(format_bn(this.state.my_balance, this.state.WETH_decimals, 2)) : '···'}
                                </span>
                              </div>
                              <div className='input-unit-wrapper'>
                                {
                                  this.props.data.i_have_supply_weth &&
                                  <div className='alert-message'>
                                    <FormattedMessage id='already_supply_weth' />
                                  </div>
                                }
                                {
                                  !this.props.data.i_have_supply_weth &&
                                  <div className='input-wrapper'>
                                    <Input
                                      type='number'
                                      placeholder={this.placeholder}
                                      min={0}
                                      value={this.state.repay_amount}
                                      onChange={(e) => handle_repay_change(e.target.value, this, this.state.WETH_decimals, this.state.my_balance)}
                                      className='input-number'
                                      disabled={false}
                                    />
                                    <span className={'max-amount-button-borrow'} onClick={() => { handle_repay_max(this, this.state.my_balance, this.state.my_borrowed, this.state.WETH_decimals) }}>
                                      <FormattedMessage id='MAX' />
                                    </span>
                                  </div>
                                }
                                <div className={'button-wrapper-borrow'}>
                                  <Button
                                    size='large'
                                    className={this.state.is_repay_enable && !this.props.data.i_have_supply_weth ? null : 'disable-button'}
                                    disabled={false}
                                    onClick={() => { handle_repay_click(this, this.state.WETH_decimals, address[this.state.net_type]['address_WETH']) }}
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
                                <FormattedMessage id='before_borrowing_weth' />
                              </div>
                              <div className={'button-wrapper-borrow'}>
                                <Button
                                  size='large'
                                  className={this.state.isEnableing ? 'disable-button' : null}
                                  disabled={false}
                                  onClick={() => { handle_approve(this.state.WETH, this, address[this.state.net_type]['address_mMarket']) }}
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
                        decimal={18}
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

export default BorrowWETH;