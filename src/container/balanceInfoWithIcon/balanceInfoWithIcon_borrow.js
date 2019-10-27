import React, { Component } from 'react';
import MoneyMarket from '../../ABIs/MoneyMarket.js';
import Network from '../../constant.json';
import './balanceInfoWithIcon.scss';
import { findNetwork } from '../../util.js';
import CoinInfoWithIcon from '../../component/coinInfoWithIcon/coinInfoWithIcon';

class BalanceInfoWithIcon extends Component {
  constructor(props) {
    super(props);
    this.state = {
      suppliedwethBalance: 0,
      suppliedusdxBalance: 0,
      borrowedusdxBalance: 0
    }
    this.web3 = window.web3;

    this.componentDidMount_temp();

    window.ethereum.on('accountsChanged', () => {
      this.componentDidMount_temp();
    });
  }

  get_Supply_WETH_Amount = () => {
    if (typeof web3 !== 'undefined' && this.web3.eth.accounts[0] !== undefined && MoneyMarket() !== undefined) {
      let wethAddress = '';
      let NetworkName = findNetwork(window.web3.version.network);
      if (NetworkName === 'Main') {
        wethAddress = Network.Main.WETH;
      } else if (NetworkName === 'Rinkeby') {
        wethAddress = Network.Rinkeby.WETH;
      }
      MoneyMarket().getSupplyBalance(this.web3.eth.accounts[0],
        wethAddress,
        (err, res) => {
          if (res !== undefined && res !== null) {
            this.setState({ suppliedwethBalance: this.web3.fromWei(res.toNumber(), "ether") });
          }
        }
      );
    }
  }

  componentDidMount_temp = () => {
    setTimeout(() => {
      this.get_Supply_WETH_Amount();
    }, 700);
    this.timerID = setInterval(() => {
      if (typeof web3 !== 'undefined' && this.web3.eth.accounts[0] !== undefined) {
        this.get_Supply_WETH_Amount();
      }
    }, 1000 * 15);
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  render() {
    const props = {
      coin: this.props.coin,
      action: this.props.action,
      coinBalance: this.state.suppliedwethBalance,
      login: this.web3.eth.accounts[0]
    }
    return <CoinInfoWithIcon {...props} />
  }
}

export default BalanceInfoWithIcon;