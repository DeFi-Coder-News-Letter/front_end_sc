import React, { Component } from 'react';
import { Link } from "react-router-dom";
// import MediaQuery from 'react-responsive';
import { Tabs, Button, InputNumber, Input } from 'antd';
import './home.scss';

// add i18n.
import { IntlProvider, FormattedMessage } from 'react-intl';
import en_US from '../../language/en_US.js';
import zh_CN from '../../language/zh_CN';



class Home extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount = () => { }






    render() {
        return (
            <div className='card-wrap'>
                <div className='header'>
                    supply: <span>{this.props.data.my_supply ? this.props.data.my_supply : '-'}</span>
                    borrow: <span>{this.props.data.my_borrow ? this.props.data.my_borrow : '-'}</span>
                </div>
                <hr />



                <div className='card card-margin-right'>
                    <div className='card-top'>
                        <div className='card-top-left'>
                            <img src={'images/Home_USDx.svg'} />
                            <span>USDx</span>
                        </div>
                        <div className='card-top-right'>
                            <span className='market'>Market Size</span>
                            <span className='market-num'>
                                {this.props.data.usdx_total_supply ? '$' + this.props.data.usdx_total_supply : '···'}
                            </span>
                        </div>
                    </div>
                    <div className='clear'></div>

                    <div className='card-center'>
                        <div className={'supply-apr'}>
                            <span className='apr'>Supply APR</span>
                            <span className='apr-num'>{this.props.data.usdx_supply_APR ? this.props.data.usdx_supply_APR + '%' : '···'}</span>
                        </div>
                        <div className={'borrow-apr'}>
                            <span className='apr'>Borrow APR</span>
                            <span className='apr-num'>{this.props.data.usdx_borrow_APR ? this.props.data.usdx_borrow_APR + '%' : '···'}</span>
                        </div>
                        <div className={'u-rate'}>
                            <span className='apr'>Utilization Rate</span>
                            <span className='apr-num'>{this.props.data.usdx_u_rate ? this.props.data.usdx_u_rate + '%' : '···'}</span>
                        </div>
                    </div>

                    <div className='card-bottom'>
                        {
                            (this.props.data.i_have_supply_usdx || (!this.props.data.i_have_supply_usdx && !this.props.data.i_have_borrow_usdx)) &&
                            <div className={'button-wrap'}>
                                <Link to={{ pathname: './supply-usdx' }}>
                                    <Button
                                        size='large'
                                        // className={'disable-button'}
                                        disabled={false}
                                    // onClick={() => { handle_supply_click(this, this.state.imBTC_decimals, address[this.state.net_type]['address_imBTC']) }}
                                    >
                                        {'SUPPLY'}
                                    </Button>
                                </Link>
                            </div>
                        }

                        {
                            (this.props.data.i_have_borrow_usdx || (!this.props.data.i_have_supply_usdx && !this.props.data.i_have_borrow_usdx)) &&
                            <div className={'button-wrap'}>
                                <Link to={{ pathname: './borrow-usdx' }}>
                                    <Button
                                        size='large'
                                        className={'disable-button'}
                                        disabled={false}
                                    // onClick={() => { handle_supply_click(this, this.state.imBTC_decimals, address[this.state.net_type]['address_imBTC']) }}
                                    >
                                        {'BORROW'}
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
                            <span className='market'>Market Size</span>
                            <span className='market-num'>
                                {this.props.data.usdt_total_supply ? '$' + this.props.data.usdt_total_supply : '···'}
                            </span>
                        </div>
                    </div>
                    <div className='clear'></div>

                    <div className='card-center'>
                        <div className={'supply-apr'}>
                            <span className='apr'>Supply APR</span>
                            <span className='apr-num'>{this.props.data.usdt_supply_APR ? this.props.data.usdt_supply_APR + '%' : '···'}</span>
                        </div>
                        <div className={'borrow-apr'}>
                            <span className='apr'>Borrow APR</span>
                            <span className='apr-num'>{this.props.data.usdt_borrow_APR ? this.props.data.usdt_borrow_APR + '%' : '···'}</span>
                        </div>
                        <div className={'u-rate'}>
                            <span className='apr'>Utilization Rate</span>
                            <span className='apr-num'>{this.props.data.usdt_u_rate ? this.props.data.usdt_u_rate + '%' : '···'}</span>
                        </div>
                    </div>

                    <div className='card-bottom'>
                        {
                            (this.props.data.i_have_supply_usdt || (!this.props.data.i_have_supply_usdt && !this.props.data.i_have_borrow_usdt)) &&
                            <div className={'button-wrap'}>
                                <Link to={{ pathname: './supply-usdt' }}>
                                    <Button
                                        size='large'
                                        // className={'disable-button'}
                                        disabled={false}
                                    // onClick={() => { handle_supply_click(this, this.state.imBTC_decimals, address[this.state.net_type]['address_imBTC']) }}
                                    >
                                        {'SUPPLY'}
                                    </Button>
                                </Link>
                            </div>
                        }

                        {
                            (this.props.data.i_have_borrow_usdt || (!this.props.data.i_have_supply_usdt && !this.props.data.i_have_borrow_usdt)) &&
                            <div className={'button-wrap'}>
                                <Link to={{ pathname: './borrow-usdt' }}>
                                    <Button
                                        size='large'
                                        className={'disable-button'}
                                        disabled={false}
                                    // onClick={() => { handle_supply_click(this, this.state.imBTC_decimals, address[this.state.net_type]['address_imBTC']) }}
                                    >
                                        {'BORROW'}
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
                            <span className='market'>Market Size</span>
                            <span className='market-num'>
                                {this.props.data.weth_total_supply ? '$' + this.props.data.weth_total_supply : '···'}
                            </span>
                        </div>
                    </div>
                    <div className='clear'></div>

                    <div className='card-center'>
                        <div className={'supply-apr'}>
                            <span className='apr'>Supply APR</span>
                            <span className='apr-num'>{this.props.data.weth_supply_APR ? this.props.data.weth_supply_APR + '%' : '···'}</span>
                        </div>
                        <div className={'borrow-apr'}>
                            <span className='apr'>Borrow APR</span>
                            <span className='apr-num'>{this.props.data.weth_borrow_APR ? this.props.data.weth_borrow_APR + '%' : '···'}</span>
                        </div>
                        <div className={'u-rate'}>
                            <span className='apr'>Utilization Rate</span>
                            <span className='apr-num'>{this.props.data.weth_u_rate ? this.props.data.weth_u_rate + '%' : '···'}</span>
                        </div>
                    </div>

                    <div className='card-bottom'>
                        {
                            (this.props.data.i_have_supply_weth || (!this.props.data.i_have_supply_weth && !this.props.data.i_have_borrow_weth)) &&
                            <div className={'button-wrap'}>
                                <Link to={{ pathname: './supply-weth' }}>
                                    <Button
                                        size='large'
                                        // className={'disable-button'}
                                        disabled={false}
                                    // onClick={() => { handle_supply_click(this, this.state.imBTC_decimals, address[this.state.net_type]['address_imBTC']) }}
                                    >
                                        {'SUPPLY'}
                                    </Button>
                                </Link>
                            </div>
                        }

                        {
                            (this.props.data.i_have_borrow_weth || (!this.props.data.i_have_supply_weth && !this.props.data.i_have_borrow_weth)) &&
                            <div className={'button-wrap'}>
                                <Link to={{ pathname: './borrow-weth' }}>
                                    <Button
                                        size='large'
                                        className={'disable-button'}
                                        disabled={false}
                                    // onClick={() => { handle_supply_click(this, this.state.imBTC_decimals, address[this.state.net_type]['address_imBTC']) }}
                                    >
                                        {'BORROW'}
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
                            <span className='market'>Market Size</span>
                            <span className='market-num'>
                                {this.props.data.imbtc_total_supply ? '$' + this.props.data.imbtc_total_supply : '···'}
                            </span>
                        </div>
                    </div>
                    <div className='clear'></div>

                    <div className='card-center'>
                        <div className={'supply-apr'}>
                            <span className='apr'>Supply APR</span>
                            <span className='apr-num'>{this.props.data.imbtc_supply_APR ? this.props.data.imbtc_supply_APR + '%' : '···'}</span>
                        </div>
                        <div className={'borrow-apr'}>
                            <span className='apr'>Borrow APR</span>
                            <span className='apr-num'>{this.props.data.imbtc_borrow_APR ? this.props.data.imbtc_borrow_APR + '%' : '···'}</span>
                        </div>
                        <div className={'u-rate'}>
                            <span className='apr'>Utilization Rate</span>
                            <span className='apr-num'>{this.props.data.imbtc_u_rate ? this.props.data.imbtc_u_rate + '%' : '···'}</span>
                        </div>
                    </div>

                    <div className='card-bottom'>
                        {
                            (this.props.data.i_have_supply_imbtc || (!this.props.data.i_have_supply_imbtc && !this.props.data.i_have_borrow_imbtc)) &&
                            <div className={'button-wrap'}>
                                <Link to={{ pathname: './supply-imbtc' }}>
                                    <Button
                                        size='large'
                                        // className={'disable-button'}
                                        disabled={false}
                                    // onClick={() => { handle_supply_click(this, this.state.imBTC_decimals, address[this.state.net_type]['address_imBTC']) }}
                                    >
                                        {'SUPPLY'}
                                    </Button>
                                </Link>
                            </div>
                        }

                        {
                            (this.props.data.i_have_borrow_imbtc || (!this.props.data.i_have_supply_imbtc && !this.props.data.i_have_borrow_imbtc)) &&
                            <div className={'button-wrap'}>
                                <Link to={{ pathname: './borrow-imbtc' }}>
                                    <Button
                                        size='large'
                                        className={'disable-button'}
                                        disabled={false}
                                    // onClick={() => { handle_supply_click(this, this.state.imBTC_decimals, address[this.state.net_type]['address_imBTC']) }}
                                    >
                                        {'BORROW'}
                                    </Button>
                                </Link>
                            </div>
                        }

                    </div>
                </div>

                <div className='clear'></div>
            </div>
        )
    }
}

export default Home;