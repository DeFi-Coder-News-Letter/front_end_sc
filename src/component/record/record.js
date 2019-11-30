import React from 'react';
import { Popover } from 'antd';
// import { formatTransactionTime } from '../../util';
import './record.scss';

const Record = (props) => {
    return (
        <Popover placement="top" content={props.failedInfo} trigger={props.failed ? 'hover' : ''}>
            <div className='transaction' onClick={() => props.goTxnHashHref(props.txnHashHref)}>
                <div className='transaction-detail'>
                    <img style={{ height: '16px', width: '16px' }} src={`images/${props.icon}.png`} alt="RECORD"
                        className={props.icon === 'loading-supply' || props.icon === 'loading-borrow'
                            || props.icon === 'loading-borrow-repay' || props.icon === 'loading-borrow-approve'
                            || props.icon === 'loading-supply-wrap' || props.icon === 'loading-supply-unwrap'
                            || props.icon === 'loading-supply-weth' || props.icon === 'loading-supply-withdraw-weth'
                            || props.icon === 'loading-supply-usdx' || props.icon === 'loading-supply-withdraw-usdx'
                            || props.icon === 'loading-supply-weth-approve' || props.icon === 'loading-supply-usdx-approve' ? 'icon-loading' : 'normal'} />
                    <span style={{ marginLeft: '5px' }}>{props.transactionDetail}</span>
                </div>
                <div className='transaction-time'>
                    {/* <span>{formatTransactionTime(props.transactionTime)}</span> */}
                </div>
            </div>
        </Popover>
    )
}

export default Record;