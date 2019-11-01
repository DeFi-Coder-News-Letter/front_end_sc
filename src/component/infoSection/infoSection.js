import React from 'react';
import './infoSection.scss';

// add i18n.
import { IntlProvider, FormattedMessage } from 'react-intl';
import en_US from '../../language/en_US.js';
import zh_CN from '../../language/zh_CN';

const InfoSection = (props) => {
    return (
        <IntlProvider locale={'en'} messages={navigator.language === 'zh-CN' ? zh_CN : en_US} >
            <div className='info-sec-wrapper'>
                {props.accountInfo
                    .filter(info => info.page === props.currentPage)
                    .map(
                        (info, key) => (<div className='info-sec' index={key} key={key}>
                            <div>
                                <img src={'images/board_icon.png'} style={{ marginRight: '7px' }} alt="" />
                                {/* <div className='info-title'>{info.title}</div> */}
                                <div className='info-title'>{info.title === 'USDx Supplied' ? <FormattedMessage id='USDx_Supplied' /> : null}</div>
                                <div className='info-title'>{info.title === 'USDx Borrowed' ? <FormattedMessage id='USDx_Borrowed' /> : null}</div>
                                <div className='info-title'>{info.title === 'Utilization Rate' ? <FormattedMessage id='Utilization_Rate' /> : null}</div>
                                <div className='info-title'>{info.title === 'Collateralization ratio' ? <FormattedMessage id='Collateralization_ratio' /> : null}</div>
                                <div className='info-title'>{info.title === 'USDx Supply APR' ? <FormattedMessage id='USDx_Supply_APR' /> : null}</div>
                                <div className='info-title'>{info.title === 'USDx Borrow APR' ? <FormattedMessage id='USDx_Borrow_APR' /> : null}</div>

                                <div className='info-title'>{info.title === 'Total Supplied' ? <FormattedMessage id='Total_Supplied' /> : null}</div>
                                <div className='info-title'>{info.title === 'Total Borrowed' ? <FormattedMessage id='Total_Borrowed' /> : null}</div>
                                <div className='info-title'>{info.title === 'Supply APR' ? <FormattedMessage id='Supply_APR' /> : null}</div>
                                <div className='info-title'>{info.title === 'Borrow APR' ? <FormattedMessage id='Borrow_APR' /> : null}</div>

                                <div className='info-title'>{info.title === 'Supplied Balance' ? <FormattedMessage id='Supplied_Balance' /> : null}</div>
                                <div className='info-title'>{info.title === 'Borrowed Balance' ? <FormattedMessage id='Borrowed_Balance' /> : null}</div>
                                <div className='info-title'>{info.title === 'Available to Borrow' ? <FormattedMessage id='Available_to_Borrow' /> : null}</div>
                            </div>
                            <div className={`info-amount${key + 1}`}>{info.amount}</div>
                        </div>)
                    )
                }
            </div>
        </IntlProvider>
    )
}

export default InfoSection;