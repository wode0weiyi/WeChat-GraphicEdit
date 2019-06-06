// pages/test/test1.js
var httpClient = require('../../utils/HttpClient.js');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    item:{},
    contentText:'',
    dataSorce:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options.contentText)
    this.setData({
      contentText: decodeURIComponent(options.contentText)
    })
    this.graphicEditPage = this.selectComponent("#GraphicEditPage")
  },

/**
 * 图文编辑提交按钮
 * 对取到的数据进行解析，获取图片资源，上传到服务器获取到服务器的url，替换原来图片的url，然后转换成html字符串
 */
  grapgicEditSubmit(e){
    console.log(e)
    // 取出对应的数值
    var htmlContent = e.detail.htmlContent
    this.data.contentText = htmlContent
    //获取上个界面
    let pages = getCurrentPages()
    let prePage = pages[pages.length - 2]
    prePage.setData({
      contentText:htmlContent
    })
    
  },
  /**
   * 添加图片成功方法，添加图片成功，将图片上传到服务器
   */
  takePhotoSuccess(e){
  },
  /**
   * 图片删除回调，返回当前删除图片的imgUrl，根据url删除服务器上面的图片
   */
  graphicDeleteImg(e){
    var imgUrl = e.detail;
    this._removeImage(imgUrl)
  },

  // 根据图片url删除图片，同时删除服务器上面的图片
  _removeImage(imgUrl) {
    var params = {
      "imgUrl": imgUrl
    }
    httpClient.post('http://192.168.10.83:8088/api/clue/activityDubboService/updateImg', params).then(res => {
      console.log(res)
    }).catch(error => {
      console.log(error)
    })
  },
  // 图片资源转换成base64
  _imageToBase64(filePath, callBack) {
    wx.getImageInfo({
      src: filePath,
      success: function (res) {
        let base64 = wx.getFileSystemManager().readFileSync(res.path, 'base64')
        var fileName = new Date().getTime() + '.png'
        callBack({
          'fileData': base64,
          'fileName': fileName
        })
      },
      fail: function (error) {

      }
    })
  },
  // 图片上传到服务器，服务器返回一个图片地址
  _uploadImage(filePath,callBack) {
    // 图片转成base64
    const that = this
    this._imageToBase64(filePath, res => {
      //图片转换成功
      var imageData = res.fileData
      var imageName = res.fileName
      var params = {
        'imgName': imageName,
        'imgUrl': imageData
      }
      // 上传图片到服务器上(这里需要根据自己服务器接口特性做调整)
      httpClient.post('http://192.168.10.83:8088/api/clue/activityDubboService/addImg', params).then(res => {
        // 图片上传服务器成功，获取图片在服务器上面的url
        console.log(res)
        var imgUrl = res.imgUrl
        callBack(imgUrl)
      }).catch(error => {
        console.log(error)
      })
    })
  },
})