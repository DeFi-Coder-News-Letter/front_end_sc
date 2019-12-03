import React, { Component } from 'react';
import { Link } from "react-router-dom";
// import MediaQuery from 'react-responsive';
import { Tabs, Button, Input } from 'antd';
import './home.scss';

import { format_str_to_kmb, format_num_to_K } from '../../util.js';

// add i18n.
import { IntlProvider, FormattedMessage } from 'react-intl';
import en_US from '../../language/en_US.js';
import zh_CN from '../../language/zh_CN';

import My_status from '../../component/header/my-status';



class Home extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount = () => { }






    render() {
        var t_class = 'net-span';
        var t_net = '';

        if (this.props.data) {
            if (this.props.data.net_type === 'main') {
                t_class = t_class + ' main-span';
                t_net = 'Main';
            }
            if (this.props.data.net_type === 'rinkeby') {
                t_class = t_class + ' rinkeby-span';
                t_net = 'Rinkeby';
            }
        }

        return (
            <IntlProvider locale={'en'} messages={navigator.language === 'zh-CN' ? zh_CN : en_US} >
                <React.Fragment>
                    <div className='top'>
                        <div className='logo'>
                            <img className='logo-img' src='images/lendf_logo.svg' />
                        </div>
                        <div className='netstatus'>
                            <div className='netstatus-top'>
                                <span className={t_class}></span>
                                {t_net}
                            </div>
                            <div className='netstatus-bm'>
                                <span className='account-span'>
                                    {this.props.data.my_account ? this.props.data.my_account.substring(0, 4) + '...' + this.props.data.my_account.substring(this.props.data.my_account.length - 6) : '···'}
                                </span>
                            </div>
                        </div>
                        <div className='clear'></div>
                    </div>



                    <div className='card-wrap'>

                        <My_status data={this.props.data} />

                        <div className='card card-margin-right'>
                            <div className='card-top'>
                                <div className='card-top-left'>
                                    <img src={'images/Home_USDx.svg'} />
                                    <span>USDx</span>
                                </div>
                                <div className='card-top-right'>
                                    <span className='market'>
                                        <FormattedMessage id='market_size' />
                                    </span>
                                    <span className='market-num'>
                                        {this.props.data.usdx_total_supply ? '$' + format_str_to_kmb(this.props.data.usdx_total_supply) : '···'}
                                    </span>
                                </div>
                            </div>
                            <div className='clear'></div>

                            <div className='card-center'>
                                {
                                    this.props.data.i_have_borrow_usdx &&
                                    <div className={'supply-apr'}>
                                        <span className='apr apr-borrow-color'>
                                            <FormattedMessage id='borrowing_balance' />
                                        </span>
                                        <span className='apr-num apr-num-left apr-borrow-color'>{this.props.data.my_borrow_usdx ? format_num_to_K(this.props.data.my_borrow_usdx) : '···'}</span>
                                    </div>
                                }
                                {
                                    !this.props.data.i_have_borrow_usdx &&
                                    <div className={'supply-apr'}>
                                        <span className='apr'>
                                            <FormattedMessage id='supply_APR' />
                                        </span>
                                        <span className='apr-num apr-num-left'>{this.props.data.usdx_supply_APR ? this.props.data.usdx_supply_APR + '%' : '···'}</span>
                                    </div>
                                }

                                {
                                    this.props.data.i_have_supply_usdx &&
                                    <div className={'borrow-apr'}>
                                        <span className='apr apr-supply-color'>
                                            <FormattedMessage id='supplying_balance' />
                                        </span>
                                        <span className='apr-num apr-num-center apr-supply-color'>{this.props.data.my_supply_usdx ? format_num_to_K(this.props.data.my_supply_usdx) : '···'}</span>
                                    </div>
                                }
                                {
                                    !this.props.data.i_have_supply_usdx &&
                                    <div className={'borrow-apr'}>
                                        <span className='apr'>
                                            <FormattedMessage id='borrow_APR' />
                                        </span>
                                        <span className='apr-num apr-num-center'>{this.props.data.usdx_borrow_APR ? this.props.data.usdx_borrow_APR + '%' : '···'}</span>
                                    </div>
                                }
                                <div className={'u-rate'}>
                                    <span className='apr'>
                                        <FormattedMessage id='utilization_Rate' />
                                    </span>
                                    <span className='apr-num apr-num-right'>{this.props.data.usdx_u_rate ? this.props.data.usdx_u_rate + '%' : '···'}</span>
                                </div>
                            </div>

                            <div className='card-bottom'>
                                {
                                    this.props.data.i_have_supply_usdx &&
                                    <div className={'button-wrap-home-fall'}>
                                        <Link to={{ pathname: './supply-usdx' }}>
                                            <Button size='large' disabled={false}>
                                                <FormattedMessage id='SUPPLY' />
                                            </Button>
                                        </Link>
                                    </div>
                                }
                                {
                                    (!this.props.data.i_have_supply_usdx && !this.props.data.i_have_borrow_usdx) &&
                                    <React.Fragment>
                                        <div className={'button-wrap-home'}>
                                            <Link to={{ pathname: './supply-usdx' }}>
                                                <Button size='large' disabled={false}>
                                                    <FormattedMessage id='SUPPLY' />
                                                </Button>
                                            </Link>
                                        </div>

                                        <div className={'button-wrap-home-borrow'}>
                                            <Link to={{
                                                pathname:
                                                    this.props.data.i_have_supply_usdt || this.props.data.i_have_supply_weth || this.props.data.i_have_supply_imbtc ?
                                                        './borrow-usdx' : ''
                                            }}>
                                                <Button
                                                    size='large'
                                                    className={
                                                        this.props.data.i_have_supply_usdt || this.props.data.i_have_supply_weth || this.props.data.i_have_supply_imbtc ?
                                                            null : 'disable-button'
                                                    }
                                                    disabled={false}
                                                >
                                                    <FormattedMessage id='BORROW' />
                                                </Button>
                                            </Link>
                                        </div>
                                    </React.Fragment>
                                }
                                {
                                    this.props.data.i_have_borrow_usdx &&
                                    <div className={'button-wrap-home-borrow-fall'}>
                                        <Link to={{ pathname: './borrow-usdx' }}>
                                            <Button size='large' disabled={false}>
                                                <FormattedMessage id='BORROW' />
                                            </Button>
                                        </Link>
                                    </div>
                                }

                            </div>
                        </div>




                        <div className='card'>
                            <div className='card-top'>
                                <div className='card-top-left'>
                                    <img src={'images/Home_USDT.svg'} />
                                    <span className='token-usdt'>USDT</span>
                                </div>
                                <div className='card-top-right'>
                                    <span className='market'>
                                        <FormattedMessage id='market_size' />
                                    </span>
                                    <span className='market-num'>
                                        {this.props.data.usdt_total_supply ? '$' + format_str_to_kmb(this.props.data.usdt_total_supply) : '···'}
                                    </span>
                                </div>
                            </div>
                            <div className='clear'></div>

                            <div className='card-center'>
                                {
                                    this.props.data.i_have_borrow_usdt &&
                                    <div className={'supply-apr'}>
                                        <span className='apr apr-borrow-color'>
                                            <FormattedMessage id='borrowing_balance' />
                                        </span>
                                        <span className='apr-num apr-num-left apr-borrow-color'>{this.props.data.my_borrow_usdt ? format_num_to_K(this.props.data.my_borrow_usdt) : '···'}</span>
                                    </div>
                                }
                                {
                                    !this.props.data.i_have_borrow_usdt &&
                                    <div className={'supply-apr'}>
                                        <span className='apr'>
                                            <FormattedMessage id='supply_APR' />
                                        </span>
                                        <span className='apr-num apr-num-left'>{this.props.data.usdt_supply_APR ? this.props.data.usdt_supply_APR + '%' : '···'}</span>
                                    </div>
                                }

                                {
                                    this.props.data.i_have_supply_usdt &&
                                    <div className={'borrow-apr'}>
                                        <span className='apr apr-supply-color'>
                                            <FormattedMessage id='supplying_balance' />
                                        </span>
                                        <span className='apr-num apr-num-center apr-supply-color'>{this.props.data.my_supply_usdt ? format_num_to_K(this.props.data.my_supply_usdt) : '···'}</span>
                                    </div>
                                }
                                {
                                    !this.props.data.i_have_supply_usdt &&
                                    <div className={'borrow-apr'}>
                                        <span className='apr'>
                                            <FormattedMessage id='borrow_APR' />
                                        </span>
                                        <span className='apr-num apr-num-center'>{this.props.data.usdt_borrow_APR ? this.props.data.usdt_borrow_APR + '%' : '···'}</span>
                                    </div>
                                }
                                <div className={'u-rate'}>
                                    <span className='apr'>
                                        <FormattedMessage id='utilization_Rate' />
                                    </span>
                                    <span className='apr-num apr-num-right'>{this.props.data.usdt_u_rate ? this.props.data.usdt_u_rate + '%' : '···'}</span>
                                </div>
                            </div>

                            <div className='card-bottom'>
                                {
                                    this.props.data.i_have_supply_usdt &&
                                    <div className={'button-wrap-home-fall'}>
                                        <Link to={{ pathname: './supply-usdt' }}>
                                            <Button size='large' disabled={false}>
                                                <FormattedMessage id='SUPPLY' />
                                            </Button>
                                        </Link>
                                    </div>
                                }
                                {
                                    (!this.props.data.i_have_supply_usdt && !this.props.data.i_have_borrow_usdt) &&
                                    <React.Fragment>
                                        <div className={'button-wrap-home'}>
                                            <Link to={{ pathname: './supply-usdt' }}>
                                                <Button size='large' disabled={false}>
                                                    <FormattedMessage id='SUPPLY' />
                                                </Button>
                                            </Link>
                                        </div>

                                        <div className={'button-wrap-home-borrow'}>
                                            <Link to={{
                                                pathname:
                                                    this.props.data.i_have_supply_usdx || this.props.data.i_have_supply_weth || this.props.data.i_have_supply_imbtc ?
                                                        './borrow-usdt' : ''
                                            }}>
                                                <Button
                                                    size='large'
                                                    className={
                                                        this.props.data.i_have_supply_usdx || this.props.data.i_have_supply_weth || this.props.data.i_have_supply_imbtc ?
                                                            null : 'disable-button'
                                                    }
                                                    disabled={false}
                                                >
                                                    <FormattedMessage id='BORROW' />
                                                </Button>
                                            </Link>
                                        </div>
                                    </React.Fragment>
                                }
                                {
                                    this.props.data.i_have_borrow_usdt &&
                                    <div className={'button-wrap-home-borrow-fall'}>
                                        <Link to={{ pathname: './borrow-usdt' }}>
                                            <Button size='large' disabled={false}>
                                                <FormattedMessage id='BORROW' />
                                            </Button>
                                        </Link>
                                    </div>
                                }

                            </div>
                        </div>




                        <div className='card card-margin-right'>
                            <div className='card-top'>
                                <div className='card-top-left'>
                                    <img src={'images/Home_WETH.svg'} />
                                    <span className='token-weth'>WETH</span>
                                </div>
                                <div className='card-top-right'>
                                    <span className='market'>
                                        <FormattedMessage id='market_size' />
                                    </span>
                                    <span className='market-num'>
                                        {this.props.data.weth_total_supply ? '$' + format_str_to_kmb(this.props.data.weth_total_supply) : '···'}
                                    </span>
                                </div>
                            </div>
                            <div className='clear'></div>

                            <div className='card-center'>
                                {
                                    this.props.data.i_have_borrow_weth &&
                                    <div className={'supply-apr'}>
                                        <span className='apr apr-borrow-color'>
                                            <FormattedMessage id='borrowing_balance' />
                                        </span>
                                        <span className='apr-num apr-num-left apr-borrow-color'>{this.props.data.my_borrow_weth ? format_num_to_K(this.props.data.my_borrow_weth) : '···'}</span>
                                    </div>
                                }
                                {
                                    !this.props.data.i_have_borrow_weth &&
                                    <div className={'supply-apr'}>
                                        <span className='apr'>
                                            <FormattedMessage id='supply_APR' />
                                        </span>
                                        <span className='apr-num apr-num-left'>{this.props.data.weth_supply_APR ? this.props.data.weth_supply_APR + '%' : '···'}</span>
                                    </div>
                                }

                                {
                                    this.props.data.i_have_supply_weth &&
                                    <div className={'borrow-apr'}>
                                        <span className='apr apr-supply-color'>
                                            <FormattedMessage id='supplying_balance' />
                                        </span>
                                        <span className='apr-num apr-num-center apr-supply-color'>{this.props.data.my_supply_weth ? format_num_to_K(this.props.data.my_supply_weth) : '···'}</span>
                                    </div>
                                }
                                {
                                    !this.props.data.i_have_supply_weth &&
                                    <div className={'borrow-apr'}>
                                        <span className='apr'>
                                            <FormattedMessage id='borrow_APR' />
                                        </span>
                                        <span className='apr-num apr-num-center'>{this.props.data.weth_borrow_APR ? this.props.data.weth_borrow_APR + '%' : '···'}</span>
                                    </div>
                                }
                                <div className={'u-rate'}>
                                    <span className='apr'>
                                        <FormattedMessage id='utilization_Rate' />
                                    </span>
                                    <span className='apr-num apr-num-right'>{this.props.data.weth_u_rate ? this.props.data.weth_u_rate + '%' : '···'}</span>
                                </div>
                            </div>

                            <div className='card-bottom'>
                                {
                                    this.props.data.i_have_supply_weth &&
                                    <div className={'button-wrap-home-fall'}>
                                        <Link to={{ pathname: './supply-weth' }}>
                                            <Button size='large' disabled={false}>
                                                <FormattedMessage id='SUPPLY' />
                                            </Button>
                                        </Link>
                                    </div>
                                }
                                {
                                    (!this.props.data.i_have_supply_weth && !this.props.data.i_have_borrow_weth) &&
                                    <React.Fragment>
                                        <div className={'button-wrap-home'}>
                                            <Link to={{ pathname: './supply-weth' }}>
                                                <Button size='large' disabled={false}>
                                                    <FormattedMessage id='SUPPLY' />
                                                </Button>
                                            </Link>
                                        </div>

                                        <div className={'button-wrap-home-borrow'}>
                                            <Link to={{
                                                pathname:
                                                    this.props.data.i_have_supply_usdt || this.props.data.i_have_supply_usdx || this.props.data.i_have_supply_imbtc ?
                                                        './borrow-weth' : ''
                                            }}>
                                                <Button
                                                    size='large'
                                                    className={
                                                        this.props.data.i_have_supply_usdt || this.props.data.i_have_supply_usdx || this.props.data.i_have_supply_imbtc ?
                                                            null : 'disable-button'
                                                    }
                                                    disabled={false}
                                                >
                                                    <FormattedMessage id='BORROW' />
                                                </Button>
                                            </Link>
                                        </div>
                                    </React.Fragment>
                                }
                                {
                                    this.props.data.i_have_borrow_weth &&
                                    <div className={'button-wrap-home-borrow-fall'}>
                                        <Link to={{ pathname: './borrow-weth' }}>
                                            <Button size='large' disabled={false}>
                                                <FormattedMessage id='BORROW' />
                                            </Button>
                                        </Link>
                                    </div>
                                }

                            </div>
                        </div>



                        <div className='card'>
                            <div className='card-top'>
                                <div className='card-top-left'>
                                    <img src={'images/Home_imBTC.svg'} />
                                    <span className='token-imbtc'>imBTC</span>
                                </div>
                                <div className='card-top-right'>
                                    <span className='market'>
                                        <FormattedMessage id='market_size' />
                                    </span>
                                    <span className='market-num'>
                                        {this.props.data.imbtc_total_supply ? '$' + format_str_to_kmb(this.props.data.imbtc_total_supply) : '···'}
                                    </span>
                                </div>
                            </div>
                            <div className='clear'></div>

                            <div className='card-center'>
                                {
                                    this.props.data.i_have_borrow_imbtc &&
                                    <div className={'supply-apr'}>
                                        <span className='apr apr-borrow-color'>
                                            <FormattedMessage id='borrowing_balance' />
                                        </span>
                                        <span className='apr-num apr-num-left apr-borrow-color'>{this.props.data.my_borrow_imbtc ? format_num_to_K(this.props.data.my_borrow_imbtc) : '···'}</span>
                                    </div>
                                }
                                {
                                    !this.props.data.i_have_borrow_imbtc &&
                                    <div className={'supply-apr'}>
                                        <span className='apr'>
                                            <FormattedMessage id='supply_APR' />
                                        </span>
                                        <span className='apr-num apr-num-left'>{this.props.data.imbtc_supply_APR ? this.props.data.imbtc_supply_APR + '%' : '···'}</span>
                                    </div>
                                }


                                {
                                    this.props.data.i_have_supply_imbtc &&
                                    <div className={'borrow-apr'}>
                                        <span className='apr apr-supply-color'>
                                            <FormattedMessage id='supplying_balance' />
                                        </span>
                                        <span className='apr-num apr-num-center apr-supply-color'>{this.props.data.my_supply_imbtc ? format_num_to_K(this.props.data.my_supply_imbtc) : '···'}</span>
                                    </div>
                                }
                                {
                                    !this.props.data.i_have_supply_imbtc &&
                                    <div className={'borrow-apr'}>
                                        <span className='apr'>
                                            <FormattedMessage id='borrow_APR' />
                                        </span>
                                        <span className='apr-num apr-num-center'>{this.props.data.imbtc_borrow_APR ? this.props.data.imbtc_borrow_APR + '%' : '···'}</span>
                                    </div>
                                }
                                <div className={'u-rate'}>
                                    <span className='apr'>
                                        <FormattedMessage id='utilization_Rate' />
                                    </span>
                                    <span className='apr-num apr-num-right'>{this.props.data.imbtc_u_rate ? this.props.data.imbtc_u_rate + '%' : '···'}</span>
                                </div>
                            </div>

                            <div className='card-bottom'>
                                {
                                    this.props.data.i_have_supply_imbtc &&
                                    <div className={'button-wrap-home-fall'}>
                                        <Link to={{ pathname: './supply-imbtc' }}>
                                            <Button size='large' disabled={false}>
                                                <FormattedMessage id='SUPPLY' />
                                            </Button>
                                        </Link>
                                    </div>
                                }
                                {
                                    (!this.props.data.i_have_supply_imbtc && !this.props.data.i_have_borrow_imbtc) &&
                                    <React.Fragment>
                                        <div className={'button-wrap-home'}>
                                            <Link to={{ pathname: './supply-imbtc' }}>
                                                <Button size='large' disabled={false}>
                                                    <FormattedMessage id='SUPPLY' />
                                                </Button>
                                            </Link>
                                        </div>

                                        <div className={'button-wrap-home-borrow'}>
                                            <Link to={{
                                                pathname:
                                                    this.props.data.i_have_supply_usdt || this.props.data.i_have_supply_weth || this.props.data.i_have_supply_usdx ?
                                                        './borrow-imbtc' : ''
                                            }}>
                                                <Button
                                                    size='large'
                                                    className={
                                                        this.props.data.i_have_supply_usdt || this.props.data.i_have_supply_weth || this.props.data.i_have_supply_usdx ?
                                                            null : 'disable-button'
                                                    }
                                                    disabled={false}
                                                >
                                                    <FormattedMessage id='BORROW' />
                                                </Button>
                                            </Link>
                                        </div>
                                    </React.Fragment>
                                }
                                {
                                    this.props.data.i_have_borrow_imbtc &&
                                    <div className={'button-wrap-home-borrow-fall'}>
                                        <Link to={{ pathname: './borrow-imbtc' }}>
                                            <Button size='large' disabled={false}>
                                                <FormattedMessage id='BORROW' />
                                            </Button>
                                        </Link>
                                    </div>
                                }

                            </div>
                        </div>

                        <div className='clear'></div>
                    </div>
                </React.Fragment>
            </IntlProvider>
        )
    }
}

export default Home;