// 获取应用实例
const app = getApp()
import { request } from '../../../utils/request'
import { formatTime } from '../../../utils/util.js'

Page({
  data: {
    bgImg:'',
    userInfo: wx.getStorageSync('userInfo'),
    windowHeight: wx.getStorageSync('windowHeight'),
    navbarHeight: wx.getStorageSync('navbarHeight'),
  },


  // 加载背景图数据
  handleBjImage: function (e) {
    let bodyData = {
        pageSize: 10,
        pageNumber: 1,
        type:4
    }

    request({
      url: `/image`,
      method: 'GET',
      data:bodyData
    }).then((res) => {
      let {list} = res.data
      let bgImg = list[0] ? list[0].url : ''
      let newBgImg  = bgImg ? `background-image: url('${bgImg}')` : ''
      
      this.setData({
        bgImg:newBgImg
      })
    })
  },

  formSubmit:function(e){
    const value = e.detail.value
    if (!value.username || !value.password) {
      wx.showToast({
        title: '数据不完整',
        icon: 'error',
        duration: 1000
      })
    }else{
      this.handleLogin(value)
    }
  },

  // 登录接口
  handleLogin:function(val){
    let that = this
    let {password,username} = val

    let bodyData = {
      password,
      username
      }

    // console.log(bodyData)
    // return
    request({
      url: `login`,
      method: 'POST',
      data:bodyData
    }).then((res) => {

      let {token} = res.data
      wx.showToast({
        title: '登录成功',
        icon: 'success',
        duration: 1000
      })
      
      wx.setStorageSync('adminToken', token)

      wx.redirectTo({
        url: '/pages/admin/subPages/manageList/manageList',
      })
    })
  },

  //   获取员工信息
getEmployeeInfo:function(){
    request({
        url: `/profile`,
        method: 'GET',
      }).then((res) => {
        const {data} = res
        this.setData({
            userInfo:data
        })
      })
},

  onLoad() {
    // this.handleBjImage() // 背景图
    this.getEmployeeInfo()
    this.setData({
      userInfo:wx.getStorageSync('employeeInfo') || wx.getStorageSync('userInfo')
    })
  },

  onShow() { },
  onPullDownRefresh:function() {
    wx.stopPullDownRefresh()
  },
})
