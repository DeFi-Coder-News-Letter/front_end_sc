import React, { Component } from 'react';
import './header.scss';

// add i18n.
import { IntlProvider } from 'react-intl';
import en_US from '../../language/en_US.js';
import zh_CN from '../../language/zh_CN';

class TopStatus extends Component {

    check_my_account = () => {
        var addr;
        if (this.props.data.net_type === 'main') {
            addr = `https://etherscan.io/address/${this.props.data.my_account}`;
        } else {
            addr = `https://rinkeby.etherscan.io/address/${this.props.data.my_account}`;
        }
        window.open(addr, "_blank");
    }

    render = () => {
        return (
            <IntlProvider locale={'en'} messages={navigator.language === 'zh-CN' ? zh_CN : en_US} >
                <div className='top-status'>
                    <div className='top-status-box'>
                        <div className='top-box-left'>
                            <img className='logo2' src={'images/lendf_logo2.svg'} alt='' />
                        </div>
                        <div className='top-box-right'>
                            {
                                this.props.token_name === 'USDx' &&
                                <div className='token-price'>
                                    <span className='token-price-t'>USDx/USD</span>
                                    <span>{'1.00'}</span>
                                </div>
                            }
                            {
                                this.props.token_name === 'USDT' &&
                                <div className='token-price'>
                                    <span className='token-price-t'>{this.props.token_name}/USD</span>
                                    <span>{this.props.data.usdt_price}</span>
                                </div>
                            }
                            {
                                this.props.token_name === 'WETH' &&
                                <div className='token-price'>
                                    <span className='token-price-t'>{this.props.token_name}/USD</span>
                                    <span>{this.props.data.weth_price}</span>
                                </div>
                            }
                            {
                                this.props.token_name === 'imBTC' &&
                                <div className='token-price'>
                                    <span className='token-price-t'>{this.props.token_name}/USD</span>
                                    <span>{this.props.data.imbtc_price}</span>
                                </div>
                            }
                            {
                                this.props.token_name === 'HBTC' &&
                                <div className='token-price'>
                                    <span className='token-price-t'>{this.props.token_name}/USD</span>
                                    <span>{this.props.data.hbtc_price}</span>
                                </div>
                            }



                            <div className='netstatus'>
                                <div className='netstatus-bm' onClick={() => { this.check_my_account() }}>
                                    <span className={`net-span ${this.props.data.net_type}-span`}></span>
                                    <span className='account-span'>
                                        {
                                            this.props.data.my_account ?
                                                this.props.data.my_account.slice(0, 4) + '...' + this.props.data.my_account.slice(-4) : '···'
                                        }
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className='clear'></div>
                    </div>
                </div>
            </IntlProvider>
        )
    }
}

export default TopStatus;
