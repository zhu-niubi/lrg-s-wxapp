// 获取应用实例
const app = getApp()
Component({
  data: {
    statusBarHeight: wx.getStorageSync('statusBarHeight'),
    navbarHeight: wx.getStorageSync('navbarHeight')
    
  },
  methods: {
    // 这里是一个自定义方法
    gotoBack: function () {
      let _this = this,
        pageLength = getCurrentPages();

      // 判断返回的页面
      if (pageLength.length > 1) {
        wx.navigateBack({
          changed: true
        })
      }
    }
  },
})