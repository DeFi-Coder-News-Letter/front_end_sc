import React, { Component } from 'react';
import './main.scss';
import { Link } from "react-router-dom";
import MediaQuery from 'react-responsive';
import AccountInfo from '../../container/accountInfo/accountInfo_main';
import { findNetwork, getLoginStatusKey } from '../../util.js'

class Main extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentAccount: null,
            isLogIn: false
        }
        this.web3 = window.web3;
        // this.localStorage = window.localStorage;
        // this.localStorage.isLogIn = JSON.stringify({isLogIn: false});
        // alert('main.js')

        this.componentDidMount_temp();

        if (this.web3.currentProvider.isMetaMask) {
            window.ethereum.on('accountsChanged', () => {
                this.componentDidMount_temp();
            });
        }

    }

    componentDidMount_temp = () => {
        // this.connectMetamask();
        // this.getCurentAccount();

        setTimeout(() => {
            this.connectMetamask();
            this.getCurentAccount();
        }, 700);

        this.getCurentAccountTimer = setInterval(() => {
            this.getCurentAccount();
            this.setLoginStatus();
            // console.log('main:' + this.props.isLogIn) // main:undefined
        }, 1000 * 15);
    }

    getCurentAccount = () => {
        if (typeof web3 !== 'undefined') {
            this.setState({ currentAccount: window.web3.eth.accounts[0] });
            if (!this.web3.eth.coinbase) {
                this.setState({ currentAccount: null });
            }
        }
    }

    setLoginStatus = () => {
        const { isSMView } = this.props;
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
        if (this.state.isLogIn !== true && isSMView) {
            this.setState({ isLogIn: true });
        }
        if (results === null) {
            return;
        }
        results = results.map(item => {
            if (item.account === this.web3.eth.accounts[0] && this.state.isLogIn !== item.isLogin && !isSMView) {
                this.setState({ isLogIn: item.isLogin });
            }
            return item.id;
        })
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
        // this.props.checkLogIn(true);
    }

    unConnectMetamask = () => {
        this.setState({ isLogIn: false });
        this.props.checkLogIn(false);
    }


    render() {
        let NetworkName;
        let account;
        if (typeof web3 !== 'undefined') {
            NetworkName = findNetwork(window.web3.version.network);
            account = this.web3.eth.accounts[0];
        }
        return (
            <MediaQuery maxWidth={736}>
                {(match) => <div className={'main-page ' + (match ? 'CM XS' : 'CM LG')}>
                    <div className='main-page-header'>
                        <img src={'images/logo@2x.svg'} className='header-logo' alt="MAIN" />
                        {match ? null : <div className='login-info-sec'>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <div className={account !== undefined && this.state.isLogIn ? 'signed-in' : 'connect-sign'}></div>
                                <span style={{ fontWeight: 500, paddingLeft: '8px' }}>{account !== undefined && this.state.isLogIn ? `${NetworkName}` : 'Unconnected'}</span>
                            </div>
                            <div className="login" style={{ fontWeight: 500 }}>
                                {account !== undefined && this.state.isLogIn ? account.substring(0, 8) + '...' + account.substring(account.length - 6) : 'Connect to Metamask'}
                                <div className="popup">
                                    <span><em></em></span>
                                    <p style={{ display: account !== undefined && this.state.isLogIn ? 'none' : 'block', fontWeight: 500 }} onClick={() => this.connectMetamask()}>Connect</p>
                                    <p className="out" style={{ display: account !== undefined && this.state.isLogIn ? 'block' : 'none', fontWeight: 500 }} onClick={() => this.unConnectMetamask()}>Logout</p>
                                </div>
                            </div>
                        </div>}
                    </div>
                    <div className='headline-wrapper'>
                        <div className='headline'>
                            <span>Decentralized Lending with Lendf.me</span>
                        </div>
                        {/* <div className='headline-intro'>
                                <div>Borrowing and lending are mutually exclusive and cannot be occur simultaneously; </div>
                                <div>In order to offer USDx in Lend page, you must first repay the USDx loan in the Borrow option.</div>
                            </div> */}
                    </div>
                    <div className='info-sec'>
                        <AccountInfo currentPage={'main'} account={this.state.currentAccount} login={this.state.isLogIn} />
                    </div>
                    <div className='button-container'>
                        <div className='lend-container'>
                            <div className='lend-button'>
                                <Link className={'lend-link'} to={{ pathname: './supply', state: { isLogIn: this.state.isLogIn } }} />
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <img src={'images/icon_s@2x.png'} alt="MAIN" />
                                    <div className='title'>Supply USDx</div>
                                </div>
                            </div>
                            <div className='description'>Supply your USDx assets to earn interest on your holdings.</div>
                        </div>
                        <div className='borrow-container'>
                            <div className='borrow-button'>
                                <Link className={'borrow-link'} to={{ pathname: './borrow', state: { isLogIn: this.state.isLogIn } }} />
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <img src={'images/icon_b@2x.png'} alt="MAIN" />
                                    <div className='title'>Borrow USDx</div>
                                </div>
                            </div>
                            <div className='description'>Pledge WETH assets to borrow USDx instantly, at competitive interest rate.</div>
                        </div>
                    </div>
                </div>}
            </MediaQuery>
        );
    }
}

export default Main;