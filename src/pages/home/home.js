import React, { Component } from 'react';
import './home.scss';
import { Link } from "react-router-dom";
import MediaQuery from 'react-responsive';
import AccountInfo from '../../container/accountInfo/accountInfo_main';
import { findNetwork, getLoginStatusKey } from '../../util.js';

// add i18n.
import { IntlProvider, FormattedMessage } from 'react-intl';
import en_US from '../../language/en_US.js';
import zh_CN from '../../language/zh_CN';


class Home extends Component {
    constructor(props) {
        super(props);

        // this.componentDidMount_temp();

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



                <div className='card'>
                    <div className='card-top'>
                        <div className='card-top-left'>USDx</div>
                        <div className='card-top-right'></div>
                    </div>
                    <div className='card-center'>
                        usdx_total_supply: <span>{this.props.data.usdx_total_supply ? this.props.data.usdx_total_supply : '-'}</span>
                        usdx_supply_APR: <span>{this.props.data.usdx_supply_APR ? this.props.data.usdx_supply_APR : '-'}</span>
                        usdx_borrow_APR: <span>{this.props.data.usdx_borrow_APR ? this.props.data.usdx_borrow_APR : '-'}</span>
                        usdx_u_rate: <span>{this.props.data.usdx_u_rate ? this.props.data.usdx_u_rate : '-'}</span>
                    </div>

                    <div className='card-bottom'>
                        {/* <div className='card-bottom-btn-left'>SUPPLY</div>
                        <div className='card-bottom-btn-right'>BORROW</div> */}
                        {
                            (this.props.data.i_have_supply_usdx || (!this.props.data.i_have_supply_usdx && !this.props.data.i_have_borrow_usdx)) &&
                            <Link className={'lend-link'} to={{ pathname: './supply-usdx' }}>to supply-usdx</Link>
                        }

                        <span style={{ display: 'inline-block', width: '20px', height: '5px', background: 'red' }}></span>

                        {
                            (this.props.data.i_have_borrow_usdx || (!this.props.data.i_have_supply_usdx && !this.props.data.i_have_borrow_usdx)) &&
                            <Link className={'lend-link'} to={{ pathname: './borrow-usdx' }}>to borrow-usdx</Link>
                        }

                    </div>
                </div>
                <hr />





                <div className='card'>
                    <div className='card-top'>
                        <div className='card-top-left'>USDT</div>
                        <div className='card-top-right'></div>
                    </div>
                    <div className='card-center'>
                        usdt_total_supply: <span>{this.props.data.usdt_total_supply ? this.props.data.usdt_total_supply : '-'}</span>
                        usdt_supply_APR: <span>{this.props.data.usdt_supply_APR ? this.props.data.usdt_supply_APR : '-'}</span>
                        usdt_borrow_APR: <span>{this.props.data.usdt_borrow_APR ? this.props.data.usdt_borrow_APR : '-'}</span>
                        usdt_u_rate: <span>{this.props.data.usdt_u_rate ? this.props.data.usdt_u_rate : '-'}</span>
                    </div>

                    <div className='card-bottom'>
                        {
                            (this.props.data.i_have_supply_usdt || (!this.props.data.i_have_supply_usdt && !this.props.data.i_have_borrow_usdt)) &&
                            <Link className={'lend-link'} to={{ pathname: './supply-usdt' }}>to supply-usdt</Link>
                        }

                        <span style={{ display: 'inline-block', width: '20px', height: '5px', background: 'red' }}></span>

                        {
                            (this.props.data.i_have_borrow_usdt || (!this.props.data.i_have_supply_usdt && !this.props.data.i_have_borrow_usdt)) &&
                            <Link className={'lend-link'} to={{ pathname: './borrow-usdt' }}>to borrow-usdt</Link>
                        }

                    </div>
                </div>
                <hr />





                <div className='card'>
                    <div className='card-top'>
                        <div className='card-top-left'>imBTC</div>
                        <div className='card-top-right'></div>
                    </div>
                    <div className='card-center'>
                        imbtc_total_supply: <span>{this.props.data.imbtc_total_supply ? this.props.data.imbtc_total_supply : '-'}</span>
                        imbtc_supply_APR: <span>{this.props.data.imbtc_supply_APR ? this.props.data.imbtc_supply_APR : '-'}</span>
                        imbtc_borrow_APR: <span>{this.props.data.imbtc_borrow_APR ? this.props.data.imbtc_borrow_APR : '-'}</span>
                        imbtc_u_rate: <span>{this.props.data.imbtc_u_rate ? this.props.data.imbtc_u_rate : '-'}</span>
                    </div>

                    <div className='card-bottom'>
                        {
                            (this.props.data.i_have_supply_imbtc || (!this.props.data.i_have_supply_imbtc && !this.props.data.i_have_borrow_imbtc)) &&
                            <Link className={'lend-link'} to={{ pathname: './supply-imbtc' }}>to supply-imbtc</Link>
                        }

                        <span style={{ display: 'inline-block', width: '20px', height: '5px', background: 'red' }}></span>

                        {
                            (this.props.data.i_have_borrow_imbtc || (!this.props.data.i_have_supply_imbtc && !this.props.data.i_have_borrow_imbtc)) &&
                            <Link className={'lend-link'} to={{ pathname: './borrow-imbtc' }}>to borrow-imbtc</Link>
                        }

                    </div>
                </div>
                <hr />





                <div className='card'>
                    <div className='card-top'>
                        <div className='card-top-left'>WETH</div>
                        <div className='card-top-right'></div>
                    </div>
                    <div className='card-center'>
                        weth_total_supply: <span>{this.props.data.weth_total_supply ? this.props.data.weth_total_supply : '-'}</span>
                        weth_supply_APR: <span>{this.props.data.weth_supply_APR ? this.props.data.weth_supply_APR : '-'}</span>
                        weth_borrow_APR: <span>{this.props.data.weth_borrow_APR ? this.props.data.weth_borrow_APR : '-'}</span>
                        weth_u_rate: <span>{this.props.data.weth_u_rate ? this.props.data.weth_u_rate : '-'}</span>
                    </div>

                    <div className='card-bottom'>
                        {
                            (this.props.data.i_have_supply_weth || (!this.props.data.i_have_supply_weth && !this.props.data.i_have_borrow_weth)) &&
                            <Link className={'lend-link'} to={{ pathname: './supply-weth' }}>to supply-weth</Link>
                        }

                        <span style={{ display: 'inline-block', width: '20px', height: '5px', background: 'red' }}></span>

                        {
                            (this.props.data.i_have_borrow_weth || (!this.props.data.i_have_supply_weth && !this.props.data.i_have_borrow_weth)) &&
                            <Link className={'lend-link'} to={{ pathname: './borrow-weth' }}>to borrow-weth</Link>
                        }

                    </div>
                </div>
                <hr />



                {/* <div>
                    <Link className={'lend-link'} to={{ pathname: './supply-usdx' }}>to supply-usdx</Link>
                    <span style={{ display: 'inline-block', width: '20px', height: '5px', background: 'red' }}></span>
                    <Link className={'lend-link'} to={{ pathname: './borrow-usdx' }}>to borrow-usdx</Link>
                </div>
                <hr style={{ margin: '20px 0' }}></hr>

                <div>
                    <Link className={'lend-link'} to={{ pathname: './supply-weth' }}>to supply-weth</Link>
                    <span style={{ display: 'inline-block', width: '20px', height: '5px', background: 'red' }}></span>
                    <Link className={'lend-link'} to={{ pathname: './borrow-weth' }}>to borrow-weth</Link>
                </div>
                <hr style={{ margin: '20px 0' }}></hr>

                <div>
                    <Link className={'lend-link'} to={{ pathname: './supply-usdt' }}>to supply-usdt</Link>
                    <span style={{ display: 'inline-block', width: '20px', height: '5px', background: 'red' }}></span>
                    <Link className={'lend-link'} to={{ pathname: './borrow-usdt' }}>to borrow-usdt</Link>
                </div>
                <hr style={{ margin: '20px 0' }}></hr>

                <div>
                    <Link className={'lend-link'} to={{ pathname: './supply-imbtc' }}>to supply-imbtc</Link>
                    <span style={{ display: 'inline-block', width: '20px', height: '5px', background: 'red' }}></span>
                    <Link className={'lend-link'} to={{ pathname: './borrow-imbtc' }}>to borrow-imbtc</Link>
                </div> */}

            </div>
        )
        // return (
        //     <IntlProvider locale={'en'} messages={navigator.language === 'zh-CN' ? zh_CN : en_US} >
        //         <MediaQuery maxWidth={736}>
        //             {(match) => <div className={'main-page ' + (match ? 'CM XS' : 'CM LG')}>
        //                 <div className='main-page-header'>
        //                     <img src={'images/logo@2x.svg'} className='header-logo' alt="MAIN" />
        //                     {match ? null : <div className='login-info-sec'>
        //                         <div style={{ display: 'flex', alignItems: 'center' }}>
        //                             <div className={account !== undefined && this.state.isLogIn ? 'signed-in' : 'connect-sign'}></div>
        //                             <span style={{ fontWeight: 500, paddingLeft: '8px' }}>{account !== undefined && this.state.isLogIn ? `${NetworkName}` : 'Unconnected'}</span>
        //                         </div>
        //                         <div className="login" style={{ fontWeight: 500 }}>
        //                             {account !== undefined && this.state.isLogIn ? account.substring(0, 8) + '...' + account.substring(account.length - 6) : 'Connect to Metamask'}
        //                             <div className="popup">
        //                                 <span><em></em></span>
        //                                 <p style={{ display: account !== undefined && this.state.isLogIn ? 'none' : 'block', fontWeight: 500 }} onClick={() => this.connectMetamask()}>Connect</p>
        //                                 <p className="out" style={{ display: account !== undefined && this.state.isLogIn ? 'block' : 'none', fontWeight: 500 }} onClick={() => this.unConnectMetamask()}>Logout</p>
        //                             </div>
        //                         </div>
        //                     </div>}
        //                 </div>
        //                 <div className='headline-wrapper'>
        //                     <div className='headline'>
        //                         {/* <span>Decentralized Lending with Lendf.me</span> */}
        //                         <FormattedMessage id='Decentralized' />
        //                     </div>
        //                     {/* <div className='headline-intro'>
        //                         <div>Borrowing and lending are mutually exclusive and cannot be occur simultaneously; </div>
        //                         <div>In order to offer USDx in Lend page, you must first repay the USDx loan in the Borrow option.</div>
        //                     </div> */}
        //                 </div>
        //                 <div className='info-sec'>
        //                     <AccountInfo currentPage={'main'} account={this.state.currentAccount} login={this.state.isLogIn} />
        //                 </div>
        //                 <div className='button-container'>
        //                     <div className='lend-container'>
        //                         <div className='lend-button'>
        //                             <Link className={'lend-link'} to={{ pathname: './supply', state: { isLogIn: this.state.isLogIn } }} />
        //                             <div style={{ display: 'flex', alignItems: 'center' }}>
        //                                 <img src={'images/icon_s@2x.png'} alt="MAIN" />
        //                                 <div className='title'>
        //                                     <FormattedMessage id='Supply_USDx' />
        //                                 </div>
        //                             </div>
        //                         </div>
        //                         <div className='description'>
        //                             <FormattedMessage id='Supply_your' />
        //                         </div>
        //                     </div>
        //                     <div className='borrow-container'>
        //                         <div className='borrow-button'>
        //                             <Link className={'borrow-link'} to={{ pathname: './borrow', state: { isLogIn: this.state.isLogIn } }} />
        //                             <div style={{ display: 'flex', alignItems: 'center' }}>
        //                                 <img src={'images/icon_b@2x.png'} alt="MAIN" />
        //                                 <div className='title'>
        //                                     <FormattedMessage id='Borrow_USDx' />
        //                                 </div>
        //                             </div>
        //                         </div>
        //                         <div className='description'>
        //                             <FormattedMessage id='Pledge_WETH' />
        //                         </div>
        //                     </div>
        //                 </div>
        //             </div>}
        //         </MediaQuery>
        //     </IntlProvider>
        // );
    }
}

export default Home;