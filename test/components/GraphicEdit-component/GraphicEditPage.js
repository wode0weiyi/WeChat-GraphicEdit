// components/GraphicEdit-component/GraphicEditPage.js
/**
 * 组件调用说明
 * 本组件调用的时候，只需要传入content数据，content数据为html字符串，需要特定的格式，不然无法解析，或者解析不正确；特定格式为：<p>xxxx</p>+<br/>+<img src='xxxx' /><br/>作为一个分隔符对文字和图片进行分层
 * 本组件提供三个方法绑定，分别为：
    1、grapgicEditSubmit：提交按钮的点击事件，绑定后，可以在event里面拿到dataSorce和contentText数据
    2、graphicDeleteImg：删除按钮的点击事件，绑定后，可以在event里面拿到imgUrl数据，可根据url去删除服务器的图片资源
    3、takePhotoSuccess：添加图片成功事件，绑定后，可以在event里面拿到图片的本地filePath和图片空间所处的位置index，（可以做图片上传服务器操作或保存操作，可配合删除图片方法使用）;不建议外部处理

 * 调用代码示例：
    <GraphicEditPage id='GraphicEditPage' contentText='{{contentText}}' bind:grapgicEditSubmit='grapgicEditSubmit' bind:graphicDeleteImg='graphicDeleteImg' bind:takePhotoSuccess='takePhotoSuccess'/>
 */

const divideStr = '<br/>'//分隔符，可以设置自定义的分隔符，但不要影响到html字符串的显示。
const dfFontSize = 30
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 外界传入的符合本组件数据结构的数组，一般为本组件
    dataSource: {
      type: Array,
      value: [],
      observer: function(newVal, oldVal, changedPath) {
        // 对传入的数据进行数据处理
        this._dealDataSorce(newVal)
      }
    },
    // 外界传入的html字符串
    contentText: {
      type: String,
      value: '',
      observer: function(newVal, oldVal, changedPath) {
        // 对传入的数据进行数据处理
        this._dealContentText(newVal)
      }
    },
    // 图片上传地址url
    uploadImageUrl: {
      type: String,
      value: 'http://192.168.10.83:8088/activityDubboService/addImg',
      observer: function(newVal, oldVal, changedPath) {

      }
    },

  },

  /**
   * 页面的初始数据
   */
  data: {
    currentVlaue: '', //当前焦点所在的输入框的内容
    currentCursor: 0, //当前焦点的位置（失去焦点时）
    currentIndex: 0, //当前输入框属于第几个元素
    autoheight: true, //输入框处于第一个位置的时候，设置固定高度，达到一定高度的时候自动增高
    areaHeight: 914,
    windowWidth: 375,
    submitBtnBgColor:'#999',
    dataAry: [{
      'type': 'string',//类型
      'value': '',//值
      'font-size':dfFontSize,//字体大小
      'color':'#333'//字体颜色
    }, 
    // {'type':'image',
    // 'imgPath':'xxx',//图片的本地地址
    // 'imgUrl':'xxx',//图片的网络地址
    // 'uploadState':0,//图片上传的状态，0表示未进行上传操作，1表示上传成功，-1表示上传失败
    // }
    ], //输入元素的数组
  },
  /**
   * 生命周期函数--监听页面加载
   */
  ready: function(option) {
    var that = this
    // 获取手机型号
    wx.getSystemInfo({
      success: function(res) {
        let windowHeight = (res.windowHeight * (750 / res.windowWidth))
        let areaHeight = windowHeight - 310
        that.setData({
          areaHeight: areaHeight,
          windowWidth: res.windowWidth
        })
      },
    })
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 输入框失去焦点时触发
    bindblur(e) {
      console.log(e);
      this.data.currentVlaue = e.detail.value
      // 获取焦点的位置
      this.data.currentCursor = e.detail.cursor
      // 当前输入框属于第几个元素
      this.data.currentIndex = e.currentTarget.dataset.index
    
      let item = this.data.dataAry[this.data.currentIndex]
      if (item != undefined) {
        var dic = {
          'type': 'string',
          'value': this.data.currentVlaue,
          'fontSize':item.fontSize == undefined?dfFontSize:item.fontSize,
          'color':item.color
        }
        this.data.dataAry.splice(this.data.currentIndex, 1, dic)
      } else {
        var dic = {
          'type': 'string',
          'value': this.data.currentVlaue,
          'fontSize':dfFontSize,
          'color':'#333'
          }
        this.data.dataAry.push(dic)
      }
      this._checkEditData(res=>{})
    },
    // 输入框输入时触发
    bindinput(e) {
      console.log(e);
      this.data.currentVlaue = e.detail.value
      this.data.currentCursor = e.detail.cursor
      this.data.currentIndex = e.currentTarget.dataset.index
      let item = this.data.dataAry[this.data.currentIndex]
      var dic = {
        'type': 'string',
        'value': this.data.currentVlaue,
        'fontSize':item.fontSize == undefined?dfFontSize:item.fontSize,
        "color":item.color
      }
      this.data.dataAry.splice(this.data.currentIndex, 1, dic)
      this._checkEditData(res => { })
    },
    // 输入框行数变化时触发
    bindlinechange(e) {
      // 当前输入框行数
      var lineHeight = e.detail.height * (750 / this.data.windowWidth)
      console.log(lineHeight, this.data.areaHeight)
      //当前输入框处于的位置
      var index = e.currentTarget.dataset.index
      // 判断当前输入框是否处于第一个位置，是的话，超过一定行数，则改变aotoheight值为true
      if (index == 0) {
        if (lineHeight > this.data.areaHeight) { //行数大于等于10行的时候
          this.setData({
            autoheight: true
          })
        } else {
          this.setData({
            autoheight: false,
            areaHeight: this.data.areaHeight
          })
        }
      }
    },
    // 拍照
    takePhoto() {
      var that = this;
      wx.chooseImage({
        count: 1,
        sourceType: ['album', 'camera'],
        success: function(res) {
          console.log(res);
          for (var item of res.tempFilePaths) {
            // 在这里对图片进行上传操作
            wx.showLoading({
              title: '图片上传中',
            })
            that._uploadImage(item,res=>{
              wx.hideLoading()
              //上传图片的回调
              if(res.length > 0){//表示有数据返回，这里的数据是指服务器返回的图片网络地址，进行数据赋值
                that._dealDataArray(item,res,1)
              }else{
                //上传失败，需要更新数据
                that._dealDataArray(item,'',-1)
              }
            })
            /**
             * 下面注释方法是将添加照片成功后，回调出去，供外部使用，进行额外的处理
             */
            let dic = {
              'imgSrc': item,
              'index': that.data.currentIndex
            }
            // 外部调用方法，上传图片到服务器，成功后，通过本组件的共有方法dealUploadImgData，对本页面的数据进行处理，保证最终提交返回出去的图片url为服务器上的地址；后续直接以html字符串的形式传到服务器，以便后续的展示
            that.triggerEvent('takePhotoSuccess', dic)
          }
        },
      })
    },

    // 点击重新上传图片
    imgUploadAginEvent(e){
      let index = e.currentTarget.dataset.index;
      let imgItem = this.data.dataAry[index]
      let imgPath = imgItem.imgPath
      // 上传图片
      wx.showLoading({
        title: '图片上传中',
      })
      this._uploadImage(imgPath,res=>{
        wx.hideLoading()
        if(res.length > 0){
          //上传成功，改变数据源
          imgItem['imgUrl'] = res
          imgItem['uploadState'] = 1
          this.data.dataAry[index] = imgItem
          this.setData({
            dataAry:this.data.dataAry
          })
          this._checkEditData(res => { })
        }else{  
          // 上传失败，提示用户
          wx.showToast({
            title: '图片上传失败',
            icon:'none'
          })
        }
      })
    },

    // 图片删除
    deleteImg(e) {
      var index = e.currentTarget.dataset.index;
      var imgItem = this.data.dataAry[index]
      var imgUrl = imgItem.value

      var dic1 = this.data.dataAry[index - 1]
      var dic2 = this.data.dataAry[index + 1]
      //图片前后都有数据存在
      if (dic1 != undefined && dic2 != undefined) {
        //删除图片的前后都是文字时
        if (dic1.type == 'string' && dic2.type == 'string') {
          var string = dic1.value + dic2.value
          var dic3 = {
            'type': 'string',
            'value': string,
            'fontSize':dic1.fontSize,
            'color':dic1.color
          }
          this.data.dataAry.splice(index - 1, 3, dic3)
        } else { //删除图片前后是图片和文字时
          this.data.dataAry.splice(index, 1)
        }
      } else { //图片前面没有数据时
        this.data.dataAry.splice(index, 1)
      }
      this.setData({
        dataAry: this.data.dataAry,
        currentIndex: this.data.currentIndex - 1
      })
      this._checkEditData(res => { })
      // 删除方法传到外部，不管外部怎么操作，本界面删除的图片已经从数据源中删除。（外部可做删除网络图片的操作）
      this.triggerEvent('graphicDeleteImg', imgUrl)
    },
    // 对文本编辑的内容进行提交
    submit(e) {
      // 判断当前编辑是否有内容，图片是否都已经上传
        this._checkEditData(res=>{
          if(res.length <= 0){
            //提交文本，首先对数据进行html标签编辑,文本转成html文本，看自己需求是否需要
            var dataStr = this.dealArrayToHtmlStr(this.data.dataAry)
            var dic = {
              'htmlContent': dataStr,
              'dataSource': this.data.dataAry
            }
            // 提交按钮回调方法，这里会将当前的编辑内容的html字符串和本组件数据结构的数组作为参数传递出去
            this.triggerEvent('grapgicEditSubmit', dic)
            wx.navigateBack({})
          }else{
            wx.showToast({
              title: res,
              icon:'none'
            })
          }
        })
      
    },
    /********************************公有方法***************************************** */
    /**
     * 对array类型的数据处理成html类型的数据
     * dataSource:符合类型的array
     */
    dealArrayToHtmlStr(dataSource) {
      var dataStr = ''
      if (dataSource.length > 0) {
        for (var item of dataSource) {
          if (item.type == 'string') {
            // 拼接的时候设置一个class，可以在后续使用wxParse展示的时候，设置样式，见Graphic.wxss里面的样式
            dataStr = dataStr.length > 0 ? (dataStr + "<p class='article-content' style='font-size=" + item.fontSize/2 +'px'+ ';color=' + item.color + ";'>" + item.value + '</p>') : "<p class='article-content' style='font-size:" + item.fontSize/2+'px' + ';color:' + item.color + ";'>" + item.value + '</p>';
          } else {
            let imgSrc = (item.imgUrl.length > 0 ? item.imgUrl : item.imgPath)
            let imgStr = "<img src='" + imgSrc + "'/>"
            dataStr = dataStr.length > 0 ? (dataStr + '<br/>' + imgStr) : imgStr
          }
        }
      }
      return dataStr
    },
  
    /********************************私有方法***************************************** */
    /** 
     * 根据焦点位置插入图片，对数据进行处理（选择图片或者拍照成功后触发）
     * imgPath:图片本地路劲
     * imgUrl:图片的网络地址
     * state:图片的上传状态，-1表示上传失败，0表示未做上传操作，1表示上传成功
     */
    _dealDataArray(imgPath,imgUrl,state) {
      // 取出当前插入图片位置的输入框内容，在焦点位置将输入框内容分为两个元素，中间插入图片元素
      // this.data.currentCursor = 3
      var item = this.data.dataAry[this.data.currentIndex];
      var index = this.data.currentIndex
      if (item.type == 'string') { //文字中插入图片
        var dic1 = {
          'type': 'string',
          'value': this.data.currentVlaue.substring(0, this.data.currentCursor),
          style:item.style
        }
        var dic2 = {
          'type': 'image',
          'imgPath': imgPath,
          'imgUrl':imgUrl,
          'uploadState':state
        }
        var dic3 = {
          'type': 'string',
          'value': this.data.currentVlaue.substring(this.data.currentCursor, this.data.currentVlaue.length),
          style:item.style
        }
        console.log(dic1, dic2, dic3)

        if (dic1.value.length > 0 && dic3.value.length > 0) { //图片前后文字都存在
          this.data.dataAry.splice(this.data.currentIndex, 1, dic1, dic2, dic3)
          index = index + 1;
        } else if (dic1.value.length > 0 && dic3.value.length <= 0) { //图片只在文字后面
          if(this.data.currentIndex == this.data.dataAry.length - 1){//如果当前插入图片的文字处于最后一个元素，则要在最后添加一个输入框
            this.data.dataAry.splice(this.data.currentIndex + 1, 0, dic2, dic3)
          }else{//如果不是最后一个元素，则直接添加图片就可以
            this.data.dataAry.splice(this.data.currentIndex + 1, 0, dic2)
          }
          index = index + 1
        } else if (dic3.value.length > 0 && dic1.value.length <= 0) { //图片加在文字前面
          this.data.dataAry.splice(this.data.currentIndex, 1, dic2, dic1)
        } else { //一开始就插入图片，要在图片数据后面插入一个空的输入框
          this.data.dataAry.splice(this.data.currentIndex, 1, dic2, dic1)
          index = index + 1
        }
        this.setData({
          dataAry: this.data.dataAry,
          currentIndex: index
        })
      } else { //图片后面插入图片
        var dic2 = {
          'type': 'image',
          'imgPath': imgPath,
          'imgUrl':imgUrl,
          'uploadState':state
        }
        //在上一张图片后面插入一张图片，需要index+1
        this.data.dataAry.splice(this.data.currentIndex + 1, 0, dic2)
        this.setData({
          dataAry: this.data.dataAry,
          currentIndex: this.data.currentIndex + 1
        })
      }
      // 判断当前数据是否可以提交
      this._checkEditData(res => { })
    },

    /**
     *  对传入的数据进行处理，以适用于本组件（当前数据是以html字符串传入的）
     * 传入的html字符串需要符合组件的数据结构，类似下面这样的数据
       <p>xxxxx</p><br/><img src='xxx'/>
       <br/>为分隔符，可以自定义，但是不能影响后续显示，推荐<br/>
    */
    _dealContentText(content) {
      // 先判断是否有值
      if (content.length > 0) {
        // 对content按照特殊标签<br/>截取
        var array = content.split('<br/>');
        // 对数组array遍历处理
        var temAry = []
        for (var item of array) {
          // 判断item是否包含img标签，包含的话，则表示是图片，不包含的话表示文字
          var imgMacth = this._matchImg(item)
          var dic = null
          if (imgMacth[0]) {
            dic = {
              'type': 'image',
              'imgPath': '',
              'imgUrl':imgMacth[1],
              'uploadState':1
            }
          } else {
            //判断是否有<p></p>标签
            let strReg = "<p.*?>(.*?)</p>"//匹配字符串
            let fontReg = `font-size:\s?(.*)\s?px`//匹配字体大小
            let colorReg = `color:\s?(.*);`//匹配字体颜色色值
            var strAry = item.match(strReg)
            var fontAry = item.match(fontReg)
            var colorAry = item.match(colorReg)
            dic = {
              'type': 'string',
              'value': strAry[1],
              'fontSize':parseFloat(fontAry[1]) * 2,
              'color':colorAry[1]
              }
          }
          if (dic != null) {
            temAry.push(dic)
          }
        }
        var lastDic = temAry[temAry.length - 1]
        this.data.currentIndex = temAry.length - 1
        if (lastDic.type == 'string') {
          this.data.currentVlaue = lastDic.value
          this.data.currentCursor = lastDic.value.length
        }
        this.setData({
          dataAry: temAry,
        })
        // 判断当前数据是否可提交
        this._checkEditData(res => { })
      }
    },
    /** 
     *处理传入的数据（当前数据是以array的形式传入）
     * 传入格式为：[{'type':'string','value':xxxx}],若是字符串则type是string；若是图片，type是image，value是图片对应的src
     */
    _dealDataSorce(dataSorce) {
      if (this.dataSorce.length > 0) {
        this.setData({
          dataAry: dataSorce
        })
      }
    },
    // 判断字符串中是否带有图片img标签,并取出src的值，包含返回true，否则返回false
    _matchImg(string) {
      var imgReg = /<img.*?(?:>|\/>)/gi;
      var srcReg = /src=[\'\"]?([^\'\"]*)[\'\"]?/i;
      var arr = string.match(imgReg); // arr 为包含所有img标签的数组
      if (arr != null && arr.length > 0) {
        var src = arr[0].match(srcReg)
        return [true, src[1]]
      } else {
        return [false]
      }
    },
    // 图片上传到服务器，服务器返回一个图片地址
    _uploadImage(filePath, callBack) {
      // var imgUrl = 'https://ss1.baidu.com/9vo3dSag_xI4khGko9WTAnF6hhy/image/h%3D300/sign=77d1cd475d43fbf2da2ca023807fca1e/9825bc315c6034a8ef5250cec5134954082376c9.jpg'

      // 使用微信自带的图片上传方法，以文件的形式上传，这里需要服务器支持
      const that = this
      wx.uploadFile({
        url:that.properties.uploadImageUrl,//服务器地址，上传图片的地址
        filePath:filePath,//图片本地的地址
        name:'file',//文件对应的key，服务器可以通过这个key获取到图片的二进制内容
        formData:{},//需要传递的其他参数
        success(res){
          //上传成功回调
          if(res.statusCode == 200){
          let imgUrl = res.imgUrl
          callBack(imgUrl)
          }else{
            callBack('')
          }
        },
        fail(error){
          // 上传失败回调
          callBack('')
        }
      })
    },
    // 图片资源转换成base64
    _imageToBase64(filePath, callBack) {
      wx.getImageInfo({
        src: filePath,
        success: function(res) {
          let base64 = wx.getFileSystemManager().readFileSync(res.path, 'base64')
          var fileName = new Date().getTime() + '.png'
          callBack({
            'fileData': base64,
            'fileName': fileName
          })
        },
        fail: function(error) {

        }
      })
    },
    // 判断编辑数据是否可以提交
    _checkEditData(callBack){
      var error = ''
      if (this.data.dataAry.length == 1) {//什么都没操作情况下点击提交按钮
      //如果数据源中只有一个元素，需要判断这个元素是否有值
        let strItem = this.data.dataAry[0]
        if (strItem.value.length == 0) {
          error = '请输入内容'
        }
      } else {
        for (let item of this.data.dataAry) {
          // for循环判断图片数据，只要有一张图片未上传成功，就提交不了
          if (item.type == 'image') {
            if (item.uploadState == -1) {
              //有图片没有上传成功，提示
              error = '有图片没有上传，请重新上传'
            }
          }
        }
      }
      // 根据error是否有值，改变提交按钮的颜色
      this.setData({
        submitBtnBgColor: error.length > 0 ? "#999" :"#FF726F"
      })
      callBack(error)
    },

    /********************ToolBar相关方法******************* */
    /**拍照方法见takePhoto */
    // 选择字体大小方法
    selectedFont(e){
      // 获取当前的选择的控件位置，如果控件是图片的话，则不会发生变化，如果是textArea的话，则改变字体大小
      let index = this.data.currentIndex;
      // 获取当前index位置的控件类型
      let item = this.data.dataAry[index]
      if(item.type == 'string'){
        item.fontSize = parseFloat(e.detail.font) * 2
        this.data.dataAry[index] = item
        this.setData({
          dataAry:this.data.dataAry
        })
      }
    },
    // 选择字体颜色方法
    selectedColor(e){
      let index = this.data.currentIndex
      let item = this.data.dataAry[index]
      if(item.type == 'string'){
        item.color = e.detail.color
        this.data.dataAry[index] = item
        this.setData({
          dataAry:this.data.dataAry
        })
      }
    }
  }
})