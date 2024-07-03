// 获取应用实例
const app = getApp()
import { request } from '../../../../utils/request'
import { formatTime,phoneCheck } from '../../../../utils/util.js'

Page({
  data: {
    
    manageList: [
      {
        name: '用户管理',
        icon:'manager-o',
        url:'/pages/admin/subPages/userList/userList'
      },
      {
        name: '卡券管理',
        icon:'gift-card-o',
        url:'/pages/admin/subPages/couponList/couponList'
      },
      {
        name:'用户车库',
        icon:'logistics',
        url:'/pages/admin/subPages/userCarList/userCarList'},
    ],
    windowHeight: wx.getStorageSync('windowHeight'),
    navbarHeight: wx.getStorageSync('navbarHeight'),
  },




  // 跳转相应详情页面
  gotoListDetail: function (e) {
    let url = e.currentTarget.dataset.url
    wx.navigateTo({
      url
    })
    
  },


  onLoad() {
  },

  onShow() {
  },
  onPullDownRefresh:function() {
    wx.stopPullDownRefresh()
  },
})
