import React, { Component } from 'react';
import './header.scss';

// add i18n.
import { IntlProvider, FormattedMessage } from 'react-intl';
import en_US from '../../language/en_US.js';
import zh_CN from '../../language/zh_CN';

import { format_num_to_K } from '../../util.js';

class MyStatus extends Component {
    constructor(props) {
        super(props)

        this.state = {}
    }


    render = () => {
        return (
            <IntlProvider locale={'en'} messages={navigator.language === 'zh-CN' ? zh_CN : en_US} >
                <div className='header-new'>
                    <div className='header-new-con'>
                        <div className='header-new-item supply-balance'>
                            <span className='item-title'>
                                <FormattedMessage id='supply_balance' />
                            </span>
                            <span className='item-num'>
                                {this.props.data.my_supply ? '$' + format_num_to_K(this.props.data.my_supply) : '···'}
                            </span>
                        </div>

                        <div className='header-new-item borrow-balance'>
                            <span className='item-title'>
                                <FormattedMessage id='borrow_balance' />
                            </span>
                            <span className='item-num item-num-borrow'>
                                {this.props.data.my_borrow ? '$' + format_num_to_K(this.props.data.my_borrow) : '···'}
                            </span>
                        </div>

                        <div className='header-new-item'>
                            <span className='item-title'>
                                <FormattedMessage id='collateralization_ratio' />
                            </span>
                            <span className='item-num item-num-ratio'>
                                {
                                    Number(this.props.data.my_borrow) === 0 ?
                                        '···' : format_num_to_K((this.props.data.my_supply * 100 / this.props.data.my_borrow).toFixed(2).toString()) + '%'
                                }
                            </span>
                        </div>

                        {
                            this.props.supply_APR &&
                            <div className='header-new-item collate-rate'>
                                <span className='item-title'>
                                    <FormattedMessage id='supply_APR' />
                                </span>
                                <span className='item-num item-num-apr'>
                                    {
                                        this.props.supply_APR ?
                                            this.props.supply_APR === '0.00' ? '<0.01%' : this.props.supply_APR + '%'
                                            :
                                            '···'
                                    }
                                </span>
                            </div>
                        }

                        {
                            this.props.borrow_APR &&
                            <div className='header-new-item collate-rate'>
                                <span className='item-title'>
                                    <FormattedMessage id='borrow_APR' />
                                </span>
                                <span className='item-num item-num-apr'>
                                    {
                                        this.props.borrow_APR ?
                                            this.props.borrow_APR === '0.00' ? '<0.01%' : this.props.borrow_APR + '%'
                                            :
                                            '···'
                                    }
                                </span>
                            </div>
                        }
                    </div>
                </div>
            </IntlProvider>
        )
    }
}

export default MyStatus;
