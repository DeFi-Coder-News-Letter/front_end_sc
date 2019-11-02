import React from 'react';
import { toDoubleThousands } from '../../util.js';

import './coinInfoWithIcon.scss'

// add i18n.
import { IntlProvider, FormattedMessage } from 'react-intl';
import en_US from '../../language/en_US.js';
import zh_CN from '../../language/zh_CN';

const CoinInfoWithIcon = (props) => {
  const web3 = window.web3;
  return (
    <IntlProvider locale={'en'} messages={navigator.language === 'zh-CN' ? zh_CN : en_US} >
      <div className='info-wrapper'>
        <span className='balance-type'>
          <img style={{ width: '16px', height: '16px', margin: 'auto' }} src={`images/${props.coin}@2x.png`} alt="" />
          &nbsp;
          {/* {props.coin}&nbsp;{props.action} */}
          {(props.coin + ' ' + props.action) === 'USDx Supplied' ? <FormattedMessage id='USDx_Supplied' /> : null}
          {(props.coin + ' ' + props.action) === 'WETH Supplied' ? <FormattedMessage id='WETH_Supplied' /> : null}
          {(props.coin + ' ' + props.action) === 'USDx Borrowed' ? <FormattedMessage id='USDx_Borrowed_borrow' /> : null}
        </span>

        <span className='balance-amount'>
          {(typeof web3 === 'undefined' || web3.eth.accounts[0] === undefined || web3.eth.accounts[0] === '' || !props.login)
            ?
            '-' : toDoubleThousands(props.coinBalance)}
        </span>
      </div>
    </IntlProvider>
  )
}

export default CoinInfoWithIcon;