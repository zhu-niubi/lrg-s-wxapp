const formatTime = value => {
  const date = new Date(value  * 1000)
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

return `${[year, month, day].map(formatNumber).join('-')}`
//   return `${[year, month, day].map(formatNumber).join('/')} ${[hour, minute, second].map(formatNumber).join(':')}`
}

const formatTimes = value => {
  const date = new Date(value  * 1000)
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

// return `${[year, month, day].map(formatNumber).join('-')}`
  return `${[year, month, day].map(formatNumber).join('-')} ${[hour, minute, second].map(formatNumber).join(':')}`
}

// 获取当前时间
const NowTime = ()=> {
  var time = new Date();//获取系统当前时间
  var year = time.getFullYear();//获取年
  var month = time.getMonth() + 1;//获取月，由于获取是0-11，所以要+1
  var date = time.getDate();//系统日
  var hour = time.getHours();//获取时
  var minutes = time.getMinutes();//获取分
  var seconds = time.getSeconds();//获取秒
  if (month < 10) {
      month = "0" + month;
  }
  if (date < 10) {
      date = "0" + date;
  }   
if (hour < 10) {
      hour = "0" + hour;
  }  
if (minutes < 10) {
      minutes = "0" + minutes;
  }  
if (seconds < 10) {
      seconds = "0" + seconds;
  }  			
  var newDate = year + "-" + month + "-" + date + " " + hour + ":" + minutes + ":" + seconds;
return newDate;          
}

// 验证手机号
function phoneCheck(countryCode, user) {
  var telStr;
  switch (countryCode) {
    case '+86':

      telStr = /^[1](([3][0-9])|([4][0-9])|([5][0-9])|([6][0-9])|([7][0-9])|([8][0-9])|([9][0-9]))[0-9]{8}$/

      return telStr.test(user);

    case '+886':

      telStr = /^[09]\d{8}$/;

      return telStr.test(user);

    case '+852':

      telStr = /^[5|6|9]\d{7}$/;

      return telStr.test(user);

    default:

      return /\D/g.test(user) ? false : true;

  }
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}
/**
 * 节流函数
 * fn是我们需要包装的事件回调, interval是时间间隔的阈值
 */
export const throttle = (fn, interval) => {
  // last为上一次触发回调的时间
  let last = 0

  interval = interval || 1000

  // 将throttle处理结果当作函数返回
  return function () {
    // 保留调用时的this上下文
    let context = this
    // 保留调用时传入的参数
    let args = arguments
    // 记录本次触发回调的时间
    let now = +new Date()

    // 判断上次触发的时间和本次触发的时间差是否小于时间间隔的阈值
    if (now - last >= interval) {
      // 如果时间间隔大于我们设定的时间间隔阈值，则执行回调
      last = now
      fn.apply(context, args)
    }
  }
}

/**
 * 字节对象转字符串
 * @param {Object} arr
 */
export const byteToString = function (arr) {
  if (typeof arr === 'string') {
    return arr
  }

  var str = '',
    _arr = arr

  for (var i = 0; i < _arr.length; i++) {
    var one = _arr[i].toString(2),
      v = one.match(/^1+?(?=0)/)

    if (v && one.length == 8) {
      var bytesLength = v[0].length

      var store = _arr[i].toString(2).slice(7 - bytesLength)

      for (var st = 1; st < bytesLength; st++) {
        store += _arr[st + i].toString(2).slice(2)
      }

      str += String.fromCharCode(parseInt(store, 2))

      i += bytesLength - 1
    } else {
      str += String.fromCharCode(_arr[i])
    }
  }
  return str
}


/**
 * 格式化空字符为空字符串
 */
export const formatNullCharacter = str => {
  if (!str) return ''
  return JSON.parse(removeNullCharacter(JSON.stringify(str)))
}


module.exports = {
  formatTime,
  phoneCheck,
  NowTime,
  formatTimes
}
