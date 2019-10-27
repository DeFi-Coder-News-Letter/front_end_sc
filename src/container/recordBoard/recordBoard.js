import React, { Component } from 'react';
import Record from '../../component/record/record';
import Asset from '../../constant.json';
import { getTransactionHistoryKey } from '../../util.js'

import './recordBoard.scss';

class RecordBoard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            RecentTransactions: []
        }
        this.web3 = window.web3;

        this.componentDidMount_temp();

        window.ethereum.on('accountsChanged', () => {
            this.componentDidMount_temp();
        });
    }

    getRecentTransactions = () => {
        if (window.localStorage) {
            if (typeof web3 === 'undefined') {
                return;
            }
            // console.log(txIdExist(0x884a4e6c34e471ec2398f4b3e71eb0b27a59844aedb8d4abfb05a85eac6e805f))
            let storage = window.localStorage;
            let key = getTransactionHistoryKey(this.props.account, Asset['Asset'][this.props.coinType], this.props.page, this.web3.version.network);
            let results = JSON.parse(`${storage.getItem(key)}`);
            if (results !== null) {
                results.reverse();
            }
            this.setState({ RecentTransactions: results });
        }
    }

    goTxnHashHref = (txnHashHref) => {
        window.open(txnHashHref, '_blank');
    }

    componentDidMount_temp = () => {
        // this.getRecentTransactions();

        setTimeout(() => {
            this.getRecentTransactions();
        }, 700);

        this.timerID = setInterval(() => {
            if (this.props.account !== undefined) {
                this.getRecentTransactions();
            }
        }, 1000 * 15);
    }

    componentWillUnmount() {
        clearInterval(this.timerID);
    }

    renderRecord() {
        if (this.state.RecentTransactions === null) {
            return '';
        }
        return (<div className='record-board'>
            <div className='board-title'>Recent Transactions</div>
            <div className='board-content'>
                {this.state.RecentTransactions ? this.state.RecentTransactions.map((record, i) => <div key={i}><Record {...record} goTxnHashHref={this.goTxnHashHref} /></div>) : null}
            </div>
        </div>);
    }

    render = () => {
        return (
            this.renderRecord()
        )
    }
}

export default RecordBoard;