import React, { Component } from 'react';
import './header.scss';

// add i18n.
import { IntlProvider, FormattedMessage } from 'react-intl';
import en_US from '../../language/en_US.js';
import zh_CN from '../../language/zh_CN';

import { format_num_to_K } from '../../util.js';

class My_status extends Component {
    constructor(props) {
        super(props)

        this.state = {}
    }


    render = () => {
        return (
            <IntlProvider locale={'en'} messages={navigator.language === 'zh-CN' ? zh_CN : en_US} >
                <div className='header-new'>
                    <div className='header-new-item supply-balance'>
                        <span className='item-title'>Supply Balance</span>
                        <span className='item-num'>
                            {this.props.data.my_supply ? '$' + format_num_to_K(this.props.data.my_supply) : '···'}
                        </span>
                    </div>

                    <div className='header-new-item borrow-balance'>
                        <span className='item-title'>Borrow Balance</span>
                        <span className='item-num item-num-borrow'>
                            {this.props.data.my_borrow ? '$' + format_num_to_K(this.props.data.my_borrow) : '···'}
                        </span>
                    </div>

                    <div className='header-new-item collate-rate'>
                        <span className='item-title'>Collateralization ratio</span>
                        <span className='item-num item-num-ratio'>
                            {Number(this.props.data.my_borrow) === 0 ? '···' : (this.props.data.my_supply * 100 / this.props.data.my_borrow).toFixed(2) + '%'}
                        </span>
                    </div>
                </div>
            </IntlProvider>
        )
    }
}

export default My_status;
