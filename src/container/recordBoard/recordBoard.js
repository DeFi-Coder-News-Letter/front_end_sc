import React, { Component } from "react";
import Record from "../../component/record/record";
import Asset from "../../constant.json";
import { getTransactionHistoryKey, formatTransactionTime, format_bn } from "../../util.js";

import { Popover } from 'antd';
import moment from 'moment';
import "./recordBoard.scss";

let constant = require('../../ABIs/constant.json');

class RecordBoard extends Component {
    constructor(props) {
        super(props);

        this.state = {
            RecentTransactions: []
        };

        this.decimal_precision = constant.decimal_precision;
    }



    load_history = () => {
        if (window.localStorage) {
            let key = this.props.account + '-' + this.props.net_type;
            let results_arr = JSON.parse(`${window.localStorage.getItem(key)}`) || [];

            if (results_arr !== null) {
                results_arr.reverse();
                // console.log(JSON.stringify(results_arr));

                this.setState({ RecentTransactions: results_arr }, () => {
                    results_arr.map(item => {
                        if (item.status === 'pendding') {

                            var timerOBJ = {};
                            var tempRnum = Math.random();
                            timerOBJ[tempRnum] = setInterval(() => {

                                console.log('checking getTransactionReceipt...');

                                this.props.new_web3.eth.getTransactionReceipt(item.hash, (res_fail, res_success) => {

                                    // 合约有信息返回
                                    if (res_success) {
                                        // console.log(JSON.stringify(res_success));
                                        console.log(' *** i got getTransactionReceipt... *** ');
                                        clearInterval(timerOBJ[tempRnum]);

                                        // 有状态返回 存入localstorage
                                        let contractData = JSON.parse(window.localStorage.getItem(key));
                                        contractData.map((temp_item) => {
                                            if (temp_item.hash === res_success.transactionHash) {
                                                var temp_status;
                                                if (res_success.status === true) {
                                                    temp_status = 'success'
                                                } else {
                                                    temp_status = 'fail'
                                                }
                                                temp_item.res_origin = res_success;
                                                temp_item.status = temp_status;
                                            }
                                        })

                                        window.localStorage.setItem(key, JSON.stringify(contractData));

                                        setTimeout(() => {
                                            console.log(' *** i load_history again *** ');
                                            this.load_history();
                                        }, 300);
                                    }


                                    if (res_fail) {
                                        console.log(res_fail);
                                        clearInterval(timerOBJ[tempRnum]);
                                    }
                                })
                            }, 2000)
                        }
                    })
                });
            }
        }
    }


    goTxnHashHref = txnHashHref => {
        window.open(txnHashHref, "_blank");
    };


    componentDidMount = () => {
        this.load_history();
    };


    componentWillUnmount() {
        // clearInterval(this.timerID);
    }


    componentWillReceiveProps = (nextProps) => {
        if (this.props.load_new_history !== nextProps.load_new_history) {
            console.log(this.props.load_new_history !== nextProps.load_new_history, 'i will load new history.');
            this.load_history();
        }
    }


    renderRecord() {
        if (this.state.RecentTransactions === null) {
            return "";
        }

        return (
            <div className="record-board">
                {
                    (this.state.RecentTransactions && this.state.RecentTransactions.length > 0) &&
                    <div className="board-title">Recent Transactions</div>
                }

                <div className="board-content">
                    {
                        this.state.RecentTransactions ?
                            this.state.RecentTransactions.map((item, i) => {

                                if (item.token !== this.props.token) {
                                    return false;
                                }

                                var img_src;

                                if (item.status === 'pendding') {
                                    if (item.action === 'borrow' || item.action === 'repay') {
                                        img_src = 'loading_02'
                                    } else {
                                        img_src = 'loading_01'
                                    }
                                } else if (item.status === 'success') {
                                    // item.action; //   wrap unwrap  
                                    img_src = item.action;
                                }


                                return (
                                    <div key={i}>
                                        {/* <Popover  placement="top" content={props.failedInfo} trigger={props.failed ? 'hover' : ''}> */}
                                        {/* <Popover> */}
                                        <div className='transaction' onClick={() => this.goTxnHashHref(this.goTxnHashHref)}>
                                            <div className='transaction-detail'>
                                                <img
                                                    style={{ height: '16px', width: '16px' }}
                                                    src={`images/${img_src}.png`}
                                                    alt="RECORD"
                                                    className={item.status === 'pendding' ? 'icon-loading' : null}
                                                />
                                                <span style={{ marginLeft: '5px' }}>
                                                    {
                                                        item.action === 'approve' ?
                                                            'Enable ' :
                                                            item.action.substring(0, 1).toUpperCase() + item.action.substring(1) + ' '
                                                    }
                                                    {
                                                        item.action === 'approve' ?
                                                            null :
                                                            format_bn(item.amount, this.props.decimal, this.decimal_precision) + ' '
                                                    }
                                                    {item.token}
                                                </span>
                                            </div>
                                            <div className='transaction-time'>
                                                <span>
                                                    {moment(item.timestamp).format('MMM. DD, HH:mm')}
                                                </span>
                                            </div>
                                        </div>
                                        {/* </Popover> */}
                                    </div>
                                )
                            })
                            :
                            null
                    }
                </div>
            </div>
        );
    }

    render = () => {
        return this.renderRecord();
    };
}

export default RecordBoard;
