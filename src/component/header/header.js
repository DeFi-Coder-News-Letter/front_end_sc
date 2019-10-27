import React, { Component } from 'react';
import USDX from "./../../ABIs/USDX.js";
import WETH from "./../../ABIs/WETH.js";
import { findNetwork, saveLoginStatus, getLoginStatusKey } from './../../util.js';
import './header.scss';


class Header extends Component {
    constructor(props) {
        super(props)
        this.state = {
            isLogIn: false,
            ETHToUSD: '-',
        }
        this.web3 = window.web3;

        this.componentDidMount_temp();

        window.ethereum.on('accountsChanged', () => {
            this.componentDidMount_temp();
        });
    }

    checkLogIn = (isLogin) => {
        // save to local storage
        if (typeof web3 === 'undefined' || this.web3.eth.accounts[0] === undefined) {
            return;
        }
        var storage = null;
        var results = null;
        var key = getLoginStatusKey(this.web3.eth.accounts[0]);
        if (window.localStorage) {
            storage = window.localStorage;
            results = JSON.parse(`${storage.getItem(key)}`);
        }
        if (results === null) {
            saveLoginStatus(this.web3.eth.accounts[0], isLogin);
            return;
        }
        storage.removeItem(key);
        results = results.map(item => {
            if (item.account === this.web3.eth.accounts[0]) {
                return {
                    ...item,
                    isLogin: isLogin
                }
            }
            return {
                ...item
            }
        })
        storage.setItem(key, JSON.stringify(results));
    }

    connectMetamask = () => {
        if (typeof web3 === 'undefined') {
            return;
        }
        window.web3.currentProvider.enable().then(
            res => {
                this.setState({ isLogIn: true });
            }
        )
        this.checkLogIn(true);
    }

    unConnectMetamask = () => {
        this.setState({ isLogIn: false });
        this.checkLogIn(false);
    }

    componentDidMount_temp = () => {
        // this.connectMetamask();
        // this.getETHAssetPrices();

        setTimeout(() => {
            this.connectMetamask();
            // this.getETHAssetPrices();
        }, 700);

        this.timerID = setInterval(() => {
            // this.getETHAssetPrices();
            var storage = null;
            var results = null;
            if (typeof web3 === 'undefined' || this.web3.eth.accounts[0] === undefined) {
                return;
            }
            var key = getLoginStatusKey(this.web3.eth.accounts[0]);
            if (window.localStorage) {
                storage = window.localStorage;
                results = JSON.parse(`${storage.getItem(key)}`);
            }
            if (results === null) {
                return;
            }
            // console.log('header --- is login.');
            results = results.map(item => {
                if (item.account === this.web3.eth.accounts[0] && this.state.isLogIn !== item.isLogin) {
                    this.setState({ isLogIn: item.isLogin });
                }
                return item.id;
            })
        }, 1000 * 15)
    }

    componentWillUnmount() {
        clearInterval(this.timerID);
    }

    // 领取测试币 USDx
    allocateUSDx = () => {
        if (typeof web3 === 'undefined' || this.web3.eth.accounts[0] === undefined) {
            return;
        }
        USDX().allocateTo(this.web3.eth.accounts[0], this.web3.toWei(100, "ether"), (err, res) => { });
    }

    // 测试用 weth_faucet
    allocateWETH = () => {
        if (typeof web3 === 'undefined' || this.web3.eth.accounts[0] === undefined) {
            return;
        }
        WETH().allocateTo(this.web3.eth.accounts[0], this.web3.toWei(100, "ether"), (err, res) => { });
    }

    render = () => {
        let NetworkName = window.web3 !== undefined ? findNetwork(window.web3.version.network) : null;
        return (
            <div className={'header ' + (NetworkName === 'Main' ? 'without-banner' : 'with-banner')}>
                <div className='header-content'>
                    <div className='left'>
                        <img className='header-logo' style={{ margin: 'auto' }} src={'images/h_logo@2x.svg'} alt="HEADER" />

                        <div className='market-info'>
                            <span className='market-info-title'>USDx Balance{window.web3 !== undefined && findNetwork(window.web3.version.network) === 'Rinkeby' ? <a className='usdx-faucet' onClick={this.allocateUSDx}>Faucet</a> : ''}</span>
                            <span className='market-info-digits'>{this.props.USDxBalance}</span>
                        </div>

                        <div className='market-info'>
                            <span className='market-info-title'>ETH Balance</span>
                            <span className='market-info-digits'>{this.props.ETHBalance}</span>
                        </div>

                        <div className='market-info'>
                            <span className='market-info-title'>WETH Balance</span>
                            <span className='market-info-digits'>{this.props.WETHBalance}</span>
                        </div>

                        <div className='market-info'>
                            <span className='market-info-title'>ETH/USD</span>
                            <span className='market-info-digits'>{this.props.ETHToUSD}</span>
                        </div>
                    </div>



                    <div className='right'>
                        {/* <div className='account-info'>
                            <div className='market-info-digits'><i />  {this.props.networkName}</div>
                            <div className='market-info-digits'>{this.props.account}</div>
                        </div> */}
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <div className={this.props.account !== undefined && this.state.isLogIn ? 'signed-in' : 'connect-sign'}></div>
                            <span style={{ fontWeight: 500, paddingLeft: '8px', color: '#FFF' }}>{this.props.account !== undefined && this.state.isLogIn ? `${this.props.networkName}` : 'Unconnected'}</span>
                        </div>
                        <div className="login" style={{ fontWeight: 500, color: '#FFF' }}>
                            {this.props.account !== undefined && this.state.isLogIn ? this.props.account.substring(0, 8) + '...' + this.props.account.substring(this.props.account.length - 6) : 'Connect to Metamask'}
                            <div className="popup">
                                <span><em></em></span>
                                <p style={{ display: this.props.account !== undefined && this.state.isLogIn ? 'none' : 'block', fontWeight: 500 }} onClick={() => this.connectMetamask()}>Connect</p>
                                <p className="out" style={{ display: this.props.account !== undefined && this.state.isLogIn ? 'block' : 'none', fontWeight: 500 }} onClick={() => this.unConnectMetamask()}>Logout</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default Header;
