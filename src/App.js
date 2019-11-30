import React, { Component } from 'react';
import './App.scss';
import { Alert } from 'antd';
import { Route, Switch } from "react-router-dom";
import MediaQuery from 'react-responsive';


import Home from './pages/home/home';
import Web3 from 'web3';


import Supply_usdx from './pages/supply/supply-usdx';
import Supply_usdt from './pages/supply/supply-usdt';
import Supply_imbtc from './pages/supply/supply-imbtc';
import Supply_weth from './pages/supply/supply-weth';

import Borrow_usdx from './pages/borrow/borrow-usdx';
import Borrow_usdt from './pages/borrow/borrow-usdt';
import Borrow_weth from './pages/borrow/borrow-weth';
import Borrow_imbtc from './pages/borrow/borrow-imbtc';

import { findNetwork, saveLoginStatus, getLoginStatusKey, getPercentageFormat, get_tokens_decimals, format_bn } from './util.js';

const mainnetOrRinkebyIconAlert = <img style={{ margin: 'auto' }} src={`images/alert_icon.png`} alt="" />;
const noteIconAlert = <img style={{ margin: 'auto' }} src={`images/note_alert.png`} alt="" />;

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



                }
              }, 100)
            })
          })
        })
      }
    )

  }





  get_my_status = () => {
    this.state.mMarket.methods.calculateAccountValues(this.state.my_account).call().then(res_account => {
      this.state.mMarket.methods.assetPrices(address[this.state.net_type]['address_USDx']).call().then(res_usdx_price => {
        // res_account[1] supply
        // res_account[2] borrow
        let supply = this.bn(res_account[1]).div(this.bn(res_usdx_price))
        let borrow = this.bn(res_account[2]).div(this.bn(res_usdx_price))

        // console.log(num.toString())

        supply = format_bn(supply, 18, 2);
        borrow = format_bn(borrow, 18, 2);

        this.setState({
          my_supply: supply,
          my_borrow: borrow
        })
      })
    })
  }



  get_4_tokens_status = () => {
    // get usdx_price first.
    this.state.mMarket.methods.assetPrices(address[this.state.net_type]['address_USDx']).call().then(res_usdx_price => {
      this.setState({ usdx_price: res_usdx_price }, () => {
        // console.log('res_usdx_price: ', this.state.usdx_price);


        // get_usdx_status
        this.state.mMarket.methods.markets(address[this.state.net_type]['address_USDx']).call().then(res_usdx_markets => {
          // console.log(res_usdx_markets);
          this.setState({
            usdx_total_supply: format_bn(this.bn(res_usdx_markets.totalSupply).toString(), this.state.USDx_decimals, this.decimal_precision),
            usdx_supply_APR: format_bn(this.bn(res_usdx_markets.supplyRateMantissa).mul(this.bn(2102400)).toString(), 16, this.decimal_precision),
            usdx_borrow_APR: format_bn(this.bn(res_usdx_markets.borrowRateMantissa).mul(this.bn(2102400)).toString(), 16, this.decimal_precision),
            usdx_u_rate: format_bn(this.bn(res_usdx_markets.totalBorrows).mul(this.bn(10 ** this.state.USDx_decimals)).div(this.bn(res_usdx_markets.totalSupply)).toString(), this.state.USDx_decimals - 2, this.decimal_precision)
          });

          this.state.mMarket.methods.getSupplyBalance(this.state.my_account, address[this.state.net_type]['address_USDx']).call().then(res_my_supply_usdx => {
            // console.log(res_my_supply_usdx);
            if (this.bn(res_my_supply_usdx).gt(this.bn('0'))) {
              this.setState({ i_have_supply_usdx: true });
              return false;
            } else {
              this.setState({ i_have_supply_usdx: false });
            }

            this.state.mMarket.methods.getBorrowBalance(this.state.my_account, address[this.state.net_type]['address_USDx']).call().then(res_my_borrow_usdx => {
              // console.log(res_my_borrow_usdx);
              if (this.bn(res_my_borrow_usdx).gt(this.bn('0'))) {
                this.setState({ i_have_borrow_usdx: true });
                return false;
              } else {
                this.setState({ i_have_borrow_usdx: false });
              }
            })
          })
        })





        // get_usdt_status
        this.state.mMarket.methods.markets(address[this.state.net_type]['address_USDT']).call().then(res_usdt_markets => {
          // console.log('res_usdt_markets: ', res_usdt_markets);
          this.setState({
            usdt_total_supply: format_bn(this.bn(res_usdt_markets.totalSupply).toString(), this.state.USDT_decimals, this.decimal_precision),
            usdt_supply_APR: format_bn(this.bn(res_usdt_markets.supplyRateMantissa).mul(this.bn(2102400)).toString(), 16, this.decimal_precision),
            usdt_borrow_APR: format_bn(this.bn(res_usdt_markets.borrowRateMantissa).mul(this.bn(2102400)).toString(), 16, this.decimal_precision),
            usdt_u_rate: format_bn(this.bn(res_usdt_markets.totalBorrows).mul(this.bn(10 ** this.state.USDT_decimals)).div(this.bn(res_usdt_markets.totalSupply)).toString(), this.state.USDT_decimals - 2, this.decimal_precision)
          });

          this.state.mMarket.methods.getSupplyBalance(this.state.my_account, address[this.state.net_type]['address_USDT']).call().then(res_my_supply_usdt => {
            // console.log(res_my_supply_usdt);
            if (this.bn(res_my_supply_usdt).gt(this.bn('0'))) {
              this.setState({ i_have_supply_usdt: true });
              return false;
            } else {
              this.setState({ i_have_supply_usdt: false });
            }

            this.state.mMarket.methods.getBorrowBalance(this.state.my_account, address[this.state.net_type]['address_USDT']).call().then(res_my_borrow_usdt => {
              // console.log(res_my_borrow_usdt);
              if (this.bn(res_my_borrow_usdt).gt(this.bn('0'))) {
                this.setState({ i_have_borrow_usdt: true });
                return false;
              } else {
                this.setState({ i_have_borrow_usdt: false });
              }
            })
          })
        })






        // get_imbtc_status
        this.state.mMarket.methods.markets(address[this.state.net_type]['address_imBTC']).call().then(res_imbtc_markets => {
          // console.log(res_imbtc_markets);
          this.setState({
            imbtc_total_supply: format_bn(this.bn(res_imbtc_markets.totalSupply).toString(), this.state.imBTC_decimals, this.decimal_precision),
            imbtc_supply_APR: format_bn(this.bn(res_imbtc_markets.supplyRateMantissa).mul(this.bn(2102400)).toString(), 16, this.decimal_precision),
            imbtc_borrow_APR: format_bn(this.bn(res_imbtc_markets.borrowRateMantissa).mul(this.bn(2102400)).toString(), 16, this.decimal_precision),
            imbtc_u_rate: format_bn(this.bn(res_imbtc_markets.totalBorrows).mul(this.bn(10 ** this.state.imBTC_decimals)).div(this.bn(res_imbtc_markets.totalSupply)).toString(), this.state.imBTC_decimals - 2, this.decimal_precision)
          });

          this.state.mMarket.methods.getSupplyBalance(this.state.my_account, address[this.state.net_type]['address_imBTC']).call().then(res_my_supply_imbtc => {
            // console.log(res_my_supply_imbtc);
            if (this.bn(res_my_supply_imbtc).gt(this.bn('0'))) {
              this.setState({ i_have_supply_imbtc: true });
              return false;
            } else {
              this.setState({ i_have_supply_imbtc: false });
            }

            this.state.mMarket.methods.getBorrowBalance(this.state.my_account, address[this.state.net_type]['address_imBTC']).call().then(res_my_borrow_imbtc => {
              // console.log(res_my_borrow_imbtc);
              if (this.bn(res_my_borrow_imbtc).gt(this.bn('0'))) {
                this.setState({ i_have_borrow_imbtc: true });
                return false;
              } else {
                this.setState({ i_have_borrow_imbtc: false });
              }
            })
          })
        })




        // get_weth_status
        this.state.mMarket.methods.markets(address[this.state.net_type]['address_WETH']).call().then(res_weth_markets => {
          // console.log(res_weth_markets);
          this.setState({
            weth_total_supply: format_bn(this.bn(res_weth_markets.totalSupply).toString(), this.state.WETH_decimals, this.decimal_precision),
            weth_supply_APR: format_bn(this.bn(res_weth_markets.supplyRateMantissa).mul(this.bn(2102400)).toString(), 16, this.decimal_precision),
            weth_borrow_APR: format_bn(this.bn(res_weth_markets.borrowRateMantissa).mul(this.bn(2102400)).toString(), 16, this.decimal_precision),
            weth_u_rate: format_bn(this.bn(res_weth_markets.totalBorrows).mul(this.bn(10 ** this.state.WETH_decimals)).div(this.bn(res_weth_markets.totalSupply)).toString(), this.state.WETH_decimals - 2, this.decimal_precision)
          });

          this.state.mMarket.methods.getSupplyBalance(this.state.my_account, address[this.state.net_type]['address_WETH']).call().then(res_my_supply_weth => {
            // console.log(res_my_supply_weth);
            if (this.bn(res_my_supply_weth).gt(this.bn('0'))) {
              this.setState({ i_have_supply_weth: true });
              return false;
            } else {
              this.setState({ i_have_supply_weth: false });
            }

            this.state.mMarket.methods.getBorrowBalance(this.state.my_account, address[this.state.net_type]['address_WETH']).call().then(res_my_borrow_weth => {
              // console.log(res_my_borrow_weth);
              if (this.bn(res_my_borrow_weth).gt(this.bn('0'))) {
                this.setState({ i_have_borrow_weth: true });
                return false;
              } else {
                this.setState({ i_have_borrow_weth: false });
              }
            })
          })
        })



      })
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
    }, 3000)
  }




  render() {
    return (
      <MediaQuery maxWidth={736}>
        {(match) => (
          <Switch>
            <React.Fragment>
              <div className="App">
                <div className="App-header">
                  {/* <Alert message="Lendf.me is currently only available on Mainnet or the Rinkeby Testnet." type="error" onClose='' icon={mainnetOrRinkebyIconAlert} showIcon /> */}
                  {/* <Alert message="Note: You are currently connected to the Rinkeby Testnet" type="informational" onClose='' className='informational-banner' icon={noteIconAlert} showIcon /> */}

                  <Route exact path="/" render={() => <Home data={this.state} />} />

                  <Route path="/supply-usdx" render={() => <Supply_usdx />} />
                  <Route path="/supply-usdt" render={() => <Supply_usdt />} />
                  <Route path="/supply-imbtc" render={() => <Supply_imbtc />} />
                  <Route path="/supply-weth" render={() => <Supply_weth />} />

                  <Route path="/borrow-usdx" render={() => <Borrow_usdx />} />
                  <Route path="/borrow-usdt" render={() => <Borrow_usdt />} />
                  <Route path="/borrow-imbtc" render={() => <Borrow_imbtc />} />
                  <Route path="/borrow-weth" render={() => <Borrow_weth />} />
                </div>
              </div>
            </React.Fragment>
          </Switch>
        )}
      </MediaQuery>
    );
  }
}

export default App;
