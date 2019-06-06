const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('.') + ' ' + [hour, minute].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function fmtDate(obj) {
  var date = new Date(obj);
  var y = 1900 + date.getYear();
  var m = "0" + (date.getMonth() + 1);
  var d = "0" + date.getDate();
  return y + "-" + m.substring(m.length - 2, m.length) + "-" + d.substring(d.length - 2, d.length);
}



 function base64src(base64data) {
  
   let FILE_BASE_NAME = 'tmp_base64src';
  return new Promise((resolve, reject) => {
    if (!wx.getFileSystemManager) {
      reject(new Error('微信版本过低'))
      return
    }
    let fsm = wx.getFileSystemManager();

    const [, format, bodyData] = /data:image\/(\w+);base64,(.*)/.exec(base64data) || [];
    if (!format) {
      reject(new Error('ERROR_BASE64SRC_PARSE'));
    }
    const filePath = `${wx.env.USER_DATA_PATH}/${FILE_BASE_NAME}.${format}`;
    const buffer = wx.base64ToArrayBuffer(bodyData);
    fsm.writeFile({
      filePath,
      data: buffer,
      encoding: 'binary',
      success() {
        resolve(filePath);
      },
      fail() {
        reject(new Error('ERROR_BASE64SRC_WRITE'));
      },
    });
  });
};

//获取客户端平台
function getPlatform() {
  var platform = 'ios'
  try {
    var res = wx.getSystemInfoSync()
    platform = res.platform
  } catch (e) {
    // Do something when catch error
  }
  return platform
}

function percentage(number1, number2) {
  return (Math.round(number1 / (number1 + number2) * 10000) / 100.00 + "%");
  // 小数点后两位百分比
}

module.exports = {
  formatTime: formatTime,
  fmtDate: fmtDate,
  base64src: base64src,
  getPlatform: getPlatform,
  percentage: percentage
}
