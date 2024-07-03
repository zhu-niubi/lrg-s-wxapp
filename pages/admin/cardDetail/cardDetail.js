// index.js
const app = getApp()
import { request } from '../../../utils/request'
import { formatTime } from '../../../utils/util.js'

Page({
  data: {
    cardInfo: {}, // 卡片详情数据
    isExpand: false,
    code:'',
    navbarHeight: wx.getStorageSync('navbarHeight'),
  },

    // 点击展开卡片内容
    handleIsExpand: function (e) {
      let that = this
      let isExpand = that.data.isExpand
      
      isExpand = !isExpand
      that.setData({
        isExpand,
      })
    },

  handleOk:function(e){
    let that = this
    let code = that.data.code
    let bodyData = {
      code
    }

    // console.log(bodyData)
    // return
    wx.showModal({
      title: '提示',
      content: '此操作不可回退，确定使用吗？',
      success (res) {
        if (res.confirm) {
          request({
            url: `/coupon/use_coupon`,
            method: 'POST',
            data:bodyData
          }).then((res) => {
            let {code} = res
            if (code === 0) {
              wx.showToast({
                title: '使用成功',
                icon: 'success',
                duration: 2000
              })
              setTimeout(() => {
                that.handleBack()
              }, 2000)
            }
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },

  handleBack:function(){
    wx.navigateBack({
      delta: 1
    })
  },
  
  onLoad(options) {
    let code = options.code
    console.log('options.code',code)
    if(code.length > 14){
      // wx.navigateTo({
      //   url: '/pages/admin/subPages/WriteOffItems/WriteOffItems?orderNumber=' + code
      // })
      wx.showToast({
        title: '请扫描正确二维码',
        icon: 'error'
      })
      return
    }else{
      request({
        url: `/coupon/${code}`,
        method: 'GET',
      }).then((res) => {
        let {data} = res
  
          data.createdAt = formatTime(data.createdAt)
          data.deadline = formatTime(data.deadline)
          
          if (data.applyStore.length && data.applyStore.indexOf(0) !== -1) {
              data.applyStoreList = []
          }else{
              data.applyStoreList = data.applyStore.map((a)=>{
                  return a.name
              })
          }
          console.log('carddata:',data)
  
        this.setData({
          cardInfo:data,
          code
        })
      })
    }
    
  },

  onShow() {},

  onShareAppMessage: function () { },
  onPullDownRefresh:function() {
    wx.stopPullDownRefresh()
  },
})
