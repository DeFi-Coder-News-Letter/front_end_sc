import React from 'react';
import {InputNumber, Button} from 'antd';

import './wrapInputUnit.scss'

const WrapInputUnit = (props) => {
    return (
        <div className='input-wrap-unit-wrapper'>
            {/* <div className='balance-info'>
                <span className='balance-desc'>{props.balanceDescription || props.balanceType + ' ' + props.balanceUnit}</span>
                <span className='balance-amount'>{props.balanceAmount || '-'}&nbsp;ETH</span>
            </div> */}
            <div className='wrap-input-wrapper'> 
                <div className='input-wrapper'>
                    <InputNumber  
                        size='large'
                        placeholder={props.placeholderHint}
                        min={props.minAmount}
                        // max={props.maxAmount}
                        step={props.step}
                        value={props.amount}
                        onChange={props.handleChange}
                        className= 'input-number'
                        disabled={props.inputDisabled}/>
                </div>
                <div className='button-wrapper'>
                    <Button size='large' className={!props.isEnable ? 'disable-button' : ''} onClick={props.handleClick} disabled={!props.isEnable}>{props.buttonInfo}</Button>
                </div> 
            </div>
        </div>
    )
}

export default WrapInputUnit;