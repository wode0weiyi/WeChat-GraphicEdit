import md5 from '../libs/md5.js'
var util = require('../utils/util.js')
// 主域名
// const domain = 'http://3s.dkys.org:23359';
// const domain = 'http://192.168.110.211:10800'; //测试地址
// const domain = 'http://192.168.1.233:10800';//开发地址
// const domain = 'https://apisimula.daliandong.cn'; //仿真坏境
const domain = 'https://api.daliandong.cn'; //线上地址

// 社管域名
const centerUrl = 'https://cluecenter.daliandong.cn';

// 网关拼接路径
const gateWayPath = 'api/clue';
// 网关appKey、secretKey
const appKey = 'H2bLGFrv_6XJA5zW';
const secretKey = "vVn0laqe_3YBADi5";
// 接口版本号
const apiVersion = '6';

function request(method, url, data) {

  // 域名校验
  var resUrl = checkUrl(url)

  //参数预处理
  var resData = prepareRequestParameter(data)

  // 添加网关签名/添加header
  var header = wx.getStorageSync('sid') ? {
    'sid': wx.getStorageSync('sid')
  } : {}
  if (method === 'GET') {
    resData['sign'] = signParameter(resData)
  } else {
    // resData['sign'] = signParameter(resData)
    // header['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8'

    resData = JSON.stringify(resData)
    header['sign'] = md5(secretKey + resData).toUpperCase()
  }

  console.log("--header--")
  console.log(header)
  
  //返回一个promise实例
  return new Promise((resolve, reject) => {
    console.log("↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓請求參數 start↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓")
    console.log(resUrl)
    console.log(resData)
    console.log("↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑請求參數 end↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑")
    wx.request({
      url: resUrl,
      header: header,
      data: resData,
      method: method,
      success: function(res) {
        console.log("↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓請求成功 start ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓")
        console.log(res)
        console.log("↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑請求成功 end↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑")
        responseSuccessHandle(res, resolve, reject)
      },
      fail: function(res) {
        console.log("↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓請求失敗 start↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓")
        console.log(res)
        console.log("↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑請求失敗 start↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑")
        reject(res);
      },
      complete: function() {

      }
    })
  })
}

//域名校验
function checkUrl(url) {
  var resUrl = url

  if (resUrl.indexOf('https://') == 0 || resUrl.indexOf('http://') == 0) {
    return resUrl
  } else {
    // url无域名,需拼接
    resUrl = domain + '/' + gateWayPath + '/' + resUrl
    return resUrl
  }
}

//参数预处理 
function prepareRequestParameter(data) {
  var resData = data ? data : {}

  resData['tqmobile'] = 'true'
  resData['appKey'] = appKey
  resData['apiVersion'] = apiVersion

  // 设备平台
  resData['mobileType'] = util.getPlatform()

  return resData
}

// 生成网关sign
function signParameter(data) {
  var array = []
  for (var key in data) {
    array.push(key)
  }

  array.sort()

  var signString = ''
  for (var i = 0; i < array.length; i++) {
    var key = array[i]

    var value = key + data[key] //(typeof (data[key]) === 'object' ? JSON.stringify(data[key]) : data[key])

    signString = signString + value
  }

  return md5(secretKey + signString).toUpperCase()
}

//网络请求成功处理
function responseSuccessHandle(res, resolve, reject) {
  if (res.statusCode == 200) {
    // 网关数据验证
    if (res.data['success'] == 1) {
      var resData = res.data['response']
      // 业务数据校验
      if (resData['success'] == 1) {
        // 返回业务数据
        resolve(resData['module'])
      } else if (resData['errCode'] === 'IOE100-01') {
        //身份验证失效
        reject('')

        var pagesArr = getCurrentPages();
        if (pagesArr[pagesArr.length - 1].route != 'pages/Home/Home' &&
          pagesArr[pagesArr.length - 1].route != 'pages/Login/Login') {
          getApp().globalData.userInfo = null
          wx.navigateTo({
            url: '../Login/Login?skipType=0',
          })
        }
      } else {
        var errMsg = resData['errDesc']
        reject((errMsg && typeof(errMsg) === 'string') ? errMsg : '')
      }
    } else {
      var errMsg = res.data['errorInfo']['errorMsg']
      reject((errMsg && typeof(errMsg) === 'string') ? errMsg : '')
    }
  } else {
    reject('')
  }
}

//get方法：用来获取数据
function get(url, data) {
  return request('GET', url, data)
}

//post方法：用来更新数据
function post(url, data) {
  return request('POST', url, data)
}

module.exports = {
  get: get,
  post: post,
}