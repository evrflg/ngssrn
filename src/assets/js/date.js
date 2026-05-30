var now = new Date(); //当前日期
var nowYear = now.getFullYear(); //当前年
var nowMonth = now.getMonth(); //当前月
var lastMonthDate = new Date(); //上月日期
lastMonthDate.setDate(1);
lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
// var lastYear = lastMonthDate.getYear();

// 时间前面加 0
function addZero(date) {
  if (date < 10) return '0' + date;
  else return date;
}

function timeChange(timeStr, dataStr) {
  var tempDate = ''
  if (timeStr) tempDate = new Date(Number(timeStr));
  if (dataStr) tempDate = dataStr;
  var year = tempDate.getFullYear();
  var month = ("0" + (tempDate.getMonth() + 1)).slice(-2);
  var date = ("0" + tempDate.getDate()).slice(-2);
  var hour = ("0" + tempDate.getHours()).slice(-2);
  var minute = ("0" + tempDate.getMinutes()).slice(-2);
  var second = ("0" + tempDate.getSeconds()).slice(-2);
  var arr = [];
  arr.year = year;
  arr.month = month;
  arr.date = date;
  arr.hour = hour;
  arr.minute = minute;
  arr.second = second;

  return arr;
}

//格式化日期：yyyy-MM-dd
function formatDate(date) {
  let year = date.getFullYear();
  let month = addZero(date.getMonth() + 1);
  let day = addZero(date.getDate());

  return year + "-" + month + "-" + day;
}

//获得某月的天数
function getMonthDays(myMonth) {
  let monthStartDate = new Date(nowYear, myMonth, 1);
  let monthEndDate = new Date(nowYear, myMonth + 1, 1);
  let days = (monthEndDate - monthStartDate) / (1000 * 60 * 60 * 24);
  return days;
}

export const hourMinSecond = ((timeStr) => {
  // 时间戳转换时间函数 时分秒
  if (timeStr) {
    let arr = timeChange(timeStr);
    return arr.hour + ":" + arr.minute + ":" + arr.second;
  } else {
    return '-'
  }
})

export const yearMonthDayHourMinSecond = ((timeStr) => {
  // 时间戳转换时间函数 时分秒
  if (timeStr) {
    let arr = timeChange(timeStr);
    return arr.year + "-" + arr.month + "-" + arr.date + " " + arr.hour + ":" + arr.minute + ":" + arr.second;
  } else {
    return '-'
  }
})

export const dateChange = (timeStr) => {
  if (timeStr) {
    let arr = timeChange(timeStr);
    return arr.year + "-" + arr.month + "-" + arr.date + " " + arr.hour + ":" + arr.minute + ":" + arr.second;
  } else {
    return '-'
  }
}

export const today = (timing) => {
  let getCurrentDate = new Date();
  if (timing == 0) {
    // 参数传0：返回今天的最早时间
    return `${formatDate(getCurrentDate)} 00:00:00`;
  } else if (timing == 59) {
    // 参数传59：返回今天的最晚时间
    return `${formatDate(getCurrentDate)} 23:59:59`;
  } else {
    return formatDate(getCurrentDate);
  };
}

export const nowMonthStart = () => {
  let monthStartDate = new Date(nowYear, nowMonth, 1);
  return `${formatDate(monthStartDate)} 00:00:00`;
}

export const nowMonthEnd = () => {
  let monthEndDate = new Date(nowYear, nowMonth, getMonthDays(nowMonth));
  return `${formatDate(monthEndDate)} 23: 59: 59`;
}