import React, { Component } from 'react';
import CoinInfo from '../../component/coinInfo/coinInfo';
import './coinAvailable.scss';

class CoinAvailable extends Component {

  render = () => {
    const props = {
      balanceDescription: '',
      balanceAmount: this.props.fa_maxWithdrawAmount,
      balanceType: 'WETH',
      balanceUnit: 'Available',
    }
    return (
      <CoinInfo {...props} login={this.props.login} />
    )
  }
}

export default CoinAvailable;