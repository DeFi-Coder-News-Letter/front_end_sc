import React, { Component } from "react";
import { Link } from "react-router-dom";
import { Tabs, Button, Input } from 'antd';
import { withMarketInfo } from '../../HOC/withMarketInfo';
import RecordBoard from '../../container/recordBoard/recordBoard';
import {
  format_bn,
  get_tokens_decimals,
  get_allowance,
  handle_supply_change,
  handle_supply_max,
  handle_withdraw_change,
  handle_withdraw_max,
  get_my_balance,
  get_supplied__available_to_withdraw,
  handle_approve,
  handle_supply_click,
  handle_withdraw_click,
  format_num_to_K
} from '../../util.js';

import MediaQuery from 'react-responsive';
import "./supply.scss";
// add i18n.
import { IntlProvider, FormattedMessage } from 'react-intl';
import en_US from '../../language/en_US.js';
import zh_CN from '../../language/zh_CN';

import My_status from '../../component/header/my-status';
import Top_status from '../../component/header/top-status';

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

// const WithMarketInfoEnhanced = withMarketInfo(Header);


class Supply_usdx extends Component {
  constructor(props) {
    super(props);

    this.state = {
      supply_amount: null,
      is_supply_enable: true,
      is_withdraw_enable: true
    }

    this.placeholder = 'Amount in USDx';
    this.img_src = 'USDx@2x';
    this.token_name = 'USDx';

    this.decimal_precision = constant.decimal_precision;
    this.gas_limit_coefficient = constant.gas_limit_coefficient;
    this.collateral_rate = constant.collateral_rate;

    // console.log('this.props.data.i_am_ready: --- no ', this.props.data.i_am_ready);
    this.new_web3 = window.new_web3 = new Web3(Web3.givenProvider || null);
    this.bn = this.new_web3.utils.toBN;

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
              let is_approved = await get_allowance(this.state.USDx, this.state.my_account, address[net_type]['address_mMarket'], this.bn);
              console.log('is_approved: ', is_approved)
              this.setState({ is_approved: is_approved })
              let timer_Next = setInterval(() => {
                if (!this.state.USDx_decimals) {
                  console.log('111111111: not get yet...');
                } else {
                  console.log('2222222222: i got it...');
                  clearInterval(timer_Next);
                  this.setState({ i_am_ready: true })
                  // to do something...
                  get_my_balance(this.state.USDx, this.state.my_account, this);
                  get_supplied__available_to_withdraw(this.state.mMarket, this.state.USDx, this.state.my_account, address[this.state.net_type]['address_USDx'], address[this.state.net_type]['address_mMarket'], this);
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
        console.log('account not available.')
        return false;
      }
      console.log('update new data.')
      get_my_balance(this.state.USDx, this.state.my_account, this);
      get_supplied__available_to_withdraw(this.state.mMarket, this.state.USDx, this.state.my_account, address[this.state.net_type]['address_USDx'], address[this.state.net_type]['address_mMarket'], this);
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
            // <div className={'lend-page ' + (match ? 'CM XS ' : 'CM LG ') + (NetworkName === 'Main' ? 'without-banner' : 'with-banner')}>
            <div className={'lend-page ' + (match ? 'CM XS ' : 'CM LG ') + ('without-banner')}>

              <Top_status token_name={this.token_name} data={this.props.data} />

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

              <My_status data={this.props.data} />

              <div className="lend-page-wrapper">
                <div className="supply-group">
                  <div className="supply-title">
                    <span>
                      <FormattedMessage id='SUPPLY' /></span>
                  </div>
                  <div className="supply-content">
                    <div className='supply-input'>
                      <div className='info-wrapper'>
                        <span className='balance-type'>
                          <img style={{ width: '16px', height: '16px', margin: 'auto', marginTop: '-4px' }} src={`images/${this.img_src}.png`} alt="" />
                          &nbsp;
                          {this.token_name}
                          <FormattedMessage id='supplied' />
                        </span>
                        <span className='balance-amount'>
                          {this.state.my_supplied ? format_num_to_K(format_bn(this.state.my_supplied, this.state.USDx_decimals, this.decimal_precision)) : '-'}
                        </span>
                      </div>

                      <Tabs className='tab-wrapper' animated={true} size='large' onChange={this.changePane}>

                        {/* ***** ***** ***** approve ***** ***** ***** */}
                        <Tabs.TabPane tab={navigator.language === 'zh-CN' ? '存款' : 'SUPPLY'} key="1" className='tab-content'>
                          {
                            (this.state.i_am_ready && this.state.is_approved) &&
                            <React.Fragment>
                              <div className='balance-info'>
                                <span className='balance-desc'>
                                  {this.token_name}
                                  <FormattedMessage id='balance' />
                                </span>
                                <span className='balance-amount'>
                                  {this.state.my_balance ? format_num_to_K(format_bn(this.state.my_balance, this.state.USDx_decimals, this.decimal_precision)) : '-'}
                                </span>
                              </div>
                              <div className='input-unit-wrapper'>
                                <div className='input-wrapper'>
                                  <Input
                                    type='number'
                                    placeholder={this.placeholder}
                                    min={0}
                                    onChange={(e) => handle_supply_change(e.target.value, this, this.state.USDx_decimals, this.state.my_balance)}
                                    className='input-number'
                                    value={this.state.supply_amount}
                                  />
                                  <span className={'max-amount-button'} onClick={() => { handle_supply_max(this, this.state.my_balance, this.state.USDx_decimals) }}>
                                    {'MAX'}
                                  </span>
                                </div>
                                <div className={'button-wrapper'}>
                                  <Button
                                    size='large'
                                    className={this.state.is_supply_enable ? null : 'disable-button'}
                                    disabled={false}
                                    onClick={() => { handle_supply_click(this, this.state.USDx_decimals, address[this.state.net_type]['address_USDx']) }}
                                  >
                                    {'SUPPLY'}
                                    {/* <FormattedMessage id='USDx_Balance' /> */}
                                  </Button>
                                </div>
                              </div>
                            </React.Fragment>
                          }
                          {
                            (this.state.i_am_ready && !this.state.is_approved) &&
                            <div className='approve-section'>
                              <div className='enable-message'>
                                <FormattedMessage id='before_supplying_usdx' />
                              </div>
                              <div className={'button-wrapper'}>
                                <Button
                                  size='large'
                                  className={''}
                                  disabled={false}
                                  onClick={() => { handle_approve(this.state.USDx, this, address[this.state.net_type]['address_mMarket']) }}
                                >
                                  {'ENABLE'}
                                </Button>
                              </div>
                            </div>
                          }
                        </Tabs.TabPane>
                        {/* ***** ***** ***** approve ***** ***** ***** */}

                        {/* ***** ***** ***** withdraw ***** ***** ***** */}
                        <Tabs.TabPane tab={navigator.language === 'zh-CN' ? '取出' : 'WITHDRAW'} key="2" className='tab-content'>
                          {
                            (this.state.i_am_ready && this.state.is_approved) &&
                            <React.Fragment>
                              <div className='balance-info'>
                                <span className='balance-desc'>
                                  {this.token_name}
                                  <FormattedMessage id='available_withdraw' />
                                </span>
                                <span className='balance-amount'>
                                  {this.state.available_to_withdraw ? format_num_to_K(format_bn(this.state.available_to_withdraw, this.state.USDx_decimals, this.decimal_precision)) : '-'}
                                </span>
                              </div>

                              <div className='input-unit-wrapper'>
                                <div className='input-wrapper'>
                                  <Input
                                    type='number'
                                    placeholder={this.placeholder}
                                    min={0}
                                    className='input-number'
                                    onChange={(e) => handle_withdraw_change(e.target.value, this, this.state.USDx_decimals, this.state.available_to_withdraw)}
                                    value={this.state.withdraw_amount}
                                  />
                                  <span className={'max-amount-button'} onClick={() => { handle_withdraw_max(this, this.state.available_to_withdraw, this.state.USDx_decimals) }}>
                                    {'MAX'}
                                  </span>
                                </div>

                                <div className={'button-wrapper'}>
                                  <Button
                                    size='large'
                                    className={this.state.is_withdraw_enable ? null : 'disable-button'}
                                    disabled={false}
                                    onClick={() => { handle_withdraw_click(this, this.state.USDx_decimals, address[this.state.net_type]['address_USDx']) }}
                                  >
                                    {'WITHDRAW'}
                                  </Button>
                                </div>
                              </div>
                            </React.Fragment>
                          }
                          {
                            (this.state.i_am_ready && !this.state.is_approved) &&
                            <div className='approve-section'>
                              <div className='enable-message'>
                                <FormattedMessage id='before_supplying_usdx' />
                              </div>
                              <div className={'button-wrapper'}>
                                <Button
                                  size='large'
                                  className={''}
                                  disabled={false}
                                  onClick={() => { handle_approve(this.state.USDx, this, address[this.state.net_type]['address_mMarket']) }}
                                >
                                  {'ENABLE'}
                                </Button>
                              </div>
                            </div>
                          }
                        </Tabs.TabPane>
                        {/* ***** ***** ***** withdraw ***** ***** ***** */}

                      </Tabs>
                    </div>

                    {/* ***** ***** ***** RecordBoard ***** ***** ***** */}
                    {
                      this.state.i_am_ready &&
                      <RecordBoard
                        account={this.state.my_account}
                        net_type={this.state.net_type}
                        decimal={this.state.USDx_decimals}
                        token={this.token_name}
                        load_new_history={this.state.load_new_history}
                        new_web3={this.new_web3}
                        mMarket={this.state.mMarket}
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

export default Supply_usdx;
