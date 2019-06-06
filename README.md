# 微信小程序图文编辑组件的实现-WeChat-GraphicEdit

[源码地址WeChat-GraphicEdit](https://github.com/wode0weiyi/WeChat-GraphicEdit)

微信小程序的图文编辑功能，可针对单个输入框的文字进行简单样式调整，在文字中间插入、删除图片；

#### 组件的组成：

- ToolBar组件：工具栏，用来进行图片选择、文字大小选择、文字颜色选择工具
- GraphicEdit:图文编辑后的展示页
- GraphicEditPage：图文编辑的编辑页，组件核心界面。(可单独使用)

#### 使用方法

首先需要下载相应的组件代码，可以在源码链接里面下载
然后将文件`GraphicEdit-component`直接拖入到你项目中对应的位置

**1、toolBar**
toolBar组件不需要自己去操作，如果不想要工具栏，这可以在`GraphicEditPage`的`wxml`文件的`第19行`注释掉，然后将`18`行的注释打开，就可以了。

**2、GraphicEdit图文编辑展示页**
这个组件具体样式为：

![image.png](http://ww4.sinaimg.cn/large/006tNc79gy1g3rgjbllb7j30dw0bqjr9.jpg)

图中的方框部分就是`GraphicEdit`的样式，这个是没有文字和图片的时候展示的样式

1、如果需要，就要在你需要加此组件的page里面的`json`

文件里面导入组件：

![image.png](http://ww2.sinaimg.cn/large/006tNc79gy1g3rgk6u4frj30dw02waan.jpg)

2、在page的`wxml`文件里面对应位置加上。

```
<GraphicEdit class='graphicEdit' contentText='{{contentText}}' bind:gotoEditPage='gotoEditPage'/>
```

参数说明：
`contentText`：传入的富文本字符串，格式需要和下面介绍具体介绍一样，也就是

```
<p class='article-content' style='font-size:15;color:#333'>输入的文字</p></br><image src='xxxx.png'>
//</br>是一个分隔符
```

`bind:gotoEditPage`：这是一个绑定方法，是点击事件，点击进入到图文编辑界面，并且需要带上参数`contentText`，如：

```
// 去到编辑页(这里)
  gotoEditPage(e) {
    var encode = encodeURIComponent(this.data.contentText)
    wx.navigateTo({
      url: '/pages/test/Graphic?contentText='+encode,
    })
  },
```

**3、GraphicEditPage**
使用这个组件，建议先创建一个page来作为该组件的父试图，这样对数据的处理和使用比较方便。
1、在`json`文件里面导入组件：

![image.png](http://ww2.sinaimg.cn/large/006tNc79gy1g3rgkyhnl9j30dw0283ys.jpg)

2、在`wxml`

文件里面对应的地方使用：

```
<GraphicEditPage id='GraphicEditPage' contentText='{{contentText}}' 
bind:grapgicEditSubmit='grapgicEditSubmit' 
bind:graphicDeleteImg='graphicDeleteImg' 
bind:takePhotoSuccess='takePhotoSuccess'/>
```

参数说明：
`id`：组件的id，在js文件里可以通过这个id获取到这个组件
`contentText`：富文本字符串，格式和上面一致
`bind:grapgicEditSubmit`：绑定图文编辑页的提交按钮点击回调，可以在这里获取编辑的内容，如：

```
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
```

`bind:graphicDeleteImg`：图片删除绑定事件，可以获取到删除图片的url，根据这个url可进行服务器图片删除操作

```
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
```

`bind:takePhotoSuccess`:选择照片成功，这里如果可以获取到选择照片的本地地址，如：

```
/**
   * 添加图片成功方法，添加图片成功，将图片上传到服务器
   */
  takePhotoSuccess(e){
//由于组件里面做了图片上传的工作，所以这里没有做处理
  },
```

##### 注意事项：

## 使用本图文编辑组件，一定要注意组件需要的数据格式，不然是不能进行重新编辑或者内容展示的。建议使用html字符串的格式，因为这个组件里面都已经处理好了，大家做的只是将这个字符串取出传到服务器上，详情展示的时候，直接使用`wxParse`进行展示就可以了。

------

##### 各组件的基本介绍：

###### GraphicEditPage

先介绍核心界面`GraphicEditPage`，这个组件能实现文字和图片混编，在文字中间插入图片；可以针对单个输入框的文字进行大小和颜色的改变；可以自动将本组件的编辑内容以本组件支持的数据结构的形式回调出去；可以将本组件编辑的内容转换成html字符串回调出去，外界展示的时候可以直接用富文本展示第三方`wxParse`展示，这样就可以直接以字符串的形式存到数据库，取值展示的时候直接展示。

- 组件的原理：

由于微信小程序官方输入框`textArea`组件不支持图片展示的原因，所以在设计图文编辑组件的时候，参考了一些其他的小程序，将文字和图片分别用`textArea`和`image`来展示，类似于下图这样：

![组件的组成原理](http://ww4.sinaimg.cn/large/006tNc79gy1g3rglhobzaj30dc0j6t8o.jpg)

针对这样的设计，所以本组件用到的数据结构就比较特殊，为了便于编辑和数据处理，本组件设计的数据结构为：

```
[{
'type': 'string',//textArea类型
'value': '输入的文字',//输入的值
'font-size':30,//字体大小，单位rpx
'color':'#333'//字体颜色
},
{
'type':'image',//image类型
'imgPath':'xxx',//图片的本地地址
'imgUrl':'xxx',//图片的网络地址
'uploadState':0,//图片上传的状态，0表示未进行上传操作，1表示上传成功，-1表示上传失败
}
]
```

如上面的数据结构中，通过`type`来判断是`textArea`还是`image`，在wxml文件里面布局对应的组件。

- 具体功能的实现

  - 1、文字中间插入图片

  在文字中间插入图片，首先需要知道当前`textArea`所在的位置，并且当前`textArea`的焦点所在的位置，这个都可以通过`textArea`的绑定方法获取到:

```
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
```

通过`textArea`的`bindblur`方法，我们可以获取到`textArea`失去焦点时，焦点所在的位置`cursor`，保存到data中的`currentCursor`中，在插入图片的时候，通过焦点`cursor`位置进行判断，将`textArea`中的内容从焦点位置一份为二，中间放入图片，则数据结构就是这样：

```
[
{
'type': 'string',//textArea类型
'value': '输入的文字',//输入的值
'font-size':30,//字体大小，单位rpx
'color':'#333'//字体颜色
},
{
'type':'image',//image类型
'imgPath':'xxx',//图片的本地地址
'imgUrl':'xxx',//图片的网络地址
'uploadState':0,//图片上传的状态，0表示未进行上传操作，1表示上传成功，-1表示上传失败
},
{
'type': 'string',//textArea类型
'value': '输入的文字',//输入的值
'font-size':30,//字体大小，单位rpx
'color':'#333'//字体颜色
}
]
```

当然这是普通现象，还要对特殊情况进行判断插入，比如焦点在最后，焦点在最开始处，输入框没有输入的时候插入图片的情况，这些判断都在组件方法`_dealDataArray`方法中实现：

```
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
```

- 图片的上传和删除
  1、图片的上传
  组件提供了图片上传服务器的功能，但是以微信小程序官方api`wx.upload`方法上传的，这个功能做的是单张图片上传操作，就是添加一张就上传一张图片到服务器，服务器返回图片在服务器上的地址，然后在转换成html字符串的时候将这个服务器地址写入。方便展示的时候，直接使用`wxPrase`展示。

```
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
```

图片有可能上传失败，这里也做了对上传失败的处理，如果上传失败，可以点击图片区域重新上传

```
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
```

2、图片的删除
对添加的图片进行删除，这里的删除会提供回调方法供外面界面回调，但是删除图片的操作不受外面的影响。

```
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
```

- 组件编辑数据的处理和返回
  组件在点击提交的时候，会返回当前编辑的内容，具体会返回两个值：
  1、 `htmlContent`:html字符串，可以直接使用`wxParse`展示，类似下面这样：

```
<p class='article-content' style='font-size:15;color:#333'>输入的文字</p></br><image src='xxxx.png'>
//</br>是一个分隔符
```

2、 `dataSource`:数组类型的数据，为本组件自定义的数据结构，适用于本组件，外界也可以遍历根据`type`判断取值。
提交按钮方法实现:

```
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
```

------

------

###### Graphic

组件Graphic是一个展示图文编辑的组件，会提供一系列方法，比如一个界面需要在一个区域实现点击跳转到图文编辑页，然后展示编辑内容，那么这个组件就可以使用。该组件组要是通过`wxParse`实现，目前小程序对富文本的支持不是很友好，需要自己将富文本转换成`richText`组件需要`nodes`数据。

###### ToolBar

Toolbar 是一个工具类，就是简单的改变输入框的字体大小和颜色，然后就是图片选择拍照功能按钮。提供三个方法回调：
1、选择照片按钮点击回调：

```
// 选择图片方法
    selectedImg(e){
      this.triggerEvent('takePhoto')
    },
```

2、选择字体按钮点击回调

```
//点击字体选择
    selectedFont(e){
      console.log(e)
      let font = e.currentTarget.dataset.item
      this.setData({
        fontSize:font,
        fontIsShow:false
      })
      let dic = {'font':font}
      this.triggerEvent('selectedFont',dic)
    },
```

3、选择文字颜色按钮点击回调

```
// 点击颜色选择
    selectedColor(e){
      let color = e.currentTarget.dataset.item
      this.setData({
        bgColor:color,
        colorIsShow:false
      })
      let dic = {'color':color}
      this.triggerEvent('selectedColor',dic)
    }
```

---

---

**欢迎有问题的伙伴评论，我会在第一时间去处理并回复**