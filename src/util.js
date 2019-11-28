import moment from 'moment';
import Asset from './constant.json';


export const get_allowance = async (contractInstance, my_account, address_mMarket, bn) => {
  return new Promise((resolve) => {
    contractInstance.methods.allowance(my_account, address_mMarket).call((err, res_allowance) => {
      console.log('res_allowance: ', res_allowance);
      if (bn(res_allowance).gt(bn('0'))) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  })
}


export const handle_supply_max = (that, balance, decimals) => {
  var to_show;
  if (balance.length <= decimals) {
    to_show = ('0.' + ('000000000000000000' + balance).substr(-decimals)).substring(0, 18);
  } else {
    to_show = (that.bn(balance).div(that.bn(10 ** decimals)) + '.' + balance.substr(-decimals)).substring(0, 18);
  }

  that.setState({
    supply_amount: to_show,
    i_will_supply_max: true
  });
}


export const handle_withdraw_max = (that, balance, decimals) => {
  var to_show;
  if (balance.length <= decimals) {
    to_show = ('0.' + ('000000000000000000' + balance).substr(-decimals)).substring(0, 18);
  } else {
    to_show = (that.bn(balance).div(that.bn(10 ** decimals)) + '.' + balance.substr(-decimals)).substring(0, 18);
  }

  that.setState({
    withdraw_amount: to_show,
    i_will_withdraw_max: true
  });
}


export const handle_supply_change = (value, that, decimals, balance) => {
  if (value.length > 18) {
    return;
  }

  that.setState({ i_will_supply_max: false });

  if (value === null || value === '') {
    console.log("value === null || value === ''")
    that.setState({
      is_supply_enable: true,
      supply_amount: null
    });
    return false;
  } else {
    var amount_bn;
    var temp_value = value;
    if (temp_value.indexOf('.') > 0) {
      var sub_num = temp_value.length - temp_value.indexOf('.') - 1;// 3
      if (sub_num > decimals) {
        console.log(' --- decimals extent ---');
        that.setState({
          supply_amount: value,
          is_supply_enable: false
        });
        return false;
      }
      temp_value = temp_value.substr(0, temp_value.indexOf('.')) + temp_value.substr(value.indexOf('.') + 1);// '123456'
      amount_bn = that.bn(temp_value).mul(that.bn(10 ** (decimals - sub_num)));// bn_'123456'
    } else {
      amount_bn = that.bn(value).mul(that.bn(10 ** decimals));
    }

    console.log(amount_bn.toString());

    if (amount_bn.sub(that.bn(balance)) > 0) {
      console.log(' --- INSUFFICIENT BALANCE ---');
      that.setState({
        supply_amount: value,
        is_supply_enable: false
      });
      return false;
    }
  }

  that.setState({ supply_amount: value });

  if ((Number(value)) === 0) {
    that.setState({ is_supply_enable: false });
    return;
  } else {
    that.setState({ is_supply_enable: true });
  }
}


export const handle_withdraw_change = (value, that, decimals, balance) => {
  if (value.length > 18) {
    return;
  }

  that.setState({ i_will_withdraw_max: false });

  if (value === null || value === '') {
    console.log("value === null || value === ''")
    that.setState({
      is_withdraw_enable: true,
      withdraw_amount: null
    });
    return false;
  } else {
    var amount_bn;
    var temp_value = value;
    if (temp_value.indexOf('.') > 0) {
      var sub_num = temp_value.length - temp_value.indexOf('.') - 1;// 3
      if (sub_num > decimals) {
        console.log(' --- decimals extent ---');
        that.setState({
          withdraw_amount: value,
          is_withdraw_enable: false
        });
        return false;
      }
      temp_value = temp_value.substr(0, temp_value.indexOf('.')) + temp_value.substr(value.indexOf('.') + 1);// '123456'
      amount_bn = that.bn(temp_value).mul(that.bn(10 ** (decimals - sub_num)));// bn_'123456'
    } else {
      amount_bn = that.bn(value).mul(that.bn(10 ** decimals));
    }

    console.log(amount_bn.toString());

    if (amount_bn.sub(that.bn(balance)) > 0) {
      console.log(' --- INSUFFICIENT BALANCE ---');
      that.setState({
        withdraw_amount: value,
        is_withdraw_enable: false
      });
      return false;
    }
  }

  that.setState({ withdraw_amount: value });

  if ((Number(value)) === 0) {
    that.setState({ is_withdraw_enable: false });
    return;
  } else {
    that.setState({ is_withdraw_enable: true });
  }
}


export const format_bn = (numStr, decimals, decimalPlace = decimals) => {
  numStr = numStr.toLocaleString().replace(/,/g, '');
  // decimals = decimals.toString();

  var str = (10 ** decimals).toLocaleString().replace(/,/g, '').slice(1);

  var res = (numStr.length > decimals ?
    numStr.slice(0, numStr.length - decimals) + '.' + numStr.slice(numStr.length - decimals) :
    '0.' + str.slice(0, str.length - numStr.length) + numStr).replace(/(0+)$/g, "");

  res = res.slice(-1) == '.' ? res + '00' : res;

  if (decimalPlace == 0)
    return res.slice(0, res.indexOf('.'));

  var length = res.indexOf('.') + 1 + decimalPlace;
  return res.slice(0, length >= res.length ? res.length : length);
  // return res.slice(-1) == '.' ? res + '00' : res;
}


export const get_my_balance = (tokenContract, account, that) => {
  tokenContract.methods.balanceOf(account).call((err, res_balance) => {
    if (res_balance) {
      that.setState({
        my_balance: res_balance
      }, () => {
        // console.log(that.state.my_balance)
        // console.log(typeof (res_balance))
      })
    }
  });
}


export const get_supplied__available_to_withdraw = (mContract, tokenContract, account, token_address, m_address, that) => {
  mContract.methods.getSupplyBalance(account, token_address).call((err, res_supplied) => {

    that.setState({ my_supplied: res_supplied }, () => {

      mContract.methods.calculateAccountValues(account).call((err, res_account_values) => {
        mContract.methods.assetPrices(token_address).call((err, res_price) => {
          tokenContract.methods.balanceOf(m_address).call((err, res_cash) => {

            var m_supply = that.bn(res_account_values[1]);
            if (that.bn(res_account_values[2]).gt(that.bn('0'))) {
              var m_borrow = that.bn(res_account_values[2]).mul(that.bn(that.collateral_rate)).add(that.bn(5 ** 17)).div(that.bn(10 ** 18));
              if (that.bn(res_account_values[1]).gt(m_borrow)) {
                m_supply = that.bn(res_account_values[1]).sub(m_borrow);
              }
            }
            // console.log('res_supplied: ', res_supplied)
            // console.log('res_account_values: ', res_account_values)
            // console.log('res_price: ', res_price)
            // console.log('res_cash: ', res_cash)
            var liquidity_bn = m_supply.div(that.bn(res_price));
            var SmallNum_bn = liquidity_bn.lt(that.bn(res_supplied)) ? liquidity_bn : that.bn(res_supplied);
            var SmallNum_est = SmallNum_bn.lt(that.bn(res_cash)) ? SmallNum_bn.toString() : res_cash;
            // console.log('SmallNum_est: ', SmallNum_est)
            // console.log('-------------------------------------------')

            that.setState({ available_to_withdraw: SmallNum_est })

          })
        })
      })
    })
  })
}


export const get_available_to_borrow = (mContract, tokenContract, m_address, token_address, account, collateral_rate, originationFee, that) => {
  console.log('*********');
  mContract.methods.getAccountLiquidity(account).call((err, res_liquidity) => {
    // console.log(res_liquidity);

    if (!(that.bn(res_liquidity).gt('0'))) {
      that.setState({ available_to_borrow: 0 });
      return false;
    } else {

      tokenContract.methods.balanceOf(m_address).call((err, res_cash) => {
        mContract.methods.assetPrices(token_address).call((err, res_price) => {
          // console.log('res_cash: ', res_cash);
          // console.log('res_price: ', res_price);

          var liquidity_bn = that.bn(res_liquidity).mul(that.bn('10').pow(that.bn('54'))).div(that.bn(res_price).mul(that.bn(collateral_rate)).mul(that.bn('10').pow(that.bn('18')).add(that.bn(originationFee))));
          var to_borrow_bn = liquidity_bn.lt(that.bn(res_cash)) ? liquidity_bn : that.bn(res_cash);

          console.log('available_to_borrow: ', to_borrow_bn.toString());
          that.setState({ available_to_borrow: to_borrow_bn.toString() });
        })
      })
    }
  })
}


export const i_got_hash = (account, net_type, token, action, amount, hash, timestamp, status, that) => {
  if (window.localStorage) {
    let key = account + '-' + net_type;
    let contractData = JSON.parse(window.localStorage.getItem(key)) || [];
    contractData.push({
      account: account,
      net_type: net_type,
      token: token,
      action: action,
      amount: amount,
      hash: hash,
      timestamp: timestamp,
      status: status
    });
    window.localStorage.setItem(key, JSON.stringify(contractData));
    console.log('got hash && setItem.');

    that.setState({ load_new_history: Math.random() });
  }
}


export const handle_approve = (tokenContract, that, m_address) => {
  if (that.state.isEnableing) {
    return false;
  }

  that.setState({ isEnableing: true });

  tokenContract.methods.approve(m_address, -1).estimateGas({ from: that.state.my_account }, (err, gasLimit) => {
    that.new_web3.eth.getGasPrice((err, gasPrice) => {
      console.log('handle_approve_gasLimit: ', gasLimit);
      console.log('handle_approve_gasPrice: ', gasPrice);

      tokenContract.methods.approve(m_address, -1).send(
        {
          from: that.state.my_account,
          gas: Math.ceil(gasLimit * that.gas_limit_coefficient),
          gasPrice: gasPrice
        }, (reject, res_hash) => {
          if (res_hash) {
            console.log(res_hash);
            let timestamp = new Date().getTime();
            i_got_hash(that.state.my_account, that.state.net_type, that.token_name, 'approve', '-1', res_hash, timestamp, 'pendding', that);
            let check_approve = setInterval(() => {
              that.new_web3.eth.getTransactionReceipt(res_hash, (res_fail, res_success) => {
                if (res_success) {
                  clearInterval(check_approve);
                  if (res_success.status === true) {
                    that.setState({ is_approved: true })
                  }
                }
                if (res_fail) {
                  console.log(res_fail);
                  clearInterval(check_approve);
                }
              })
            }, 2000)
          }
          if (reject) {
            that.setState({ isEnableing: false });
            console.log(reject)
          }
        }
      )
    })
  });
};


export const handle_supply_click = (that, decimals, token_address) => {
  if (!(that.state.is_supply_enable && that.state.supply_amount)) {
    console.log('i return you...');
    return false;
  }

  that.setState({ is_supply_enable: false });

  var amount_str = that.state.supply_amount;// '123.456'
  var amount_bn;

  if (amount_str.indexOf('.') > 0) {
    var sub_num = amount_str.length - amount_str.indexOf('.') - 1;// 3
    amount_str = amount_str.substr(0, amount_str.indexOf('.')) + amount_str.substr(amount_str.indexOf('.') + 1);// '123456'
    amount_bn = that.bn(amount_str).mul(that.bn(10 ** (decimals - sub_num)));// bn_'123456'
  } else {
    amount_bn = that.bn(amount_str).mul(that.bn(10 ** decimals));
  }

  if (that.state.i_will_supply_max) {
    amount_bn = that.bn(that.state.my_balance)
  }

  console.log('amount_bn: ', amount_bn);
  console.log('amount_bn string: ', amount_bn.toString());

  that.state.mMarket.methods.supply(token_address, amount_bn.toString()).estimateGas({ from: that.state.my_account }, (err, gasLimit) => {
    that.new_web3.eth.getGasPrice((err, gasPrice) => {
      console.log('supply_gasLimit: ', gasLimit);
      console.log('supply_gasPrice: ', gasPrice);

      that.state.mMarket.methods.supply(token_address, amount_bn.toString()).send(
        {
          from: that.state.my_account,
          gas: Math.ceil(gasLimit * that.gas_limit_coefficient),
          gasPrice: gasPrice
        }, (reject, res_hash) => {
          // 成功后返回哈希
          if (res_hash) {
            console.log(res_hash);
            that.setState({ is_supply_enable: true, supply_amount: null });
            let timestamp = new Date().getTime();
            i_got_hash(that.state.my_account, that.state.net_type, that.token_name, 'supply', amount_bn.toString(), res_hash, timestamp, 'pendding', that);
          }
          // 点击取消
          if (reject) {
            console.log(reject)
            that.setState({ is_supply_enable: true });
          }
        }
      )
    })
  })
}


export const handle_withdraw_click = (that, decimals, token_address) => {
  if (!(that.state.is_withdraw_enable && that.state.withdraw_amount)) {
    console.log('i return you...');
    return false;
  }

  that.setState({ is_withdraw_enable: false });

  var amount_str = that.state.withdraw_amount;// '123.456'
  var amount_bn;

  if (amount_str.indexOf('.') > 0) {
    var sub_num = amount_str.length - amount_str.indexOf('.') - 1;// 3
    amount_str = amount_str.substr(0, amount_str.indexOf('.')) + amount_str.substr(amount_str.indexOf('.') + 1);// '123456'
    amount_bn = that.bn(amount_str).mul(that.bn(10 ** (decimals - sub_num)));// bn_'123456'
  } else {
    amount_bn = that.bn(amount_str).mul(that.bn(10 ** decimals));
  }

  var amount_bn_to_history = amount_bn;

  if (that.state.i_will_withdraw_max) {
    amount_bn = that.bn('-1');
  }

  console.log('amount_bn: ', amount_bn);
  console.log('amount_bn string: ', amount_bn.toString());

  that.state.mMarket.methods.withdraw(token_address, amount_bn.toString()).estimateGas({ from: that.state.my_account }, (err, gasLimit) => {
    that.new_web3.eth.getGasPrice((err, gasPrice) => {
      console.log('supply_gasLimit: ', gasLimit);
      console.log('supply_gasPrice: ', gasPrice);

      that.state.mMarket.methods.withdraw(token_address, amount_bn.toString()).send(
        {
          from: that.state.my_account,
          gas: Math.ceil(gasLimit * that.gas_limit_coefficient),
          gasPrice: gasPrice
        }, (reject, res_hash) => {
          // 成功后返回哈希
          if (res_hash) {
            console.log(res_hash);
            let timestamp = new Date().getTime();
            that.setState({ is_withdraw_enable: true, withdraw_amount: null });
            i_got_hash(that.state.my_account, that.state.net_type, that.token_name, 'withdraw', amount_bn_to_history.toString(), res_hash, timestamp, 'pendding', that);
          }
          // 点击取消
          if (reject) {
            console.log(reject);
            that.setState({ is_withdraw_enable: true });
          }
        }
      )
    })
  })
}


export const get_borrow_balance = (mContract, account, token_address, that) => {
  mContract.methods.getBorrowBalance(account, token_address).call((err, res_borrowed) => {
    if (res_borrowed) {
      that.setState({
        my_borrowed: res_borrowed
      }, () => {
        // console.log(that.state.my_borrowed)
      })
    }
  });
}



// export const get_allowance = async (web) => {
//   return new Promise(resolve => {
//     web.givenProvider.enable().then(res_accounts => {
//       setTimeout(() => { resolve(res_accounts) }, 15000)

//     })
//   })
//   // await web.givenProvider.enable().then(res_accounts => {
//   //   console.log(res_accounts);
//   //   return res_accounts;
//   // })
// }


// ***** 分割线 *****  ***** 分割线 *****  ***** 分割线 *****  ***** 分割线 *****  ***** 分割线 *****  ***** 分割线 *****  ***** 分割线 ***** ***** 分割线 *****  ***** 分割线 ***** 


export const handle_borrow_change = (value, that, decimals, balance) => {
  if (value.length > 18) {
    return;
  }

  that.setState({ i_will_borrow_max: false });

  if (value === null || value === '') {
    console.log("value === null || value === ''")
    that.setState({
      is_borrow_enable: true,
      borrow_amount: null
    });
    return false;
  } else {
    var amount_bn;
    var temp_value = value;
    if (temp_value.indexOf('.') > 0) {
      var sub_num = temp_value.length - temp_value.indexOf('.') - 1;// 3
      if (sub_num > decimals) {
        console.log(' --- decimals extent ---');
        that.setState({
          borrow_amount: value,
          is_borrow_enable: false
        });
        return false;
      }
      temp_value = temp_value.substr(0, temp_value.indexOf('.')) + temp_value.substr(value.indexOf('.') + 1);// '123456'
      amount_bn = that.bn(temp_value).mul(that.bn(10 ** (decimals - sub_num)));// bn_'123456'
    } else {
      amount_bn = that.bn(value).mul(that.bn(10 ** decimals));
    }

    console.log(amount_bn.toString());

    if (amount_bn.sub(that.bn(balance)) > 0) {
      console.log(' --- INSUFFICIENT BALANCE ---');
      that.setState({
        borrow_amount: value,
        is_borrow_enable: false
      });
      return false;
    }
  }

  that.setState({ borrow_amount: value });

  if ((Number(value)) === 0) {
    that.setState({ is_borrow_enable: false });
    return;
  } else {
    that.setState({ is_borrow_enable: true });
  }
}


export const handle_repay_change = (value, that, decimals, balance) => {
  if (value.length > 18) {
    return;
  }

  that.setState({ i_will_repay_max: false });

  if (value === null || value === '') {
    console.log("value === null || value === ''")
    that.setState({
      is_repay_enable: true,
      repay_amount: null
    });
    return false;
  } else {
    var amount_bn;
    var temp_value = value;
    if (temp_value.indexOf('.') > 0) {
      var sub_num = temp_value.length - temp_value.indexOf('.') - 1;// 3
      if (sub_num > decimals) {
        console.log(' --- decimals extent ---');
        that.setState({
          repay_amount: value,
          is_repay_enable: false
        });
        return false;
      }
      temp_value = temp_value.substr(0, temp_value.indexOf('.')) + temp_value.substr(value.indexOf('.') + 1);// '123456'
      amount_bn = that.bn(temp_value).mul(that.bn(10 ** (decimals - sub_num)));// bn_'123456'
    } else {
      amount_bn = that.bn(value).mul(that.bn(10 ** decimals));
    }

    console.log(amount_bn.toString());

    if (amount_bn.sub(that.bn(balance)) > 0) {
      console.log(' --- INSUFFICIENT BALANCE ---');
      that.setState({
        repay_amount: value,
        is_repay_enable: false
      });
      return false;
    }
  }

  that.setState({ repay_amount: value });

  if ((Number(value)) === 0) {
    that.setState({ is_repay_enable: false });
    return;
  } else {
    that.setState({ is_repay_enable: true });
  }
}


export const handle_borrow_click = (that, decimals, token_address) => {
  if (!(that.state.is_borrow_enable && that.state.borrow_amount)) {
    console.log('i return you...');
    return false;
  }

  that.setState({ is_borrow_enable: false });

  var amount_str = that.state.borrow_amount;// '123.456'
  var amount_bn;

  if (amount_str.indexOf('.') > 0) {
    var sub_num = amount_str.length - amount_str.indexOf('.') - 1;// 3
    amount_str = amount_str.substr(0, amount_str.indexOf('.')) + amount_str.substr(amount_str.indexOf('.') + 1);// '123456'
    amount_bn = that.bn(amount_str).mul(that.bn(10 ** (decimals - sub_num)));// bn_'123456'
  } else {
    amount_bn = that.bn(amount_str).mul(that.bn(10 ** decimals));
  }

  if (that.state.i_will_borrow_max) {
    amount_bn = that.bn(that.state.available_to_borrow)
  }

  console.log('amount_bn: ', amount_bn);
  console.log('amount_bn string: ', amount_bn.toString());

  that.state.mMarket.methods.borrow(token_address, amount_bn.toString()).estimateGas({ from: that.state.my_account }, (err, gasLimit) => {
    that.new_web3.eth.getGasPrice((err, gasPrice) => {
      console.log('supply_gasLimit: ', gasLimit);
      console.log('supply_gasPrice: ', gasPrice);

      that.state.mMarket.methods.borrow(token_address, amount_bn.toString()).send(
        {
          from: that.state.my_account,
          gas: Math.ceil(gasLimit * that.gas_limit_coefficient),
          gasPrice: gasPrice
        }, (reject, res_hash) => {
          // 成功后返回哈希
          if (res_hash) {
            console.log(res_hash);
            that.setState({ is_borrow_enable: true, borrow_amount: null });
            let timestamp = new Date().getTime();
            i_got_hash(that.state.my_account, that.state.net_type, that.token_name, 'borrow', amount_bn.toString(), res_hash, timestamp, 'pendding', that);
          }
          // 点击取消
          if (reject) {
            console.log(reject)
            that.setState({ is_borrow_enable: true });
          }
        }
      )
    })
  })
}


export const handle_repay_click = (that, decimals, token_address) => {
  if (!(that.state.is_repay_enable && that.state.repay_amount)) {
    console.log('i return you...');
    return false;
  }

  that.setState({ is_repay_enable: false });

  var amount_str = that.state.repay_amount;// '123.456'
  var amount_bn;
  var amount_bn_to_history;

  if (amount_str.indexOf('.') > 0) {
    var sub_num = amount_str.length - amount_str.indexOf('.') - 1;// 3
    amount_str = amount_str.substr(0, amount_str.indexOf('.')) + amount_str.substr(amount_str.indexOf('.') + 1);// '123456'
    amount_bn_to_history = amount_bn = that.bn(amount_str).mul(that.bn(10 ** (decimals - sub_num)));// bn_'123456'
  } else {
    amount_bn_to_history = amount_bn = that.bn(amount_str).mul(that.bn(10 ** decimals));
  }

  if (that.state.i_will_repay_max) {
    if (that.bn(that.state.my_balance).gt(that.bn(that.state.my_borrowed))) {
      amount_bn = that.bn('-1');
      amount_bn_to_history = that.bn(that.state.my_borrowed);
    } else {
      amount_bn_to_history = amount_bn = that.bn(that.state.my_balance);
    }
  }

  console.log('amount_bn: ', amount_bn);
  console.log('amount_bn string: ', amount_bn.toString());

  that.state.mMarket.methods.repayBorrow(token_address, amount_bn.toString()).estimateGas({ from: that.state.my_account }, (err, gasLimit) => {
    that.new_web3.eth.getGasPrice((err, gasPrice) => {
      console.log('supply_gasLimit: ', gasLimit);
      console.log('supply_gasPrice: ', gasPrice);

      that.state.mMarket.methods.repayBorrow(token_address, amount_bn.toString()).send(
        {
          from: that.state.my_account,
          gas: Math.ceil(gasLimit * that.gas_limit_coefficient),
          gasPrice: gasPrice
        }, (reject, res_hash) => {
          // 成功后返回哈希
          if (res_hash) {
            console.log(res_hash);
            that.setState({ is_repay_enable: true, repay_amount: null });
            let timestamp = new Date().getTime();
            i_got_hash(that.state.my_account, that.state.net_type, that.token_name, 'repay', amount_bn_to_history.toString(), res_hash, timestamp, 'pendding', that);
          }
          // 点击取消
          if (reject) {
            console.log(reject)
            that.setState({ is_repay_enable: true });
          }
        }
      )
    })
  })
}


// export const handle_wrap_change = (value, that, decimals, balance) => {
//   if (value.length > 18) {
//     return;
//   }

//   that.setState({ i_will_wrap_max: false });

//   if (value === null || value === '') {
//     console.log("value === null || value === ''")
//     that.setState({
//       is_wrap_enable: true,
//       borrow_amount: null
//     });
//     return false;
//   } else {
//     var amount_bn;
//     var temp_value = value;
//     if (temp_value.indexOf('.') > 0) {
//       var sub_num = temp_value.length - temp_value.indexOf('.') - 1;// 3
//       if (sub_num > decimals) {
//         console.log(' --- decimals extent ---');
//         that.setState({
//           borrow_amount: value,
//           is_borrow_enable: false
//         });
//         return false;
//       }
//       temp_value = temp_value.substr(0, temp_value.indexOf('.')) + temp_value.substr(value.indexOf('.') + 1);// '123456'
//       amount_bn = that.bn(temp_value).mul(that.bn(10 ** (decimals - sub_num)));// bn_'123456'
//     } else {
//       amount_bn = that.bn(value).mul(that.bn(10 ** decimals));
//     }

//     console.log(amount_bn.toString());

//     if (amount_bn.sub(that.bn(balance)) > 0) {
//       console.log(' --- INSUFFICIENT BALANCE ---');
//       that.setState({
//         borrow_amount: value,
//         is_borrow_enable: false
//       });
//       return false;
//     }
//   }

//   that.setState({ borrow_amount: value });

//   if ((Number(value)) === 0) {
//     that.setState({ is_borrow_enable: false });
//     return;
//   } else {
//     that.setState({ is_borrow_enable: true });
//   }
// }



export const handle_borrow_max = (that, balance, decimals) => {
  var to_show;
  if (balance.length <= decimals) {
    to_show = ('0.' + ('000000000000000000' + balance).substr(-decimals)).substring(0, 18);
  } else {
    to_show = (that.bn(balance).div(that.bn(10 ** decimals)) + '.' + balance.substr(-decimals)).substring(0, 18);
  }

  that.setState({
    borrow_amount: to_show,
    i_will_borrow_max: true
  });
}


export const handle_repay_max = (that, balance, borrowed, decimals) => {
  var to_show;

  if (that.bn(balance).gt(that.bn(borrowed))) {
    if (borrowed.length <= decimals) {
      to_show = ('0.' + ('000000000000000000' + borrowed).substr(-decimals)).substring(0, 18);
    } else {
      to_show = (that.bn(borrowed).div(that.bn(10 ** decimals)) + '.' + borrowed.substr(-decimals)).substring(0, 18);
    }
  } else {
    if (balance.length <= decimals) {
      to_show = ('0.' + ('000000000000000000' + balance).substr(-decimals)).substring(0, 18);
    } else {
      to_show = (that.bn(balance).div(that.bn(10 ** decimals)) + '.' + balance.substr(-decimals)).substring(0, 18);
    }
  }

  that.setState({
    repay_amount: to_show,
    i_will_repay_max: true
  });
}







export const validNumber = (number) => {
  let reg = /^(\+)?\d+(\.\d+)?$/;
  return reg.test(number);
}

export const toFormatShowNumber = (value) => {
  return String(value).replace(/^(.*\..{2}).*$/, "$1");
  // let val = String(value).replace(/^(.*\..{2}).*$/, "$1");
  // if (val.split(".")[1] === undefined) {
  //   val = val + '.00'
  // } else if (val.split(".")[1].length < 2) {
  //   val = val + '0'
  // }
  // return val;
}

export const toFormat4Number = (value) => {
  // console.log(value)
  let val = String(value).replace(/^(.*\..{4}).*$/, "$1");
  if (val.split(".")[1] === undefined) {
    val = val + '.00'
  } else if (val.split(".")[1].length < 4) {
    val = val + '0'
  }
  // console.log(val)
  return val;
}

export const toFormat10Number = (value) => {
  // console.log(value)
  let val = String(value).replace(/^(.*\..{10}).*$/, "$1");
  if (val.split(".")[1] === undefined) {
    val = val + '.00'
  } else if (val.split(".")[1].length < 4) {
    val = val + '0'
  }
  // console.log(val)
  return val;
}

export const getPercentageFormat = (value) => {
  return (value * 100).toFixed(2);
}

export const toNonExponential = (num) => {
  var m = num.toExponential().match(/\d(?:\.(\d*))?e([+-]\d+)/);
  return num.toFixed(Math.max(0, (m[1] || '').length - m[2]));
}

export const toDoubleThousands = (s) => {
  if (s == null || s === '') {
    return '0.00';
  }
  s = toFormatShowNumber(s);
  let l = s.split(".")[0].split("").reverse(),
    r = s.split(".")[1];
  // console.log('s:' + s + ' / l:' +l + ' / r:' + r)
  if (r === undefined) {
    r = '00';
  } else if (r.length < 2) {
    r = r + '0';
  }
  let t = "";
  for (let i = 0; i < l.length; i++) {
    t += l[i] + ((i + 1) % 3 == 0 && (i + 1) != l.length ? "," : "");
  }
  return t.split("").reverse().join("") + "." + r;
}

export const getTransactionHistoryKey = (account, coinType, page, networkId) => {
  return account + '-' + Asset['Asset'][coinType] + '-' + page + '-' + networkId;
}

export const saveTransaction = (icon, account, coinType, page, networkId, transactionType,
  transactionAmount, coinType2, txnHashHref, txId, status, realAmount, failed, failedInfo) => {
  if (status === undefined || status === null || status === '') {
    status = 0;// 0:pending 1:done
  }
  if (transactionAmount === null) {
    transactionAmount = ' ';
  } else {
    transactionAmount = ' ' + transactionAmount + ' ';
  }
  if (window.localStorage) {
    let storage = window.localStorage;
    // storage.clear();
    // let dateTime = moment().format('MMMM Do, h:mm a');
    let dateTime = moment().format('MMM. DD,HH:mm');
    let key = getTransactionHistoryKey(account, coinType, page, networkId);
    let contractData = JSON.parse(storage.getItem(key)) || [];
    contractData.push({
      icon: icon,
      transactionDetail: transactionType + transactionAmount + coinType2,
      transactionTime: dateTime,
      txnHashHref: txnHashHref,
      txId: txId,
      status: status,
      transactionType: transactionType,
      realAmount: realAmount,
      failed: failed,
      failedInfo: failedInfo,
      //超时则取消控件限制
      timestamp: moment().valueOf(),
      timeOutFlag: -1
    });
    storage.setItem(key, JSON.stringify(contractData));
    // save txId key
    let txIdKey = 'txId-' + txId;
    storage.setItem(txIdKey, txId)
    // console.log('========>key:' + key + ' / value:' + storage.getItem(key));
  }
}
export const txIdExist = (txId) => {
  if (window.localStorage) {
    let key = 'txId-' + txId;
    let storage = window.localStorage;
    return storage.getItem(key) !== null;
  }
}

export const blockHashExist = (blockHash) => {
  if (window.localStorage) {
    let key = 'blockHash-' + blockHash;
    let storage = window.localStorage;
    if (storage.getItem(key) !== null) {
      return true;
    } else {
      storage.setItem(key, blockHash);
      return false;
    }
  }
}

export const getTxnHashHref = (networkId) => {
  let txnHashHref;
  switch (networkId) {
    case "1":
      txnHashHref = "https://etherscan.io/tx/";
      break;
    case "2"://Morden(不再使用的网络)
      txnHashHref = "https://etherscan.io/tx/";
      break;
    case "3":
      txnHashHref = "https://ropsten.etherscan.io/tx/";
      break;
    case "4":
      txnHashHref = "https://rinkeby.etherscan.io/tx/";
      break;
    case "42":
      txnHashHref = "https://kovan.etherscan.io/tx/";
      break;
    default:
      txnHashHref = "";
  }
  return txnHashHref;
}

export const findNetwork = (networkId) => {
  let networkName;
  switch (networkId) {
    case "1":
      networkName = "Main";
      break;
    case "2":
      networkName = "Morden";
      break;
    case "3":
      networkName = "Ropsten";
      break;
    case "4":
      networkName = "Rinkeby";
      break;
    case "42":
      networkName = "Kovan";
      break;
    default:
      networkName = "Unknown";
  }
  return networkName;
}

export const getLoginStatusKey = (account) => {
  return account + '-LoginStatus';
}

export const saveLoginStatus = (account, isLogin) => {
  if (account === undefined || isLogin === null) {
    return;
  }
  if (window.localStorage) {
    let storage = window.localStorage;
    let key = getLoginStatusKey(account);
    let contractData = JSON.parse(storage.getItem(key)) || [];
    contractData.push({
      account: account,
      isLogin: isLogin
    });
    storage.setItem(key, JSON.stringify(contractData));
  }
}

export const formatTransactionTime = (time) => {
  return time.substr(0, time.indexOf(' ')).substr(0, 3) + '.' + ' ' + time.substr(time.indexOf(' ') + 1);
}

//超时则取消控件限制
export const diffMin = (eTime) => {
  let date1 = moment(moment().valueOf());
  let date2 = moment(eTime);
  let minutes = date1.diff(date2, 'minute');
  return minutes;
}

//bignumber
export const formatBigNumber = (bigNumber) => {
  let NumStr = Number(bigNumber).toLocaleString().replace(/,/g, '')
  const str = '000000000000000000';
  if (NumStr.length < 18) {
    bigNumber = '0.' + str.slice(0, str.length - NumStr.length) + NumStr.replace(/(0+)$/g, "");
  } else {
    bigNumber = (NumStr.slice(0, NumStr.length - 18) === '' ? 0 : NumStr.slice(0, NumStr.length - 18)) + '.' + NumStr.slice(NumStr.length - 18, NumStr.length - 10);
  }
  return bigNumber;
}










export const get_tokens_decimals = (USDx, WETH, imBTC, USDT, that) => {
  USDx.methods.decimals().call().then(res_usdx_decimals => {
    console.log('usdx: ', res_usdx_decimals);
    that.setState({ USDx_decimals: Number(res_usdx_decimals) })
  })

  WETH.methods.decimals().call().then(res_weth_decimals => {
    console.log('weth: ', res_weth_decimals);
    that.setState({ WETH_decimals: Number(res_weth_decimals) })
  })

  imBTC.methods.decimals().call().then(res_imBTC_decimals => {
    console.log('imbtc: ', res_imBTC_decimals);
    that.setState({ imBTC_decimals: Number(res_imBTC_decimals) })
  })

  USDT.methods.decimals().call().then(res_usdt_decimals => {
    console.log('usdt: ', res_usdt_decimals);
    that.setState({ USDT_decimals: Number(res_usdt_decimals) })
  })
}




// export const get_allowance = async (web) => {
//   return new Promise(resolve => {
//     web.givenProvider.enable().then(res_accounts => {
//       setTimeout(() => { resolve(res_accounts) }, 15000)

//     })
//   })
//   // await web.givenProvider.enable().then(res_accounts => {
//   //   console.log(res_accounts);
//   //   return res_accounts;
//   // })
// }





