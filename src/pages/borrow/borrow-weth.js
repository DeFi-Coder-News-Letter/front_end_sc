import React, { Component } from 'react';
import Header from '../../component/header/header';
import RecordBoard from '../../container/recordBoard/recordBoard';
import { withMarketInfo } from '../../HOC/withMarketInfo';
import AccountInfo from '../../container/accountInfo/accountInfo_borrow';
import { Link } from "react-router-dom";
import Network from '../../constant.json';
import MediaQuery from 'react-responsive';
import './borrow.scss';


import {
  findNetwork,
  getLoginStatusKey,
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
  handle_repay_max
} from '../../util.js';

import {
  get_my_ETH,
  get_my_WETH,
  handle_wrap_change,
  handle_wrap_click,
  handle_unwrap_change,
  handle_unwrap_click
} from '../../util-weth';


// add i18n.
import { IntlProvider, FormattedMessage } from 'react-intl';
import en_US from '../../language/en_US.js';
import zh_CN from '../../language/zh_CN';

import { Tabs, Button, InputNumber, Input } from 'antd';


import Web3 from 'web3';


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


class Borrow_weth extends Component {
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

    this.placeholder = 'Amount in WETH';
    this.img_src = 'WETH';
    this.token_name = 'WETH';

    this.new_web3.eth.net.getNetworkType().then(
      (net_type) => {
        let USDx = new this.new_web3.eth.Contract(USDx_abi, address[net_type]['address_USDx']);
        let WETH = new this.new_web3.eth.Contract(WETH_abi, address[net_type]['address_WETH']);
        let imBTC = new this.new_web3.eth.Contract(imBTC_abi, address[net_type]['address_imBTC']);
        let USDT = new this.new_web3.eth.Contract(USDT_abi, address[net_type]['address_USDT']);
        let mMarket = new this.new_web3.eth.Contract(mMarket_abi, address[net_type]['address_mMarket']);

        console.log(' *** init contract finished *** ');

        this.setState({
          net_type: net_type, USDx: USDx, WETH: WETH, imBTC: imBTC, USDT: USDT, mMarket: mMarket
        }, () => {
          get_tokens_decimals(this.state.USDx, this.state.WETH, this.state.imBTC, this.state.USDT, this);
          this.new_web3.givenProvider.enable().then(res_accounts => {
            this.setState({ my_account: res_accounts[0] }, async () => {

              console.log('connected: ', this.state.my_account)
              let is_approved = await get_allowance(this.state.WETH, this.state.my_account, address[net_type]['address_mMarket'], this.bn);
              console.log('is_approved: ', is_approved)

              this.setState({ is_approved: is_approved })

              let timer_Next = setInterval(() => {
                if (!(this.state.USDx_decimals && this.state.WETH_decimals && this.state.imBTC_decimals && this.state.USDT_decimals)) {
                  console.log('111111111: not get yet...');
                } else {
                  console.log('2222222222: i got it...');
                  clearInterval(timer_Next);
                  this.setState({ i_am_ready: true })

                  // to do something...



                }
              }, 100)
            })
          })
        })
      }
    )
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
    }, 3000)

  }

  componentWillUnmount = () => {
    if (this.timer_Next) {
      clearInterval(this.timer_Next)
    }
    clearInterval(this.timer_get_data)
  }


  render() {
    return (
      <IntlProvider locale={'en'} messages={navigator.language === 'zh-CN' ? zh_CN : en_US} >
        <MediaQuery maxWidth={768}>
          {(match) =>
            <div className={'borrow-page ' + (match ? 'CM XS ' : 'CM LG ') + ('without-banner')}>


              <div className='redirect-button'>
                <div className='go-back-button'>
                  <Link to={'/'}>
                    <img src={'images/icon_home@2x.png'} alt="HOME" />
                    <FormattedMessage id='Home' />
                  </Link>
                </div>
              </div>

              {/* <AccountInfo networkName={NetworkName} currentPage={'borrow'} account={currentAccount} login={window.web3.eth.accounts[0] ? true : false} /> */}

              <div className='lend-page-wrapper'>

                <div className='borrow-group'>
                  <div className='borrow-title-borrow'>
                    <span className='title-font'>
                      <FormattedMessage id='BORROW' />
                    </span>
                  </div>
                  <div className='borrow-content' style={{}}>
                    <div className='borrow-input'>
                      {/* <BalanceInfoWithIcon coin={'WETH'} action={'Supplied'} login={window.web3.eth.accounts[0] ? true : false} /> */}
                      <div className='info-wrapper'>
                        <span className='balance-type'>
                          <img style={{ width: '16px', height: '16px', margin: 'auto', marginTop: '-4px' }} src={`images/WETH@2x.png`} alt="" />
                          &nbsp;
                            {/* <FormattedMessage id='WETH_Supplied' /> */}
                          已经借款
                          </span>
                        <span className='balance-amount'>
                          {this.state.my_borrowed ? format_bn(this.state.my_borrowed, this.state.WETH_decimals, 2) : '-'}
                        </span>
                      </div>


                      <Tabs className='tab-wrapper' animated={true} size='large' onChange={this.changePane}>
                        <Tabs.TabPane tab={navigator.language === 'zh-CN' ? '借款' : 'BORROW'} key="1" className='tab-content'>
                          {
                            (this.state.i_am_ready && this.state.is_approved) &&
                            <React.Fragment>
                              <div className='balance-info'>
                                <span className='balance-desc'>
                                  <FormattedMessage id='ETH_Balance' />
                                </span>
                                <span className='balance-amount'>
                                  {this.state.my_ETH ? format_bn(this.state.my_ETH, 18, 2) : '-'}
                                  &nbsp;ETH
                                  </span>
                              </div>
                              <div className='input-wrap-unit-wrapper'>
                                <div className='wrap-input-wrapper'>
                                  <div className='input-wrapper'>
                                    <Input
                                      type='number'
                                      placeholder={'Ether to Wrap'}
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
                                      wrap
                                      </Button>
                                  </div>
                                </div>
                              </div>
                              <div className='input-unwrap-unit-wrapper'>
                              <div className='wrap-input-wrapper'>
                                <div className='input-wrapper'>
                                  <Input
                                    type='number'
                                    placeholder={'WETH to Unwrap'}
                                    min={0}
                                    value={this.state.unwrap_amount}
                                    onChange={(e) => handle_unwrap_change(this, e.target.value, this.state.my_balance)}
                                    className='input-number'
                                  />
                                  {/* <span className={this.state.unwrapMaxClassName} onClick={this.state.unwrapInputDisabled ? '' : this.handleunwrapMax}>MAX</span> */}
                                </div>
                                <div className='button-wrapper-borrow'>
                                  <Button
                                    size='large'
                                    className={this.state.is_unwrap_enable ? null : 'disable-button'}
                                    disabled={false}
                                    onClick={() => handle_unwrap_click(this)}
                                  >
                                    unwrap
                                    </Button>
                                </div>
                                </div>
                              </div>
                              <div className='balance-info'>
                                <span className='balance-desc'>
                                  {/* <FormattedMessage id='WETH_Balance' /> */}
                                  weth 可借数量
                                  </span>
                                <span className='balance-amount'>
                                  {this.state.available_to_borrow ? format_bn(this.state.available_to_borrow, 18, 2) : '-'}
                                  &nbsp;WETH
                                  </span>
                              </div>
                              <div className='input-unit-wrapper'>
                                <div className='input-wrapper'>
                                  <Input
                                    type='number'
                                    placeholder={'Amount in WETH'}
                                    min={0}
                                    value={this.state.borrow_amount}
                                    onChange={(e) => handle_borrow_change(e.target.value, this, this.state.WETH_decimals, this.state.available_to_borrow)}
                                    className='input-number'
                                    disabled={false}
                                  />
                                  {/* <span className={this.state.maxClassName} onClick={this.state.supplyInputDisabled ? '' : this.handleSupplyMax}>MAX</span> */}
                                </div>
                                <div className={'button-wrapper-borrow'}>
                                  <Button
                                    size='large'
                                    className={this.state.is_borrow_enable ? null : 'disable-button'}
                                    disabled={false}
                                    onClick={() => { handle_borrow_click(this, this.state.WETH_decimals, address[this.state.net_type]['address_WETH']) }}
                                  >
                                    {'borrow'}
                                  </Button>
                                </div>
                              </div>
                            </React.Fragment>
                          }
                          {
                            (this.state.i_am_ready && !this.state.is_approved) &&
                            <div className='approve-section'>
                              <div className='enable-message'>
                                {'Before supplying USDT for the first time, you must enable USDT.'}
                              </div>
                              <div className={'button-wrapper'}>
                                <Button
                                  size='large'
                                  className={''}
                                  disabled={false}
                                  onClick={() => { handle_approve(this.state.WETH, this, address[this.state.net_type]['address_mMarket']) }}
                                >
                                  {'ENABLE'}
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
                                  {/* <FormattedMessage id='WETH_Available' /> */}
                                  weth 余额
                              </span>
                                <span className='balance-amount'>
                                  {this.state.my_balance ? format_bn(this.state.my_balance, this.state.WETH_decimals, 2) : '-'}
                                  &nbsp;WETH
                              </span>
                              </div>
                              <div className='input-unit-wrapper'>
                                <div className='input-wrapper'>
                                  <Input
                                    type='number'
                                    placeholder={'Amount in WETH'}
                                    min={0}
                                    value={this.state.repay_amount}
                                    onChange={(e) => handle_repay_change(e.target.value, this, this.state.WETH_decimals, this.state.my_balance)}
                                    className='input-number'
                                    disabled={false}
                                  />
                                  <span className={'max-amount-button-borrow'} onClick={() => { handle_repay_max(this, this.state.my_balance, this.state.my_borrowed, this.state.WETH_decimals) }}>
                                    {'MAX'}
                                  </span>
                                </div>
                                <div className={'button-wrapper-borrow'}>
                                  <Button
                                    size='large'
                                    className={this.state.is_repay_enable ? null : 'disable-button'}
                                    disabled={false}
                                    onClick={() => { handle_repay_click(this, this.state.WETH_decimals, address[this.state.net_type]['address_WETH']) }}
                                  >
                                    {'repay'}
                                  </Button>
                                </div>
                              </div>
                            </React.Fragment>
                          }
                          {
                            (this.state.i_am_ready && !this.state.is_approved) &&
                            <div className='approve-section'>
                              <div className='enable-message'>
                                {'Before supplying USDT for the first time, you must enable USDT.'}
                              </div>
                              <div className={'button-wrapper'}>
                                <Button
                                  size='large'
                                  className={''}
                                  disabled={false}
                                  onClick={() => { handle_approve(this.state.WETH, this, address[this.state.net_type]['address_mMarket']) }}
                                >
                                  {'ENABLE'}
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
            </div>
          }
        </MediaQuery>
      </IntlProvider>
    );
  }
}

export default Borrow_weth;