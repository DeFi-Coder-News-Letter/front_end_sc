import React, { Component } from 'react';
import './header.scss';

// add i18n.
import { IntlProvider, FormattedMessage } from 'react-intl';
import en_US from '../../language/en_US.js';
import zh_CN from '../../language/zh_CN';

class Top_status extends Component {
    constructor(props) {
        super(props)
    }


    render = () => {
        return (
            <IntlProvider locale={'en'} messages={navigator.language === 'zh-CN' ? zh_CN : en_US} >
                <div className='top-status'>
                    <div className='top-status-box'>
                        <div className='top-box-left'>
                            <img className='logo2' src={'images/lendf_logo2.svg'} />
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



                            <div className='netstatus'>
                                <div className='netstatus-top'>
                                    <span className={'net-span rinkeby-span'}></span>
                                    {this.props.data.net_type ? this.props.data.net_type.substring(0, 1).toUpperCase() + this.props.data.net_type.substring(1) : ''}
                                </div>
                                <div className='netstatus-bm'>
                                    <span className='account-span'>
                                        {this.props.data.my_account ? this.props.data.my_account.substring(0, 4) + '...' + this.props.data.my_account.substring(this.props.data.my_account.length - 6) : '···'}
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

export default Top_status;
