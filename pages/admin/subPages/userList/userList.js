// 获取应用实例
const app = getApp()
import {
    request
} from '../../../../utils/request'
import {
    formatTime,
    phoneCheck
} from '../../../../utils/util.js'
import Toast from '@vant/weapp/toast/toast'

Page({
    data: {
        userInfoList: [],
        windowHeight: wx.getStorageSync('windowHeight'),
        navbarHeight: wx.getStorageSync('navbarHeight'),
        pageNumber: 1,
        pageSize: 10,
        totalNumber: 0,
        searchValue: '',
        isTouchGround:false, // 是否触底
    },
    onChange(e) {
        let searchValue = e.detail.replace(/\s*/g, "")
        this.setData({
            searchValue,
            pageNumber:1
        });
    },
    onSearch() {
        let val = this.data.searchValue
        this.handleUserInfo(val)
    },

    // 点击搜索框左侧按钮
    onClickLeft:function() {
        wx.navigateBack({
            delta: 1
        })
    },

    // 根据用户id跳转卡券页面查询相应信息
    gotoCouponPage(e) {

        let userId = e.currentTarget.dataset.userid

        wx.navigateTo({
            url: '/pages/admin/subPages/couponList/couponList?userId=' + userId,
        })
    },


    // 获取用户信息
    handleUserInfo: function (val) {
        let that = this,
            userInfoList = [...that.data.userInfoList],
            pageSize = that.data.pageSize,
            pageNumber = that.data.pageNumber,
            phoneNumberName = val ? 'phoneNumber' : '',
            phoneNumber = val ? val : '',
            bodyData = {
                pageSize,
                pageNumber,
                [phoneNumberName]: phoneNumber
            };

        request({
            url: `/user`,
            method: 'GET',
            data: bodyData
        }).then((res) => {
            let {
                list,
                totalNumber
            } = res.data

            list.map((d) => {
                d.birthday = formatTime(d.birthday)
            })

            list = pageNumber === 1 ? list : [...userInfoList,...list]
            
            this.setData({
                userInfoList: list,
                totalNumber
            })
        })
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    // 触底加载
  onReachBottom: function () {
    let that = this,
            pageNumber = that.data.pageNumber,
            pageSize = that.data.pageSize,
            totalNumber = that.data.totalNumber;
    
    if (pageSize * pageNumber < totalNumber) {
        pageNumber = pageNumber + 1

            that.setData({
                pageNumber
            })

            that.onSearch()
        } else {
          that.setData({
            isTouchGround:true
          })
        }
  },


    onLoad() {
        this.handleUserInfo()
    },

    onShow() {
        this.handleUserInfo()
    },
    onPullDownRefresh:function() {
        wx.stopPullDownRefresh()
      },
})