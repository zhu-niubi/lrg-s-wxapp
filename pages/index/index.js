// index.js
const app = getApp()
import {
    request
} from '../../utils/request'


Page({
    data: {
        storeToken: wx.getStorageSync('storeToken'),
        slideList: [],
        windowHeight: wx.getStorageSync('windowHeight'),
    },

    getUserProfile: function (e) {
        let storeToken = wx.getStorageSync('storeToken')

        if (storeToken) {
            wx.navigateTo({
                url: '/pages/admin/index/index',
            })
        } else {
            //   授权获取用户信息
            wx.getUserProfile({
                desc: '展示用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
                success: (res) => {
                    const userInfo = res.userInfo
                    wx.setStorageSync('userInfo', userInfo)

                    wx.navigateTo({
                        url: '/pages/login/login',
                    })
                },
            })
        }

        this.setData({
            storeToken
        })

    },


    //   加载数据
    loaData: function (e) {
        let bodyData = {
            pageSize: 10,
            pageNumber: 1,
            type: 1
        }

        request({
            url: `/image`,
            method: 'GET',
            data: bodyData
        }).then((res) => {
            let {
                list
            } = res.data

            this.setData({
                slideList: list,
            })
        })

    },

    onLoad() {
        this.loaData()
    },

    onShow() {
        this.loaData()
    },

    onShareAppMessage: function () {
        return {
            title: '纳管家商家端'
        }
    },
    onPullDownRefresh:function() {
        wx.stopPullDownRefresh()
      },
})