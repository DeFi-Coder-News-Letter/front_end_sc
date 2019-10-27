import React from 'react';
import {Button, InputNumber} from 'antd';

import './unWrapInputUnit.scss'

const UnWrapInputUnit = (props) => {
    // maxAmount
    return (
        <div className='input-unwrap-unit-wrapper'>
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
                {/* {props.handleWithdrawMax ? <span className="max-amount-button" onClick={props.handleWithdrawMax}>MAX</span> : null} */}
                    <span className={props.maxClassName} onClick={props.inputDisabled ? '' : props.handleMax}>MAX</span>
            </div>
            <div className='button-wrapper'>
                <Button size='large' className={!props.isEnable ? 'disable-button' : ''} onClick={props.handleClick} disabled={!props.isEnable}>{props.buttonInfo}</Button>
            </div>  
        </div>
    )
}

export default UnWrapInputUnit;