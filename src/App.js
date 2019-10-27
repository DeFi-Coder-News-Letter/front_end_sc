import React, { Component } from 'react';
import './App.scss';
import { Alert } from 'antd';
import { Route, Switch } from "react-router-dom";
import Borrow from './pages/borrow/borrow';
import Lend from './pages/lend/lend';
import Main from './pages/main/main';
import MediaQuery from 'react-responsive';
import { findNetwork, saveLoginStatus, getLoginStatusKey } from './util.js';

const mainnetOrRinkebyIconAlert = <img style={{ margin: 'auto' }} src={`images/alert_icon.png`} alt="" />;
const noteIconAlert = <img style={{ margin: 'auto' }} src={`images/note_alert.png`} alt="" />;

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isConnected: false,
      isLogIn: false,
      web3NoExist: false,
      networkName: '',
      myAddress: ''
    };
    this.web3 = window.web3;
  }

  componentWillMount() {
    if (typeof web3 !== 'undefined') {
      let NetworkName = findNetwork(this.web3.version.network);
      this.setState({ isConnected: true, networkName: NetworkName, myAddress: this.web3.eth.accounts[0] });
      if (this.web3.currentProvider.isMetaMask === true) {
        console.log('MetaMask.')
      } else {
        console.log('MetaMask_is_not_available.')
      }
    } else {
      this.setState({ web3NoExist: true });
      console.log('web3 is not found.')
    }
  }

  componentDidMount() {
    if (this.state.web3NoExist === true) {
      return;
    }
    if (this.web3.eth.accounts[0] !== this.state.myAddress) {
      this.setState({ myAddress: this.web3.eth.accounts[0] });
    }

    this.timerID = setInterval(() => {
      if (this.state.web3NoExist === true) {
        return;
      }
      if (this.web3.eth.accounts[0] !== this.state.myAddress) {
        // window.location.reload();
        this.setState({ myAddress: this.web3.eth.accounts[0] });
      }
      let NetworkName = findNetwork(this.web3.version.network);
      if (NetworkName !== this.state.networkName) {
        this.setState({ networkName: NetworkName });
      }
      var storage = null;
      var results = null;
      var key = getLoginStatusKey(this.web3.eth.accounts[0]);
      if (window.localStorage) {
        storage = window.localStorage;
        results = JSON.parse(`${storage.getItem(key)}`);
      }
      if (results === null) {
        return;
      }
      results = results.map(item => {
        if (item.account === this.web3.eth.accounts[0] && this.state.isLogIn !== item.isLogin) {
          this.setState({ isLogIn: item.isLogin });
        }
        return item.id;
      })
    }, 5000);
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

  componentWillUnmount() {
    clearInterval(this.timerID);
  }


  render() {
    return (
      <MediaQuery maxWidth={736}>
        {(match) => (
          <Switch>
            <div className="App">
              <div className="App-header">
                {
                  ((this.state.networkName !== "Main" && this.state.networkName !== "Rinkeby") || this.state.networkName === "Unknown") && !(this.state.myAddress === undefined && !this.state.web3NoExist) && !match
                    ?
                    <Alert message="Lendf.me is currently only available on Mainnet or the Rinkeby Testnet." type="error" onClose='' icon={mainnetOrRinkebyIconAlert} showIcon />
                    :
                    null
                }

                {
                  ((this.state.networkName !== "Main" && this.state.networkName === "Rinkeby") || this.state.networkName === "Unknown") && !(this.state.myAddress === undefined && !this.state.web3NoExist) && !match
                    ?
                    <Alert message="Note: You are currently connected to the Rinkeby Testnet" type="informational" onClose='' className='informational-banner' icon={noteIconAlert} showIcon />
                    :
                    null
                }
                <Route exact path="/" render={() => <Main checkLogIn={this.checkLogIn} isSMView={!!match} />} />
                <Route path="/supply" render={() => <Lend checkLogIn={this.checkLogIn} isSMView={!!match} />} />
                <Route path="/borrow" render={() => <Borrow checkLogIn={this.checkLogIn} isSMView={!!match} />} />
              </div>
            </div>
          </Switch>
        )}
      </MediaQuery>
    );
  }
}

export default App;
