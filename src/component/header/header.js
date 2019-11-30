import React, { Component } from 'react';
import './header.scss';

// add i18n.
import { IntlProvider, FormattedMessage } from 'react-intl';
import en_US from '../../language/en_US.js';
import zh_CN from '../../language/zh_CN';

class Header extends Component {
    constructor(props) {
        super(props)

        this.state = {        }
    }


    componentDidMount_temp = () => {    }


    componentWillUnmount() {    }


    render = () => {
        return (
            <IntlProvider locale={'en'} messages={navigator.language === 'zh-CN' ? zh_CN : en_US} >
                <div className={'header ' + ('without-banner')}>
                    <div className='header-content'>
                        <div className='left'>
                            <img className='header-logo' style={{ margin: 'auto' }} src={'images/h_logo@2x.svg'} alt="HEADER" />

                            <div className='market-info'>
                                <span className='market-info-title'>
                                    USDx
                                    <FormattedMessage id='Balance' />
                                    </span>
                                <span className='market-info-digits'>{this.props.USDxBalance}</span>
                            </div>

                            <div className='market-info'>
                                <span className='market-info-title'>
                                    ETH
                                    <FormattedMessage id='Balance' />
                                </span>
                                <span className='market-info-digits'>{this.props.ETHBalance}</span>
                            </div>

                            <div className='market-info'>
                                <span className='market-info-title'>
                                    WETH
                                    <FormattedMessage id='Balance' />
                                </span>
                                <span className='market-info-digits'>{this.props.WETHBalance}</span>
                            </div>

                            <div className='market-info'>
                                <span className='market-info-title'>ETH/USD</span>
                                <span className='market-info-digits'>{this.props.ETHToUSD}</span>
                            </div>
                        </div>



                        <div className='right'>
                            {/* <div className='account-info'>
                            <div className='market-info-digits'><i />  {this.props.networkName}</div>
                            <div className='market-info-digits'>{this.props.account}</div>
                        </div> */}
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <div className={this.props.account !== undefined && this.state.isLogIn ? 'signed-in' : 'connect-sign'}></div>
                                <span style={{ fontWeight: 500, paddingLeft: '8px', color: '#FFF' }}>{this.props.account !== undefined && this.state.isLogIn ? `${this.props.networkName}` : 'Unconnected'}</span>
                            </div>
                            <div className="login" style={{ fontWeight: 500, color: '#FFF' }}>
                                {this.props.account !== undefined && this.state.isLogIn ? this.props.account.substring(0, 8) + '...' + this.props.account.substring(this.props.account.length - 6) : 'Connect to Metamask'}
                                <div className="popup">
                                    <span><em></em></span>
                                    <p style={{ display: this.props.account !== undefined && this.state.isLogIn ? 'none' : 'block', fontWeight: 500 }} onClick={() => this.connectMetamask()}>Connect</p>
                                    <p className="out" style={{ display: this.props.account !== undefined && this.state.isLogIn ? 'block' : 'none', fontWeight: 500 }} onClick={() => this.unConnectMetamask()}>Logout</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </IntlProvider>
        )
    }
}

export default Header;
