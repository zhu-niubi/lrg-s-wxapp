// 获取应用实例
const app = getApp()
import {
    request
} from '../../../../utils/request'
import {
    formatTime,
    phoneCheck
} from '../../../../utils/util.js'

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
        this.setData({
            pageNumber:1
        });
        this.handleUserInfo(val)
    },

    // 点击搜索框左侧按钮
    onClickLeft:function() {
        wx.navigateBack({
            delta: 1
        })
    },

    // 跳转添加页面
  handleAddCars: function (e) {
    let item = e.currentTarget.dataset.item
    if (item) {
      wx.navigateTo({
        url: '/pages/admin/subPages/addMyCars/addMyCars?item='+ JSON.stringify(item),
      })
    } else {
      wx.navigateTo({
        url: '/pages/admin/subPages/addMyCars/addMyCars',
      })
    }
    
  },


    // 获取用户信息
    handleUserInfo: function (val) {
        let that = this,
            userInfoList = [...that.data.userInfoList],
            pageSize = that.data.pageSize,
            pageNumber = that.data.pageNumber,
            phoneNumberName = val ? 'keyword' : '',
            phoneNumber = val ? val : '',
            bodyData = {
                pageSize,
                pageNumber,
                [phoneNumberName]: phoneNumber
            };

        request({
            url: `/user_car`,
            method: 'GET',
            data: bodyData
        }).then((res) => {
            let {
                list,
                totalNumber
            } = res.data

            list.map((d) => {
                d.createdAt = formatTime(d.createdAt)
            })

            list = pageNumber === 1 ? list : [...userInfoList,...list]
            // console.log(list)
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

            that.handleUserInfo()
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