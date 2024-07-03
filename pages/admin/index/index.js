// 获取应用实例
const app = getApp()
import {
    request
} from '../../../utils/request'

Page({
    data: {
        userInfo: wx.getStorageSync('userInfo'),
        windowHeight: wx.getStorageSync('windowHeight'),
        navbarHeight: wx.getStorageSync('navbarHeight'),
        navList: [
            {name:'用户管理',icon:'manager-o',url:'/pages/admin/subPages/userList/userList'},
            {name:'卡券管理',icon:'gift-card-o',url:'/pages/admin/subPages/couponList/couponList'},
            {name:'用户车库',icon:'logistics',url:'/pages/admin/subPages/userCarList/userCarList'},
        ],
        constructionList: [
            {id:1,name:'消费卡券',icon:'scan'},
            {id:2,name:'施工单',icon:'todo-list-o'},
            // records
            // {id:3,name:'NFC质保读写',icon:'records'},
        ],
        noticeData:null , // 公告
    },

    // 跳转对应页面
    gotoApps:function(e){
        let {url} = e.currentTarget.dataset;
        wx.navigateTo({
            url
        })
    },

    // 跳转管理登录
    gotoManageLogin: function (e) {
        
        wx.navigateTo({
            url: '/pages/admin/subPages/manageList/manageList',
        })
    },
    // 扫码
    gotoServePage: function (e) {
        let id = e.currentTarget.dataset.id;
        if (id === 1) {
            wx.scanCode({
                success(res) {
                    let {
                        result
                    } = res
                    wx.navigateTo({
                        url: '/pages/admin/cardDetail/cardDetail?code=' + result
                    })
                }
            })
        }else if (id === 2) {
            wx.navigateTo({
                url: '/pages/admin/construction/construction'
              })
        }else if (id === 3) {
            wx.navigateTo({
                url: '/pages/admin/NFCWarranty/NFCWarranty'
              })
        }
        
    },

    // 修改员工信息
    gotoUserInfo: function (e) {
        wx.navigateTo({
            url: '/pages/admin/personalFile/personalFile',
        })
    },

//   获取员工信息
getEmployeeInfo:function(){
    request({
        url: `/profile`,
        method: 'GET',
      }).then((res) => {
        const {data} = res
        wx.setStorageSync('employeeInfo', data)

        this.setData({
            userInfo:data
        })
      })
},

    // 获取公告
    handleUseNotice() {
        let that = this
        request({
            url: `/notice`,
            method: "GET",
        }).then((res) => {
            let noticeData = res.data;
            that.setData({
                noticeData,
            });
        });
    },

    onLoad() {
        this.getEmployeeInfo()
        this.setData({
            userInfo:wx.getStorageSync('employeeInfo') ||  wx.getStorageSync('userInfo'),
        })
        this.handleUseNotice(); // 公告
    },

    onShow() {
        this.getEmployeeInfo();
        this.handleUseNotice(); // 公告
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