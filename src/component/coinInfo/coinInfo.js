import React from 'react';
import { toDoubleThousands } from './../../util.js';
import './coinInfo.scss'

// add i18n.
import { IntlProvider, FormattedMessage } from 'react-intl';
import en_US from '../../language/en_US.js';
import zh_CN from '../../language/zh_CN';

const CoinInfo = (props) => {
  return (
    <IntlProvider locale={'en'} messages={navigator.language === 'zh-CN' ? zh_CN : en_US} >
      <div className='balance-info'>
        {/* <span className='balance-desc'>{props.balanceDescription || props.balanceType + ' ' + props.balanceUnit}</span> */}

        <span className='balance-desc'>
          {(props.balanceType + ' ' + props.balanceUnit) === 'USDx Balance' ? <FormattedMessage id='USDx_Balance' /> : null}
          {(props.balanceType + ' ' + props.balanceUnit) === 'USDx Available' ? <FormattedMessage id='USDx_Available' /> : null}
          {(props.balanceType + ' ' + props.balanceUnit) === 'ETH Balance' ? <FormattedMessage id='ETH_Balance' /> : null}
          {(props.balanceType + ' ' + props.balanceUnit) === 'WETH Balance' ? <FormattedMessage id='WETH_Balance' /> : null}
          {(props.balanceType + ' ' + props.balanceUnit) === 'WETH Available' ? <FormattedMessage id='WETH_Available' /> : null}
        </span>

        <span className='balance-amount'>{props.login ? toDoubleThousands(props.balanceAmount) : '-'}&nbsp;{props.balanceType || 'Ether'}</span>
      </div>
    </IntlProvider>
  )
}

export default CoinInfo;