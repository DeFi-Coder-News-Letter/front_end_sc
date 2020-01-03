import React, { Component } from 'react';
import './App.scss';
import MediaQuery from 'react-responsive';
import { format_str_to_kmb } from './util.js';
// import { unmountComponentAtNode } from 'react-dom';
import { Button } from 'antd';
import Footer from './component/footer/footer';

// add i18n.
import { IntlProvider, FormattedMessage } from 'react-intl';
import en_US from './language/en_US.js';
import zh_CN from './language/zh_CN';

class AppNoWeb3 extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data: {},
      USDx_item: {},
      USDT_item: {},
      WETH_item: {},
      imBTC_item: {}
    }

    this.markets_api = 'https://api.lendf.me/v1/info?data=markets';
  }

  // format str_num to_K
  format_num_to_K = (str_num) => {
    // console.log(str_num);
    var part_a = str_num.split('.')[0];
    var part_b = str_num.split('.')[1]; // .substr(0,2)

    if (part_b.length > 2) {
      part_b = part_b.substr(0, 2);
    }

    var reg = /\d{1,3}(?=(\d{3})+$)/g;
    part_a = (part_a + '').replace(reg, '$&,');

    return part_a + '.' + part_b;
  }
  // format aprs
  format_APR = (str_num) => {
    // console.log(str_num);
    var index_num = str_num.indexOf('.') + 2;
    var cpmp_str = str_num.replace(/\./, '');
    var res_str = cpmp_str.slice(0, index_num) + '.' + cpmp_str.substr(index_num, 2);
    // console.log(Number(res_str))
    return Number(res_str);
  }
  // get total status
  get_markets = () => {
    // "0.00000120110112".slice(0, "0.00000120110112".indexOf('.')+3)
    fetch(this.markets_api)
      .then((res) => { return res.text() })
      .then((data) => {
        if (data) {
          var obj_data = JSON.parse(data);
          console.log(obj_data);
          obj_data.markets.map(item => {

            // supplyAPR: item.supplyAPR.slice(0, item.supplyAPR.indexOf('.') + 3),
            // borrowAPR: item.borrowAPR.slice(0, item.borrowAPR.indexOf('.') + 3)

            if (item.symbol === 'USDx') {
              this.setState({
                USDx_item: item
              })
            } else if (item.symbol === 'WETH') {
              this.setState({
                WETH_item: item
              })
            } else if (item.symbol === 'USDT') {
              this.setState({
                USDT_item: item
              })
            } else {
              this.setState({
                imBTC_item: item
              })
            }
          })
          // this.setState({ data: obj_data });
        }
      })
  }


  componentDidMount = () => {
    this.get_markets();

    this.timerID = setInterval(() => {
      this.get_markets();
    }, 15 * 1000);
  }


  componentWillUnmount = () => {
    clearInterval(this.timerID);
  }


  render() {
    return (
      <MediaQuery maxWidth={736}>
        {(match) => (
          <IntlProvider locale={'en'} messages={navigator.language === 'zh-CN' ? zh_CN : en_US} >
            <React.Fragment>
              <div className='top'>
                <div className='logo'>
                  <img className='logo-img' src='images/lendf_logo.svg' alt='' />
                </div>

                <div className='netstatus'>
                  <React.Fragment>
                    <div className='content-btn'>
                      <FormattedMessage id='connect' />
                    </div>
                  </React.Fragment>
                </div>

                <div className='Platform'>
                  <span className='Platform-title'>dForce Platform</span>
                  <span className='Platform-img'>
                    <img src='images/down.svg' alt='' />
                  </span>
                  <div className='Platform-fixed'>
                    <ul>
                      <li>
                        <a href='https://usdx.dforce.network/' target='_blank'>
                          <span className='img'>
                            <img src='images/USDx_li.svg' alt='' />
                          </span>
                          <span className='title'>USDx</span>
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className='clear'></div>
              </div>

              {/* <MyStatus data={this.props.data} /> */}
              <div className='header-new'>
                <div className='header-new-con'>
                  <div className='header-new-item supply-balance'>
                    <span className='item-title'>
                      <FormattedMessage id='supply_balance' />
                    </span>
                    <span className='item-num'>
                      {'···'}
                    </span>
                  </div>

                  <div className='header-new-item borrow-balance'>
                    <span className='item-title'>
                      <FormattedMessage id='borrow_balance' />
                    </span>
                    <span className='item-num item-num-borrow'>
                      {'···'}
                    </span>
                  </div>

                  <div className='header-new-item collate-rate'>
                    <span className='item-title'>
                      <FormattedMessage id='collateralization_ratio' />
                    </span>
                    <span className='item-num item-num-ratio'>
                      {'···'}
                    </span>
                  </div>
                </div>
              </div>

              <div className='card-wrap'>
                <div className='card card-margin-right'>
                  <div className='card-top'>
                    <div className='card-top-left'>
                      <img src={'images/Home_USDx.svg'} alt='' />
                      <span>USDx</span>
                    </div>
                    <div className='card-top-right'>
                      <span className='market'>
                        <FormattedMessage id='market_size' />
                      </span>
                      <span className='market-num'>
                        {this.state.USDx_item.grossSupplyUSD ? '$' + format_str_to_kmb(this.state.USDx_item.grossSupplyUSD) : '···'}
                      </span>
                    </div>
                  </div>
                  <div className='clear'></div>

                  <div className='card-center'>
                    <div className={'supply-apr'}>
                      <span className='apr'>
                        <FormattedMessage id='supply_APR' />
                      </span>
                      <span className='apr-num apr-num-left'>
                        {
                          this.state.USDx_item.supplyAPR ?
                            this.state.USDx_item.supplyAPR === '0.00' ? '<0.01%' : this.format_APR(this.state.USDx_item.supplyAPR) + '%'
                            :
                            '···'
                        }
                      </span>
                    </div>

                    <div className={'borrow-apr'}>
                      <span className='apr'>
                        <FormattedMessage id='borrow_APR' />
                      </span>
                      <span className='apr-num apr-num-center'>
                        {
                          this.state.USDx_item.borrowAPR ?
                            this.state.USDx_item.borrowAPR === '0.00' ? '<0.01%' : this.format_APR(this.state.USDx_item.borrowAPR) + '%'
                            :
                            '···'
                        }
                      </span>
                    </div>

                    <div className={'u-rate'}>
                      <span className='apr'>
                        <FormattedMessage id='utilization_Rate' />
                      </span>
                      <span className='apr-num apr-num-right'>
                        {this.state.USDx_item.utilizationRate ? this.state.USDx_item.utilizationRate + '%' : '···'}
                      </span>
                    </div>
                  </div>

                  <div className='card-bottom'>
                    <div className={'button-wrap-home'}>
                      <Button size='large' className={'disable-button'} disabled={false}>
                        <FormattedMessage id='SUPPLY' />
                      </Button>
                    </div>
                    <div className={'button-wrap-home-borrow deposit-first-wrap'}>
                      <Button size='large' className={'disable-button'} disabled={false}>
                        <FormattedMessage id='BORROW' />
                      </Button>
                    </div>
                  </div>
                </div>




                <div className='card'>
                  <div className='card-top'>
                    <div className='card-top-left'>
                      <img src={'images/Home_USDT.svg'} alt='' />
                      <span className='token-usdt'>USDT</span>
                    </div>
                    <div className='card-top-right'>
                      <span className='market'>
                        <FormattedMessage id='market_size' />
                      </span>
                      <span className='market-num'>
                        {this.state.USDT_item.grossSupplyUSD ? '$' + format_str_to_kmb(this.state.USDT_item.grossSupplyUSD) : '···'}
                      </span>
                    </div>
                  </div>
                  <div className='clear'></div>

                  <div className='card-center'>
                    <div className={'supply-apr'}>
                      <span className='apr'>
                        <FormattedMessage id='supply_APR' />
                      </span>
                      <span className='apr-num apr-num-left'>
                        {
                          this.state.USDT_item.supplyAPR ?
                            this.state.USDT_item.supplyAPR === '0.00' ? '<0.01%' : this.format_APR(this.state.USDT_item.supplyAPR) + '%'
                            :
                            '···'
                        }
                      </span>
                    </div>

                    <div className={'borrow-apr'}>
                      <span className='apr'>
                        <FormattedMessage id='borrow_APR' />
                      </span>
                      <span className='apr-num apr-num-center'>
                        {
                          this.state.USDT_item.borrowAPR ?
                            this.state.USDT_item.borrowAPR === '0.00' ? '<0.01%' : this.format_APR(this.state.USDT_item.borrowAPR) + '%'
                            :
                            '···'
                        }
                      </span>
                    </div>

                    <div className={'u-rate'}>
                      <span className='apr'>
                        <FormattedMessage id='utilization_Rate' />
                      </span>
                      <span className='apr-num apr-num-right'>
                        {this.state.USDT_item.utilizationRate ? this.state.USDT_item.utilizationRate + '%' : '···'}
                      </span>
                    </div>
                  </div>

                  <div className='card-bottom'>
                    <div className={'button-wrap-home'}>
                      <Button size='large' className={'disable-button'} disabled={false}>
                        <FormattedMessage id='SUPPLY' />
                      </Button>
                    </div>
                    <div className={'button-wrap-home-borrow deposit-first-wrap'}>
                      <Button size='large' className={'disable-button'} disabled={false}>
                        <FormattedMessage id='BORROW' />
                      </Button>
                    </div>
                  </div>
                </div>




                <div className='card card-margin-right'>
                  <div className='card-top'>
                    <div className='card-top-left'>
                      <img src={'images/Home_WETH.svg'} alt='' />
                      <span className='token-weth'>WETH</span>
                    </div>
                    <div className='card-top-right'>
                      <span className='market'>
                        <FormattedMessage id='market_size' />
                      </span>
                      <span className='market-num'>
                        {this.state.WETH_item.grossSupplyUSD ? '$' + format_str_to_kmb(this.state.WETH_item.grossSupplyUSD) : '···'}
                      </span>
                    </div>
                  </div>
                  <div className='clear'></div>

                  <div className='card-center'>
                    <div className={'supply-apr'}>
                      <span className='apr'>
                        <FormattedMessage id='supply_APR' />
                      </span>
                      <span className='apr-num apr-num-left'>
                        {
                          this.state.WETH_item.supplyAPR ?
                            this.state.WETH_item.supplyAPR === '0.00' ? '<0.01%' : this.format_APR(this.state.WETH_item.supplyAPR) + '%'
                            :
                            '···'
                        }
                      </span>
                    </div>

                    <div className={'borrow-apr'}>
                      <span className='apr'>
                        <FormattedMessage id='borrow_APR' />
                      </span>
                      <span className='apr-num apr-num-center'>
                        {
                          this.state.WETH_item.borrowAPR ?
                            this.state.WETH_item.borrowAPR === '0.00' ? '<0.01%' : this.format_APR(this.state.WETH_item.borrowAPR) + '%'
                            :
                            '···'
                        }
                      </span>
                    </div>

                    <div className={'u-rate'}>
                      <span className='apr'>
                        <FormattedMessage id='utilization_Rate' />
                      </span>
                      <span className='apr-num apr-num-right'>
                        {this.state.WETH_item.utilizationRate ? this.state.WETH_item.utilizationRate + '%' : '···'}
                      </span>
                    </div>
                  </div>

                  <div className='card-bottom'>
                    <div className={'button-wrap-home'}>
                      <Button size='large' className={'disable-button'} disabled={false}>
                        <FormattedMessage id='SUPPLY' />
                      </Button>
                    </div>
                    <div className={'button-wrap-home-borrow deposit-first-wrap'}>
                      <Button size='large' className={'disable-button'} disabled={false}>
                        <FormattedMessage id='BORROW' />
                      </Button>
                    </div>
                  </div>
                </div>



                <div className='card card-special'>
                  <div className='card-top'>
                    <div className='card-top-left'>
                      <img src={'images/Home_imBTC.svg'} alt='' />
                      <span className='token-imbtc'>imBTC</span>
                    </div>
                    <div className='card-top-right'>
                      <span className='market'>
                        <FormattedMessage id='market_size' />
                      </span>
                      <span className='market-num'>
                        {this.state.imBTC_item.grossSupplyUSD ? '$' + format_str_to_kmb(this.state.imBTC_item.grossSupplyUSD) : '···'}
                      </span>
                    </div>
                  </div>
                  <div className='clear'></div>

                  <div className='card-center'>
                    <div className={'supply-apr'}>
                      <span className='apr'>
                        <FormattedMessage id='supply_APR' />
                      </span>
                      <span className='apr-num apr-num-left'>
                        {
                          this.state.imBTC_item.supplyAPR ?
                            this.state.imBTC_item.supplyAPR === '0.00' ? '<0.01%' : this.format_APR(this.state.imBTC_item.supplyAPR) + '%'
                            :
                            '···'
                        }
                      </span>
                    </div>
                    <div className={'borrow-apr'}>
                      <span className='apr'>
                        <FormattedMessage id='borrow_APR' />
                      </span>
                      <span className='apr-num apr-num-center'>
                        {
                          this.state.imBTC_item.borrowAPR ?
                            this.state.imBTC_item.borrowAPR === '0.00' ? '<0.01%' : this.format_APR(this.state.imBTC_item.borrowAPR) + '%'
                            :
                            '···'
                        }
                      </span>
                    </div>
                    <div className={'u-rate'}>
                      <span className='apr'>
                        <FormattedMessage id='utilization_Rate' />
                      </span>
                      <span className='apr-num apr-num-right'>
                        {this.state.imBTC_item.utilizationRate ? this.state.imBTC_item.utilizationRate + '%' : '···'}
                      </span>
                    </div>
                  </div>

                  <div className='card-bottom'>
                    <div className={'button-wrap-home'}>
                      <Button size='large' className={'disable-button'} disabled={false}>
                        <FormattedMessage id='SUPPLY' />
                      </Button>
                    </div>
                    <div className={'button-wrap-home-borrow deposit-first-wrap'}>
                      <Button size='large' className={'disable-button'} disabled={false}>
                        <FormattedMessage id='BORROW' />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className='clear'></div>

                <Footer />

              </div>
            </React.Fragment>
          </IntlProvider>
        )}
      </MediaQuery>
    );
  }
}

export default AppNoWeb3;
