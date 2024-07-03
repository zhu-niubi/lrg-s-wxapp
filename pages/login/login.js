// index.js
const app = getApp()
import { request } from '../../utils/request'

Page({
  data: {
    userInfo:wx.getStorageSync('userInfo'),
    bgImg: 'https://www.mogutech.cn/wxapp/bg-login.jpg?t=20220222',
    windowHeight: wx.getStorageSync('windowHeight'),
  },

    //   加载数据
    loaData: function (e) {
      let bodyData = {
          pageSize: 10,
          pageNumber: 1,
          type:2
      }
  
      request({
        url: `/image`,
        method: 'GET',
        data:bodyData
      }).then((res) => {
        let {list} = res.data
        this.setData({
          bgImg:list[0].url,
        })
      })
      
    },

  submit: function (e) {

    let bodyData = e.detail.value

    if (bodyData.username == "" || bodyData.password == "") {
      wx.showModal({
        title: '错误提示',
        content: '账号或密码不能为空',
        showCancel: false,
        })
    }else{
      // 获取登录信息
      request({
        url: `/login/store`,
        method: 'POST',
        data:bodyData
      }).then((res) => {
        let {token,...data} = res.data
        
        wx.setStorageSync('storeToken', token)
        wx.setStorageSync('employeeInfo', data)

        wx.redirectTo({
          url: `/pages/admin/index/index`,
        })
      })
    }
  },


  onLoad(options) {

    this.loaData()
    this.setData({
      userInfo:wx.getStorageSync('employeeInfo') || wx.getStorageSync('userInfo')
    })
  },

  onShow() {
    this.loaData()
  },

  onShareAppMessage: function () { },
  onPullDownRefresh:function() {
    wx.stopPullDownRefresh()
  },
})
