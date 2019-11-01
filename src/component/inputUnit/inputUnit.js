import React from 'react';
import { Button, InputNumber } from 'antd';
import './inputUnit.scss';

// add i18n.
import { IntlProvider, FormattedMessage } from 'react-intl';
import en_US from '../../language/en_US.js';
import zh_CN from '../../language/zh_CN';

const InputUnit = (props) => {
    // return false;
    const { hasBorrowedUSDx, hasLendUSDx } = props;
    const borrowAlertMsg = 'Already supplied USDx, please withdraw all of them in Lend Page before borrowing any.';
    const supplyAlertMSG = 'Already borrowed USDx, please repay all of them in Borrow Page before supplying any.';

    return (
        <IntlProvider locale={'en'} messages={navigator.language === 'zh-CN' ? zh_CN : en_US} >
            <div className='input-unit-wrapper'>
                {!(hasLendUSDx || hasBorrowedUSDx)
                    ?
                    <div className='input-wrapper'>
                        <InputNumber size='large' placeholder={props.placeholderHint} min={props.minAmount} step={props.step} value={props.amount} onChange={props.handleChange} className='input-number' disabled={props.inputDisabled} />
                        <span className={props.maxClassName} onClick={props.inputDisabled ? '' : props.handleMax}>{props.safeMax}MAX</span>
                    </div>
                    :
                    <div className='alert-message'>
                        {
                            !!hasLendUSDx
                                ?
                                // borrowAlertMsg
                                <FormattedMessage id='Already_supplied' />
                                :
                                // supplyAlertMSG
                                <FormattedMessage id='Already_borrowed' />
                        }
                    </div>
                }

                {
                    props.exceedsSafeMax
                        ?
                        <div className='safe-max-alert-message'>
                            {/* Borrowing exceeds SAFE value makes your supply in risk. */}
                            <FormattedMessage id='Borrowing_exceeds' />
                        </div>
                        :
                        ''
                }

                <div className={props.buttonClassName}>
                    <Button size='large' className={!!(hasBorrowedUSDx || hasLendUSDx || !props.isEnable) ? 'disable-button' : ''} onClick={props.handleClick} disabled={!props.isEnable || !!(hasBorrowedUSDx || hasLendUSDx)}>
                        {props.buttonInfo}
                    </Button>
                </div>
            </div>
        </IntlProvider>
    )
}

export default InputUnit;