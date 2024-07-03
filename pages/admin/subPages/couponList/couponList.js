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
        couponInfoList: [],
        windowHeight: wx.getStorageSync('windowHeight'),
        navbarHeight: wx.getStorageSync('navbarHeight'),
        pageNumber: 1,
        pageSize: 10,
        totalNumber: 0,
        searchValue: '', // 手机号的值
        codeValue: '', // 卡券编码的值
        userIdValue: '', // 用户ID的值
        dropdownOption: [], // 卡券模板信息
        dropdownValue: '', // 卡券模板值
        isPopup: false, // 是否打开筛选
        useStatusValue: '', // 使用状态的值
        useStatusList: [{
                text: '使用状态',
                value: ''
            },
            {
                text: '未使用',
                value: 1
            },
            {
                text: '已使用',
                value: 2
            },
            {
                text: '已过期',
                value: 3
            },
        ],
        isTouchGround:false, // 是否触底
    },

    // 筛选变化的值
    onFilterChange(e) {
        let value = e.currentTarget.dataset.value

        this.setData({
            [value]: e.detail,
        });
    },

    // 点击搜索框左侧按钮
    onClickLeft:function() {
        wx.navigateBack({
            delta: 1
        })
    },

    // 获取卡券模板
    handledropdownOption() {
        let bodyData = {
            pageSize: 1000,
            pageNumber: 1
        }
        request({
            url: `/coupon_template`,
            method: 'GET',
            data: bodyData
        }).then((res) => {
            let {
                list,
                totalNumber
            } = res.data

            list.map((d) => {
                d.text = d.name
                d.value = d.id
            })

            let newList = [{
                text: '卡券模板',
                value: ''
            }, ...list]


            this.setData({
                dropdownOption: newList,
                totalNumber
            })
        })
    },

    // 提交筛选信息事
    onSubmit: function (e) {
        let that = this,
            codeValue = that.data.codeValue ? that.data.codeValue.replace(/\s*/g, "") : '',
            userIdValue = that.data.userIdValue ? that.data.userIdValue.replace(/\s*/g, "") : '',
            dropdownValue = that.data.dropdownValue,
            useStatusValue = that.data.useStatusValue,
            code = codeValue ? 'code' : '',
            userId = userIdValue ? 'userId' : '',
            couponTemplateId = dropdownValue ? 'couponTemplateId' : '',
            status = useStatusValue ? 'status' : '';

        let data = {
            [code]: codeValue ? codeValue : '',
            [userId]: userIdValue ? userIdValue : '',
            [couponTemplateId]: dropdownValue ? dropdownValue : '',
            [status]: useStatusValue ? useStatusValue : '',
        }


        that.handleCouponInfo(data)

        that.setData({
            isPopup: false,pageNumber:1
        })
    },

    // 重置筛选
    onReset: function (e) {
        this.setData({
            codeValue: '',
            dropdownValue: '',
            useStatusValue: '',
            userIdValue: ''
        })
    },



    // 点击展开卡片内容
    handleIsExpand: function (e) {
        let that = this,
            index = e.currentTarget.dataset.index,
            couponInfoList = that.data.couponInfoList;
        
        couponInfoList[index].isExpand = !couponInfoList[index].isExpand

        that.setData({
            couponInfoList
        })
    },


    // 用户手机号输入的值变化时
    onChange(e) {
        let value = e.currentTarget.dataset.value
        let name = e.detail ? e.currentTarget.dataset.name : ''

        this.setData({
            [value]: e.detail,
        });

        let data = {
            [name]: e.detail,
            pageNumber:1
        }
        this.handleCouponInfo(data)


    },
    // onSearch(e) {
    //   let val = this.data.searchValue
    //   let name = val ? e.currentTarget.dataset.name : ''

    //   let data = {
    //     [name] :val
    //   }
    //   this.handleCouponInfo(data)
    // },

    // 点击筛选时，弹出
    onClick() {

        let that = this,
            codeValue = that.data.codeValue.replace(/\s*/g, ""),
            userIdValue = that.data.userIdValue ? that.data.userIdValue.replace(/\s*/g, "") : '',
            dropdownValue = that.data.dropdownValue,
            useStatusValue = that.data.useStatusValue,
            code = codeValue ? 'code' : '',
            userId = userIdValue ? 'userId' : '',
            couponTemplateId = dropdownValue ? 'couponTemplateId' : '',
            status = useStatusValue ? 'status' : '';

        let data = {
            [code]: codeValue ? codeValue : '',
            [userId]: userIdValue ? userIdValue : '',
            [couponTemplateId]: dropdownValue ? dropdownValue : '',
            [status]: useStatusValue ? useStatusValue : '',
        }

        this.handleCouponInfo(data)

        this.setData({
            isPopup: true,pageNumber:1
        })
        this.handledropdownOption()
    },

    // 关闭popup
    onPopupClose() {
        this.setData({
            isPopup: false
        })
    },

    // 获取卡券信息
    handleCouponInfo: function (val) {
        let that = this,
        couponInfoList = [...that.data.couponInfoList],
            pageSize = that.data.pageSize,
            pageNumber = that.data.pageNumber;

        let bodyData = {
            pageSize,
            pageNumber,
            ...val
        }

        // console.log(bodyData)
        // return
        request({
            url: `/coupon`,
            method: 'GET',
            data: bodyData
        }).then((res) => {
            let {
                list,
                totalNumber
            } = res.data

            list.map((d) => {
                d.createdAt = formatTime(d.createdAt)
                d.deadline = formatTime(d.deadline)
                d.isExpand = false
            })

           list = pageNumber ===1 ?list:[...couponInfoList,...list]
            this.setData({
                couponInfoList: list,
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
            that.onSubmit()
        } else {
          that.setData({
            isTouchGround:true
          })
        }
  },


    onLoad(options) {
        let that = this,
            userId = options.userId;

        that.setData({
            userIdValue: userId
        })
        if (userId) {
            let data = {
                userId
            }
            that.handleCouponInfo(data)
        } else {
            that.handleCouponInfo()
        }


    },

    onShow() {

    },
    onPullDownRefresh:function() {
        wx.stopPullDownRefresh()
      },
})