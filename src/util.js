import moment from 'moment';
import Asset from './constant.json';

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