import React from 'react';
import {Button} from 'antd';
import './approve.scss';

const Approve = (props) => {
    return (
        <div className='approve-section'>
            <div className='enable-message'>{props.enableMessage}</div>
            <div className={props.page === 'borrow' ? 'button-wrapper-borrow' : 'button-wrapper'}>
                <Button size='large' className={!props.isEnable ? 'disable-button' : ''} onClick={props.handleClick} disabled={!props.isEnable}>{props.buttonInfo}</Button>
            </div>
        </div>
    )
}

export default Approve;