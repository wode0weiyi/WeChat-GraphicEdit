// 图文编辑展示区域
/**
 * 组件调用说明
 * 本组件需要传入数据为content，类型为html字符串，但需要一个特定格式来确定，格式为<p>xxxx</p>+'<br/>'+<img src='xxxx' />，这里的<br/>是对数据进行处理的一个分隔符,可以自定义，但是不建议进行特殊字符的自定义
 * 本组件需要绑定一个方法 bind:gotoEditPage='xxxxx'
 * 调用代码：
 * <GraphicEdit class='graphicEdit' contentText='{{contentText}}}' bind:gotoEditPage='gotoEditPage'/>
 */


var WxParse = require('../../wxParse/wxParse.js');

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    contentText:{
      type:String,
      value:'',
      observer: function (newVal, oldVal, changedPath) {
        this.setData({
          content:newVal
        })
        this._dealDataSource(newVal)
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    content:''
  },

  /**
   * 组件的方法列表
   */
  methods: {
    _dealDataSource(content){
      if (content != undefined){
        var article = content
      var that = this;
      WxParse.wxParse('article', 'html', article, that, 5);
      } 
      // 对传入
    },
    // 点击进入编辑页
    _gotoEditPage: function (e) {
      this.triggerEvent("gotoEditPage", this.data.contentText);
    },
  }
})
