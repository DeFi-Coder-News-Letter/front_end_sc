import React from 'react';
import { Button } from 'antd';
import './approve.scss';

// add i18n.
import { IntlProvider, FormattedMessage } from 'react-intl';
import en_US from '../../language/en_US.js';
import zh_CN from '../../language/zh_CN';

const Approve = (props) => {
    return (
        <IntlProvider locale={'en'} messages={navigator.language === 'zh-CN' ? zh_CN : en_US} >
            <div className='approve-section'>
                <div className='enable-message'>
                    {/* {props.enableMessage} */}
                    {props.enableMessage === 'Before supplying USDx for the first time, you must enable USDx.' ? <FormattedMessage id='Before_supplying' /> : null}
                    {props.enableMessage === 'Before supplying WETH for the first time, you must enable WETH.' ? <FormattedMessage id='Before_supplying_WETH' /> : null}
                    {props.enableMessage === 'Before Borrowing USDx for the first time, you must enable USDx.' ? <FormattedMessage id='Before_borrowing' /> : null}
                </div>
                <div className={props.page === 'borrow' ? 'button-wrapper-borrow' : 'button-wrapper'}>
                    <Button size='large' className={!props.isEnable ? 'disable-button' : ''} onClick={props.handleClick} disabled={!props.isEnable}>{props.buttonInfo}</Button>
                </div>
            </div>
        </IntlProvider>
    )
}

export default Approve;