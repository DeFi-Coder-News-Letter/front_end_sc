import React from 'react';
import { toDoubleThousands } from '../../util.js';

import './coinInfoWithIcon.scss'

const CoinInfoWithIcon = (props) => {
  const web3 = window.web3;
  return (
    <div className='info-wrapper'>
      <span className='balance-type'>
        <img style={{ width: '16px', height: '16px', margin: 'auto' }} src={`images/${props.coin}@2x.png`} alt="" />
        &nbsp;{props.coin}&nbsp;{props.action}
      </span>

      <span className='balance-amount'>
        {(typeof web3 === 'undefined' || web3.eth.accounts[0] === undefined || web3.eth.accounts[0] === '' || !props.login)
          ?
          '-' : toDoubleThousands(props.coinBalance)}
      </span>
    </div>
  )
}

export default CoinInfoWithIcon;