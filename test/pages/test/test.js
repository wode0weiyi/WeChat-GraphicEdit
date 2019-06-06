// pages/test/test.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
//     contentText: `测试测试测试测试测试测试测试测试测测试测试测试测试
//     测试测试测试测试测试<br/><img src='https://ss1.baidu.com/9vo3dSag_xI4khGko9WTAnF6hhy/image/h%3D300/sign=77d1cd475d43fbf2da2ca023807fca1e/9825bc315c6034a8ef5250cec5134954082376c9.jpg' width=345 />
// // <br/>设计案例看得见老师讲课老师介绍方式结案了`,
    contentText: ``,
    dataSorce:[]
  },

  /**
   * w
   * 
   * 
   * 
   * 
   * 
   * 
   * 
   * 
   * 
   * ddas
   * 
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  // 去到编辑页(这里)
  gotoEditPage(e) {
    var encode = encodeURIComponent(this.data.contentText)
    wx.navigateTo({
      url: '/pages/test/Graphic?contentText='+encode,
    })
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})