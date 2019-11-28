// for weth.

export const get_my_ETH = (that) => {
  that.new_web3.eth.getBalance(that.state.my_account, (err, res_eth) => {
    // console.log('res_eth: ', res_eth)
    that.setState({
      my_ETH: res_eth
    })
  })
}

export const get_my_WETH = (that) => {
  that.state.WETH.methods.balanceOf(that.state.my_account).call((err, res_weth) => {
    // console.log('res_weth: ', res_weth)
    if (res_weth) {
      that.setState({
        my_balance: res_weth
      })
    }
  });
}

export const get_WETH_supplied__available_to_withdraw = (that, weth_address, m_address) => {
  that.state.mMarket.methods.getSupplyBalance(that.state.my_account, weth_address).call((err, res_supplied) => {
    that.setState({
      my_WETH_supplied: res_supplied
    }, () => {
      that.state.mMarket.methods.calculateAccountValues(that.state.my_account).call((err, res_account_values) => {
        that.state.mMarket.methods.assetPrices(weth_address).call((err, res_price) => {
          that.state.WETH.methods.balanceOf(m_address).call((err, res_cash) => {

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
            that.setState({
              my_WETH_available_to_withdraw: SmallNum_est
            })
          })
        })
      })
    })
  })
}

export const handle_wrap_change = (that, value, balance) => {
  if (value.length > 18) {
    return;
  }

  if (value === null || value === '') {
    console.log("value === null || value === ''")
    that.setState({
      is_wrap_enable: true,
      wrap_amount: null
    });
    return false;
  } else {
    var amount_bn;
    var temp_value = value;
    if (temp_value.indexOf('.') > 0) {
      var sub_num = temp_value.length - temp_value.indexOf('.') - 1;// 3
      if (sub_num > 18) {
        console.log(' --- decimals extent ---');
        that.setState({
          wrap_amount: value,
          is_wrap_enable: false
        });
        return false;
      }
      temp_value = temp_value.substr(0, temp_value.indexOf('.')) + temp_value.substr(value.indexOf('.') + 1);// '123456'
      amount_bn = that.bn(temp_value).mul(that.bn(10 ** (18 - sub_num)));// bn_'123456'
    } else {
      amount_bn = that.bn(value).mul(that.bn(10 ** 18));
    }

    console.log(amount_bn.toString());

    if (amount_bn.sub(that.bn(balance)) > 0) {
      console.log(' --- INSUFFICIENT BALANCE ---');
      that.setState({
        wrap_amount: value,
        is_wrap_enable: false
      });
      return false;
    }
  }

  that.setState({ wrap_amount: value });

  if ((Number(value)) === 0) {
    that.setState({ is_wrap_enable: false });
    return;
  } else {
    that.setState({ is_wrap_enable: true });
  }
}

export const handle_wrap_click = (that) => {
  if (!(that.state.is_wrap_enable && that.state.wrap_amount)) {
    console.log('i return you...');
    return false;
  }

  that.setState({ is_wrap_enable: false });

  var amount_str = that.state.wrap_amount;// '123.456'
  var amount_bn;

  if (amount_str.indexOf('.') > 0) {
    var sub_num = amount_str.length - amount_str.indexOf('.') - 1;// 3
    amount_str = amount_str.substr(0, amount_str.indexOf('.')) + amount_str.substr(amount_str.indexOf('.') + 1);// '123456'
    amount_bn = that.bn(amount_str).mul(that.bn(10 ** (18 - sub_num)));// bn_'123456'
  } else {
    amount_bn = that.bn(amount_str).mul(that.bn(10 ** 18));
  }

  console.log('amount_bn: ', amount_bn);
  console.log('amount_bn string: ', amount_bn.toString());

  that.state.WETH.methods.deposit().estimateGas({ from: that.state.my_account,value: amount_bn.toString() }, (err, gasLimit) => {
    that.new_web3.eth.getGasPrice((err, gasPrice) => {
      console.log('supply_gasLimit: ', gasLimit);
      console.log('supply_gasPrice: ', gasPrice);

      that.state.WETH.methods.deposit().send(
        {
          from: that.state.my_account,
          value: amount_bn.toString(),
          gas: Math.ceil(gasLimit * that.gas_limit_coefficient),
          gasPrice: gasPrice
        }, (reject, res_hash) => {
          // 成功后返回哈希
          if (res_hash) {
            console.log(res_hash);
            that.setState({ is_wrap_enable: true, wrap_amount: null });
            let timestamp = new Date().getTime();
            i_got_hash(that.state.my_account, that.state.net_type, 'ETH', 'wrap', amount_bn.toString(), res_hash, timestamp, 'pendding', that);
          }
          // 点击取消
          if (reject) {
            console.log(reject)
            that.setState({ is_wrap_enable: true });
          }
        }
      )
    })
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

// ***** 分割线 *****  ***** 分割线 *****  ***** 分割线 *****  ***** 分割线 *****  ***** 分割线 *****  ***** 分割线 *****  ***** 分割线 ***** ***** 分割线 *****  ***** 分割线 ***** 

export const handle_unwrap_change = (that, value, balance) => {
  if (value.length > 18) {
    return;
  }

  if (value === null || value === '') {
    console.log("value === null || value === ''")
    that.setState({
      is_unwrap_enable: true,
      unwrap_amount: null
    });
    return false;
  } else {
    var amount_bn;
    var temp_value = value;
    if (temp_value.indexOf('.') > 0) {
      var sub_num = temp_value.length - temp_value.indexOf('.') - 1;// 3
      if (sub_num > 18) {
        console.log(' --- decimals extent ---');
        that.setState({
          unwrap_amount: value,
          is_unwrap_enable: false
        });
        return false;
      }
      temp_value = temp_value.substr(0, temp_value.indexOf('.')) + temp_value.substr(value.indexOf('.') + 1);// '123456'
      amount_bn = that.bn(temp_value).mul(that.bn(10 ** (18 - sub_num)));// bn_'123456'
    } else {
      amount_bn = that.bn(value).mul(that.bn(10 ** 18));
    }

    console.log(amount_bn.toString());

    if (amount_bn.sub(that.bn(balance)) > 0) {
      console.log(' --- INSUFFICIENT BALANCE ---');
      that.setState({
        unwrap_amount: value,
        is_unwrap_enable: false
      });
      return false;
    }
  }

  that.setState({ unwrap_amount: value });

  if ((Number(value)) === 0) {
    that.setState({ is_unwrap_enable: false });
    return;
  } else {
    that.setState({ is_unwrap_enable: true });
  }
}

export const handle_unwrap_click = (that) => {
  if (!(that.state.is_unwrap_enable && that.state.unwrap_amount)) {
    console.log('i return you...');
    return false;
  }

  that.setState({ is_unwrap_enable: false });

  var amount_str = that.state.unwrap_amount;// '123.456'
  var amount_bn;

  if (amount_str.indexOf('.') > 0) {
    var sub_num = amount_str.length - amount_str.indexOf('.') - 1;// 3
    amount_str = amount_str.substr(0, amount_str.indexOf('.')) + amount_str.substr(amount_str.indexOf('.') + 1);// '123456'
    amount_bn = that.bn(amount_str).mul(that.bn(10 ** (18 - sub_num)));// bn_'123456'
  } else {
    amount_bn = that.bn(amount_str).mul(that.bn(10 ** 18));
  }

  console.log('amount_bn: ', amount_bn);
  console.log('amount_bn string: ', amount_bn.toString());

  that.state.WETH.methods.withdraw(amount_bn.toString()).estimateGas({ from: that.state.my_account }, (err, gasLimit) => {
    that.new_web3.eth.getGasPrice((err, gasPrice) => {
      console.log('supply_gasLimit: ', gasLimit);
      console.log('supply_gasPrice: ', gasPrice);

      that.state.WETH.methods.withdraw(amount_bn.toString()).send(
        {
          from: that.state.my_account,
          gas: Math.ceil(gasLimit * that.gas_limit_coefficient),
          gasPrice: gasPrice
        }, (reject, res_hash) => {
          // 成功后返回哈希
          if (res_hash) {
            console.log(res_hash);
            that.setState({ is_unwrap_enable: true, unwrap_amount: null });
            let timestamp = new Date().getTime();
            i_got_hash(that.state.my_account, that.state.net_type, 'ETH', 'unwrap', amount_bn.toString(), res_hash, timestamp, 'pendding', that);
          }
          // 点击取消
          if (reject) {
            console.log(reject)
            that.setState({ is_unwrap_enable: true });
          }
        }
      )
    })
  })
}



