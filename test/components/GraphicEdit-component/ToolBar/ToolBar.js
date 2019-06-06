// components/GraphicEdit-component/ToolBar/ToolBar.js
// 工具条，实现选择字体，颜色，选择照片
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    direction:{//工具栏显示的方向，是横向显示还是纵向显示
      type:String,
      value:'',
      observer: function (newVal, oldVal, changedPath) {
        
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    fonts:[10,11,12,13,14,15,16,17,18,19,20],
    colors: ['#ff2600', '#ff9300', '#fffc00', '#00fa00', '#00fdff', '#00fdff', '#ff40ff', '#942092', '#ab7942', '#ffffff','#929292','#333333','#000000'],
    fontAnimation:{},
    colorAniamtion:{},
    fontIsShow:false,
    colorIsShow:false,
    fontSize:16,
    bgColor:'#999'
  },

  ready:function(options){
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 选择图片方法
    selectedImg(e){
      this.triggerEvent('takePhoto')
    },
    // show/dimiss字体view
    showFontView(e){
      // 判断当前的颜色view是否已经弹出
      this.setData({
        colorIsShow: false,
        fontIsShow: this.data.fontIsShow?false:true
      })
    },
    // show/dismiss颜色view
    showColorView(e){
      // 判断当前颜色选择view是否展示
      this.setData({
        colorIsShow:this.data.colorIsShow?false:true,
        fontIsShow:false
      })
    },
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
  }
})
