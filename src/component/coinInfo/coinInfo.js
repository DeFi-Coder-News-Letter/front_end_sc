import React from 'react';
import { toDoubleThousands } from './../../util.js';
import './coinInfo.scss'


const CoinInfo = (props) => {
  return (
    <div className='balance-info'>
      <span className='balance-desc'>{props.balanceDescription || props.balanceType + ' ' + props.balanceUnit}</span>
      <span className='balance-amount'>{props.login ? toDoubleThousands(props.balanceAmount) : '-'}&nbsp;{props.balanceType || 'Ether'}</span>
    </div>
  )
}

export default CoinInfo;