import React, { Component } from 'react';
import './App.scss';
// import { Alert } from 'antd';
import { Route, Switch } from "react-router-dom";
import MediaQuery from 'react-responsive';

import Home from './pages/home/home';
import Web3 from 'web3';

import SupplyUSDx from './pages/supply/supply-usdx';
import SupplyUSDT from './pages/supply/supply-usdt';
import SupplyimBTC from './pages/supply/supply-imbtc';
import SupplyWETH from './pages/supply/supply-weth';

import BorrowUSDx from './pages/borrow/borrow-usdx';
import BorrowUSDT from './pages/borrow/borrow-usdt';
import BorrowWETH from './pages/borrow/borrow-weth';
import BorrowimBTC from './pages/borrow/borrow-imbtc';

import { get_tokens_decimals, format_bn } from './util.js';


// tokens ABIs
let USDx_abi = require('./ABIs/USDX_ABI.json');
let WETH_abi = require('./ABIs/WETH_ABI.json');
let imBTC_abi = require('./ABIs/imBTC_ABI.json');
let USDT_abi = require('./ABIs/USDT_ABI.json');
let mMarket_abi = require('./ABIs/moneyMarket.json');
// tokens address
let address = require('./ABIs/address_map.json');
// 常量
let constant = require('./ABIs/constant.json');

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      my_supply: null,
      my_borrow: null
    }

    // return false; 
    this.new_web3 = window.new_web3 = new Web3(Web3.givenProvider || null);
    this.bn = this.new_web3.utils.toBN;

    this.decimal_precision = constant.decimal_precision;
    this.gas_limit_coefficient = constant.gas_limit_coefficient;
    this.collateral_rate = constant.collateral_rate;
    this.originationFee = constant.originationFee;

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

              let timer_Next = setInterval(() => {
                if (!(this.state.USDx_decimals && this.state.WETH_decimals && this.state.imBTC_decimals && this.state.USDT_decimals)) {
                  console.log('111111111: not get yet...');
                } else {
                  console.log('2222222222: i got it...');
                  clearInterval(timer_Next);
                  this.setState({ i_am_ready: true })
                  // to do something...
                  this.get_my_status();
                  this.get_4_tokens_status();
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
        this.setState({
          my_account: accounts[0],
          i_have_supply_usdx: false,
          i_have_supply_usdt: false,
          i_have_supply_imbtc: false,
          i_have_supply_weth: false,
          i_have_borrow_usdx: false,
          i_have_borrow_usdt: false,
          i_have_borrow_imbtc: false,
          i_have_borrow_weth: false
        }, async () => {
          console.log('connected: ', this.state.my_account)
          let timer_Next = setInterval(() => {
            if (!(this.state.USDx_decimals && this.state.WETH_decimals && this.state.imBTC_decimals && this.state.USDT_decimals)) {
              console.log('111111111: not get yet...');
            } else {
              console.log('2222222222: i got it...');
              clearInterval(timer_Next);
              this.setState({ i_am_ready: true })
              // to do something...
              this.get_my_status();
              this.get_4_tokens_status();
            }
          }, 100)
        })
      });
    }
  }





  get_my_status = () => {
    this.state.mMarket.methods.calculateAccountValues(this.state.my_account).call().then(res_account => {
      this.state.mMarket.methods.assetPrices(address[this.state.net_type]['address_USDx']).call().then(res_usdx_price => {
        // res_account[1] supply
        // res_account[2] borrow
        if (res_usdx_price !== '0') {
          let supply = this.bn(res_account[1]).div(this.bn(res_usdx_price))
          let borrow = this.bn(res_account[2]).div(this.bn(res_usdx_price))

          // console.log(num.toString())

          supply = format_bn(supply, 18, 2);
          borrow = format_bn(borrow, 18, 2);

          this.setState({
            my_supply: supply,
            my_borrow: borrow
          })
        }
      })
    })
  }



  get_4_tokens_status = () => {
    // get usdx_price first. ( - weth )
    this.state.mMarket.methods.assetPrices(address[this.state.net_type]['address_USDx']).call().then(res_usdx_price => {
      if (res_usdx_price !== '0') {
        this.setState({ usdx_price: res_usdx_price }, () => {



          // imBTC get_imbtc_status
          this.state.mMarket.methods.assetPrices(address[this.state.net_type]['address_imBTC']).call().then(res_imbtc_price => {
            this.state.mMarket.methods.markets(address[this.state.net_type]['address_imBTC']).call().then(res_imbtc_markets => {
              this.state.imBTC.methods.balanceOf(address[this.state.net_type]['address_mMarket']).call((err, res_cash) => {
                // console.log(res_imbtc_markets);
                var imbtc_t_supply = this.bn(res_imbtc_markets.totalSupply).mul(this.bn(res_imbtc_price)).div(this.bn(res_usdx_price));
                var t_price = this.bn(res_imbtc_price).div(this.bn(res_usdx_price));

                var t_u_rate;
                if (this.bn(res_imbtc_markets.totalBorrows).add(this.bn(res_cash)).toString() === '0') {
                  t_u_rate = '0.00%';
                } else {
                  t_u_rate = this.bn(res_imbtc_markets.totalBorrows).mul(this.bn(10 ** this.state.imBTC_decimals)).div(this.bn(res_imbtc_markets.totalBorrows).add(this.bn(res_cash)));
                }

                this.setState({
                  imbtc_price: format_bn(t_price, this.state.USDx_decimals - this.state.imBTC_decimals, 2),
                  imbtc_total_supply: format_bn(imbtc_t_supply.toString(), 18, this.decimal_precision),
                  imbtc_supply_APR: format_bn(this.bn(res_imbtc_markets.supplyRateMantissa).mul(this.bn(2102400)).toString(), 16, this.decimal_precision),
                  imbtc_borrow_APR: format_bn(this.bn(res_imbtc_markets.borrowRateMantissa).mul(this.bn(2102400)).toString(), 16, this.decimal_precision),
                  imbtc_u_rate: format_bn(t_u_rate, this.state.imBTC_decimals - 2, this.decimal_precision) + '%'
                });

                this.state.mMarket.methods.getSupplyBalance(this.state.my_account, address[this.state.net_type]['address_imBTC']).call().then(res_my_supply_imbtc => {
                  // console.log(res_my_supply_imbtc);
                  if (this.bn(res_my_supply_imbtc).gt(this.bn('0'))) {
                    this.setState({ i_have_supply_imbtc: true, my_supply_imbtc: format_bn(res_my_supply_imbtc, this.state.imBTC_decimals, 2) });
                    return false;
                  } else {
                    this.setState({ i_have_supply_imbtc: false });
                  }

                  this.state.mMarket.methods.getBorrowBalance(this.state.my_account, address[this.state.net_type]['address_imBTC']).call().then(res_my_borrow_imbtc => {
                    // console.log(res_my_borrow_imbtc);
                    if (this.bn(res_my_borrow_imbtc).gt(this.bn('0'))) {
                      this.setState({ i_have_borrow_imbtc: true, my_borrow_imbtc: format_bn(res_my_borrow_imbtc, this.state.imBTC_decimals, 2) });
                      return false;
                    } else {
                      this.setState({ i_have_borrow_imbtc: false });
                    }
                  })
                })
              })
            })
          })



          // USDT get_USDT_status
          this.state.mMarket.methods.assetPrices(address[this.state.net_type]['address_USDT']).call().then(res_usdt_price => {
            this.state.mMarket.methods.markets(address[this.state.net_type]['address_USDT']).call().then(res_usdt_markets => {
              this.state.USDT.methods.balanceOf(address[this.state.net_type]['address_mMarket']).call((err, res_cash) => {
                // console.log('res_usdt_markets: ', res_usdt_markets);
                var usdt_t_supply = this.bn(res_usdt_markets.totalSupply).mul(this.bn(res_usdt_price)).div(this.bn(res_usdx_price));
                var t_price = this.bn(res_usdt_price).div(this.bn(res_usdx_price));

                var t_u_rate;
                if (this.bn(res_usdt_markets.totalBorrows).add(this.bn(res_cash)).toString() === '0') {
                  t_u_rate = '0.00%';
                } else if (Number(format_bn(this.bn(res_usdt_markets.totalBorrows).mul(this.bn(10 ** this.state.USDT_decimals)).div(this.bn(res_usdt_markets.totalBorrows).add(this.bn(res_cash))).toString(), this.state.USDT_decimals - 2, this.decimal_precision + 4)) < 0.01) {
                  t_u_rate = '<0.01%';
                } else {
                  t_u_rate = format_bn(this.bn(res_usdt_markets.totalBorrows).mul(this.bn(10 ** this.state.USDT_decimals)).div(this.bn(res_usdt_markets.totalBorrows).add(this.bn(res_cash))).toString(), this.state.USDT_decimals - 2, this.decimal_precision) + '%';
                }

                this.setState({
                  usdt_price: format_bn(t_price, this.state.USDx_decimals - this.state.USDT_decimals, 2),
                  usdt_total_supply: format_bn(usdt_t_supply.toString(), 18, this.decimal_precision),
                  usdt_supply_APR: format_bn(this.bn(res_usdt_markets.supplyRateMantissa).mul(this.bn(2102400)).toString(), 16, this.decimal_precision),
                  usdt_borrow_APR: format_bn(this.bn(res_usdt_markets.borrowRateMantissa).mul(this.bn(2102400)).toString(), 16, this.decimal_precision),
                  usdt_u_rate: t_u_rate
                });

                this.state.mMarket.methods.getSupplyBalance(this.state.my_account, address[this.state.net_type]['address_USDT']).call().then(res_my_supply_usdt => {
                  // console.log(res_my_supply_usdt);
                  if (this.bn(res_my_supply_usdt).gt(this.bn('0'))) {
                    this.setState({ i_have_supply_usdt: true, my_supply_usdt: format_bn(res_my_supply_usdt, this.state.USDT_decimals, 2) });
                    return false;
                  } else {
                    this.setState({ i_have_supply_usdt: false });
                  }

                  this.state.mMarket.methods.getBorrowBalance(this.state.my_account, address[this.state.net_type]['address_USDT']).call().then(res_my_borrow_usdt => {
                    // console.log(res_my_borrow_usdt);
                    if (this.bn(res_my_borrow_usdt).gt(this.bn('0'))) {
                      this.setState({ i_have_borrow_usdt: true, my_borrow_usdt: format_bn(res_my_borrow_usdt, this.state.USDT_decimals, 2) });
                      return false;
                    } else {
                      this.setState({ i_have_borrow_usdt: false });
                    }
                  })
                })
              })
            })
          })



          // get_usdx_status
          this.state.mMarket.methods.markets(address[this.state.net_type]['address_USDx']).call().then(res_usdx_markets => {
            this.state.USDx.methods.balanceOf(address[this.state.net_type]['address_mMarket']).call((err, res_cash) => {
              // console.log(res_usdx_markets);

              var t_u_rate;
              if (this.bn(res_usdx_markets.totalBorrows).add(this.bn(res_cash)).toString() === '0') {
                t_u_rate = '0.00%';
              } else if (Number(format_bn(this.bn(res_usdx_markets.totalBorrows).mul(this.bn(10 ** this.state.USDx_decimals)).div(this.bn(res_usdx_markets.totalBorrows).add(this.bn(res_cash))).toString(), this.state.USDx_decimals - 2, this.decimal_precision + 4)) < 0.01) {
                t_u_rate = '<0.01%';
              } else {
                t_u_rate = format_bn(this.bn(res_usdx_markets.totalBorrows).mul(this.bn(10 ** this.state.USDx_decimals)).div(this.bn(res_usdx_markets.totalBorrows).add(this.bn(res_cash))).toString(), this.state.USDx_decimals - 2, this.decimal_precision) + '%';
              }

              this.setState({
                usdx_total_supply: format_bn(this.bn(res_usdx_markets.totalSupply).toString(), this.state.USDx_decimals, this.decimal_precision),
                usdx_supply_APR: format_bn(this.bn(res_usdx_markets.supplyRateMantissa).mul(this.bn(2102400)).toString(), 16, this.decimal_precision),
                usdx_borrow_APR: format_bn(this.bn(res_usdx_markets.borrowRateMantissa).mul(this.bn(2102400)).toString(), 16, this.decimal_precision),
                usdx_u_rate: t_u_rate
              });

              this.state.mMarket.methods.getSupplyBalance(this.state.my_account, address[this.state.net_type]['address_USDx']).call().then(res_my_supply_usdx => {
                // console.log(res_my_supply_usdx);
                if (this.bn(res_my_supply_usdx).gt(this.bn('0'))) {
                  this.setState({ i_have_supply_usdx: true, my_supply_usdx: format_bn(res_my_supply_usdx, this.state.USDx_decimals, 2) });
                  return false;
                } else {
                  this.setState({ i_have_supply_usdx: false });
                }

                this.state.mMarket.methods.getBorrowBalance(this.state.my_account, address[this.state.net_type]['address_USDx']).call().then(res_my_borrow_usdx => {
                  // console.log(res_my_borrow_usdx);
                  if (this.bn(res_my_borrow_usdx).gt(this.bn('0'))) {
                    this.setState({ i_have_borrow_usdx: true, my_borrow_usdx: format_bn(res_my_borrow_usdx, this.state.USDx_decimals, 2) });
                    return false;
                  } else {
                    this.setState({ i_have_borrow_usdx: false });
                  }
                })
              })
            })
          })



          // WETH get_WETH_status
          this.state.mMarket.methods.assetPrices(address[this.state.net_type]['address_WETH']).call().then(res_weth_price => {
            this.state.mMarket.methods.markets(address[this.state.net_type]['address_WETH']).call().then(res_weth_markets => {
              this.state.WETH.methods.balanceOf(address[this.state.net_type]['address_mMarket']).call((err, res_cash) => {
                // console.log(res_weth_markets);
                var weth_t_supply = this.bn(res_weth_markets.totalSupply).mul(this.bn(res_weth_price)).div(this.bn(res_usdx_price));
                var t_price = this.bn(res_weth_price).mul(this.bn(100)).div(this.bn(res_usdx_price));

                var t_u_rate;
                if (this.bn(res_weth_markets.totalBorrows).add(this.bn(res_cash)).toString() === '0') {
                  t_u_rate = '0.00%';
                } else if (Number(format_bn(this.bn(res_weth_markets.totalBorrows).mul(this.bn(10 ** this.state.WETH_decimals)).div(this.bn(res_weth_markets.totalBorrows).add(this.bn(res_cash))).toString(), this.state.WETH_decimals - 2, this.decimal_precision + 4)) < 0.01) {
                  t_u_rate = '<0.01%';
                } else {
                  t_u_rate = format_bn(this.bn(res_weth_markets.totalBorrows).mul(this.bn(10 ** this.state.WETH_decimals)).div(this.bn(res_weth_markets.totalBorrows).add(this.bn(res_cash))).toString(), this.state.WETH_decimals - 2, this.decimal_precision) + '%';
                }

                this.setState({
                  weth_price: format_bn(t_price, this.state.USDx_decimals - this.state.WETH_decimals + 2, 2),
                  weth_total_supply: format_bn(weth_t_supply.toString(), 18, this.decimal_precision),
                  weth_supply_APR: format_bn(this.bn(res_weth_markets.supplyRateMantissa).mul(this.bn(2102400)).toString(), 16, this.decimal_precision),
                  weth_borrow_APR: format_bn(this.bn(res_weth_markets.borrowRateMantissa).mul(this.bn(2102400)).toString(), 16, this.decimal_precision),
                  weth_u_rate: t_u_rate
                });

                this.state.mMarket.methods.getSupplyBalance(this.state.my_account, address[this.state.net_type]['address_WETH']).call().then(res_my_supply_weth => {
                  // console.log(res_my_supply_weth);
                  if (this.bn(res_my_supply_weth).gt(this.bn('0'))) {
                    this.setState({ i_have_supply_weth: true, my_supply_weth: format_bn(res_my_supply_weth, this.state.WETH_decimals, 2) });
                    return false;
                  } else {
                    this.setState({ i_have_supply_weth: false });
                  }

                  this.state.mMarket.methods.getBorrowBalance(this.state.my_account, address[this.state.net_type]['address_WETH']).call().then(res_my_borrow_weth => {
                    // console.log(res_my_borrow_weth);
                    if (this.bn(res_my_borrow_weth).gt(this.bn('0'))) {
                      this.setState({ i_have_borrow_weth: true, my_borrow_weth: format_bn(res_my_borrow_weth, this.state.WETH_decimals, 2) });
                      return false;
                    } else {
                      this.setState({ i_have_borrow_weth: false });
                    }
                  })
                })
              })
            })
          })




        })
      }
    })
  }





  componentDidMount = () => {
    this.timer_get_data = setInterval(() => {
      if (!this.state.my_account) {
        console.log('account not ailableav')
        return false;
      }
      this.get_my_status();
      this.get_4_tokens_status();
    }, 1000 * 5)
  }




  render() {
    return (
      <MediaQuery maxWidth={736}>
        {(match) => (
          <Switch>
            <React.Fragment>
              <div className="App">
                <Route exact path="/" render={() => <Home data={this.state} />} />

                <Route path="/supply-usdx" render={() => <SupplyUSDx data={this.state} />} />
                <Route path="/supply-usdt" render={() => <SupplyUSDT data={this.state} />} />
                <Route path="/supply-imbtc" render={() => <SupplyimBTC data={this.state} />} />
                <Route path="/supply-weth" render={() => <SupplyWETH data={this.state} />} />

                <Route path="/borrow-usdx" render={() => <BorrowUSDx data={this.state} />} />
                <Route path="/borrow-usdt" render={() => <BorrowUSDT data={this.state} />} />
                <Route path="/borrow-imbtc" render={() => <BorrowimBTC data={this.state} />} />
                <Route path="/borrow-weth" render={() => <BorrowWETH data={this.state} />} />
              </div>
            </React.Fragment>
          </Switch>
        )}
      </MediaQuery>
    );
  }
}

export default App;
