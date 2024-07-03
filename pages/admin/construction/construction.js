// 获取应用实例
const app = getApp()
import { request } from '../../../utils/request'
import { formatTime, phoneCheck } from '../../../utils/util.js'
import Dialog from '@vant/weapp/dialog/dialog'


Page({
  data: {
    windowHeight: wx.getStorageSync('windowHeight'),
    navbarHeight: wx.getStorageSync('navbarHeight'),
    pageSize: 10,
    pageNumber: 1,
    totalNumber:0,
    searchValue: '', // 手机号
    myCarInfoList: [],
    myCarValue: 0,
    proPriceOption: [
      { text: '默认排序', value: 'a' },
      { text: '施工时间升序', value: 'b' },
      { text: '施工时间降序', value: 'c' },
    ],
    proPriceValue: 'a',
    constructionList: [],
    isTouchGround: false, // 是否触底
    isPopup: false,
    isShowPro: false, //  用户选择框
    radioVal: '',  // 商品选择值
    carNumber: '', // 车牌号
    productId: null, //商品id
    productName:'',
    productList: [],
    isLoading:false,
    isShowCarOk:false,
    carOKinfo:{}
  },
  gotoNfc(event) {
    const obj = event.currentTarget.dataset.obj;
    console.log(obj)
    const data = JSON.stringify(obj)
    wx.navigateTo({
    url: '/pages/admin/NFCWarranty/NFCWarranty?obj='+data,
      });

  },
  gotoMaterial(event){
    const id = event.currentTarget.dataset.id;
    // console.log('obj',obj)
    wx.navigateTo({
    url: `/pages/admin/putMaterial/putMaterial?id=${id}`,
    });
  },
  gotoDamageAssessment(event){
    const construction = event.currentTarget.dataset.data;
    // console.log('construction',construction);
    let userId = construction.userId;
    let constructionId = construction.id;
    request({
        url: `/construction/${constructionId}`,
        method: "GET",
      }).then((res) => {
        // console.log(res);
        const constructionDetail = res.data;

        let warrantyId = constructionDetail.warrantyId;
        
        let productId = constructionDetail.constructionSku[0].productId;
        wx.navigateTo({
            url: `/pages/admin/subPages/damageAssessment/damageAssessment?userId=${userId}&warrantyId=${warrantyId}&productId=${productId}`,
        });
        
      })
    // return;

  },


//  交车确认
handleCarOkConfirm(e){
    let {id,status} = this.data.carOKinfo;
    let bodyData = {
        status:status+1
      }
      request({
        url: `/construction/${id}`,
        method: 'PUT',
        data: bodyData
      }).then((res) => { 
        wx.showToast({
          title: '确认完成',
          icon: 'success',
          duration: 2000
        })
        

        // 重新加载数据获取最新状态
        this.handleConstructionList()
    })
},


  // 根据商品名搜索商品
  onSearchUserCar(e) {
    let that = this,
      value = e.detail ? e.detail : '',
      name = value ? 'name' : '';
    let badyData = {
      [name]: value,
      pageSize: 1000,
      pageNumber:1
    }
    // 获取
    request({
      url: `/product`,
      method: 'GET',
      data: badyData
    }).then((res) => { 
      let { list } = res.data

      let newList = []
      list.map((lis) => {
        if (lis.type == 1) {
          newList.push(lis)
        }
      })

      that.setData({
        productList:newList
      })
    })
  },

  // 商品ID 输入框聚焦时
  productFocus(e) {
    this.setData({
      isShowPro:true
    })
  },

  // 跳转施工单详情
  handleDetail:function(e) {
    let id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/admin/subPages/constructionDetail/constructionDetail?id='+ id,
    })
  },

    // 删除施工单信息
    handleDeleteBuild: function (e) {
      let that = this
      let id = e.currentTarget.dataset.id
      wx.showModal({
        title: '提示',
        content: '此操作不可回退，请谨慎操作！',
        success (res) {
          if (res.confirm) {
            request({
              url: `/construction/${id}`,
              method: 'DELETE'
            }).then((res) => {
              wx.showToast({
                title: '删除成功',
                icon: 'success',
                duration: 1000
              })
              that.handleConstructionList()
            })
          }
        }
      })
      
    },

  // 创建施工单
  handleAddConstructions: function (e) {
    let id = e.currentTarget.dataset.id;

    if (id) {
      wx.navigateTo({
        url: '/pages/admin/subPages/addConstructions/addConstructions?id='+ id,
      })
    } else {
      wx.navigateTo({
        url: '/pages/admin/subPages/addConstructions/addConstructions',
      })
    }
  },

    // 获取车辆信息
    handleCarInfo: function () {
      let bodyData = {
        pageSize: this.data.pageSize,
        pageNumber: this.data.pageNumber,
      }
      
      request({
        url: `/user_car`,
        method: 'GET',
        data:bodyData
      }).then((res) => {
        let { data } = res
        
        data.map((d) => {
          d.text = d.carBrand + ' ' + d.carName 
          d.value = d.id
        })

        data = [{ text: '车库信息', value: 0 }, ...data]
        
        this.setData({
          myCarInfoList: data
        })
      })
  },
    
    // 确认施工单
  constructionStartOk(e) {
    let that = this,
      id = e.currentTarget.dataset.id,
      status = e.currentTarget.dataset.status;

      this.setData({
          carOKinfo:{
              id,
              status
          }
      })
    
    // return
    if (status === 3 || status === 4) {
      // 开始施工
      wx.navigateTo({
        url: '/pages/admin/subPages/constructionStart/constructionStart?id='+ id,
      })
    } else if (status === 5) {
        this.setData({
            isShowCarOk:true
        })
    } else {
      // 检测确认
      Dialog.confirm({
        title: '操作提示',
        message: '请谨慎操作施工进程，是否确认？',
      })
        .then(() => {
          // on confirm
          let bodyData = {
            status:status+1
          }
          request({
            url: `/construction/${id}`,
            method: 'PUT',
            data: bodyData
          }).then((res) => { 

            wx.showToast({
              title: '确认完成',
              icon: 'success',
              duration: 2000
            })

            // 重新加载数据获取最新状态
            that.handleConstructionList()
          })
        })
        .catch(() => {
          // on cancel
        })
    }
  },


    // 按手机号搜索
    onSearch(e) {
      let value = e.detail
  
      this.setData({
        searchValue:value,
        pageNumber:1
      })

      this.handleConstructionList()
  },
    
  // 点击筛选时，弹出
  onFilterClick() {

    this.setData({
      isPopup: true
    })
    
    },
  
  // 关闭popup
  onPopupClose() {
      this.setData({
          isPopup: false
      })
  },
      
          // 筛选变化的值
  onFilterChange(e) {
    let value = e.currentTarget.dataset.value

    this.setData({
        [value]: e.detail,
    });
  },

  onSubmit() {
    this.handleConstructionList()
    this.setData({
      isPopup:false
    })
  },

  handleRadioConfirm(e) {
    let that = this,
      radioVal = that.data.radioVal;
      that.setData({
        productId:radioVal
    })
    
  },

   // 选择用户车辆
   onRadioChange(e) {
    this.setData({
      radioVal:e.detail
    })
  },
  onRadioClick(e) {
    const { id,name } = e.currentTarget.dataset

    this.setData({
      radioVal: id,
      productName:name
    })
  },

  onReset: function (e) {
    this.setData({
      productId: null,
      productName: '',
      carNumber: ''
    })
  },

  // 获取全部施工单
  handleConstructionList: function () {
    let that = this,
    constructionList = [...that.data.constructionList],
      pageSize = that.data.pageSize,
      pageNumber = that.data.pageNumber,
      phoneNumber = that.data.searchValue ? that.data.searchValue : '',
      phoneNumberName = phoneNumber ? 'phoneNumber' : '',
      productId = that.data.productId ? that.data.productId : '',
      productName = productId ? 'productId' : '',
      carNumber = that.data.carNumber ? that.data.carNumber : '',
      carNumberName = carNumber ? 'carNumber' : '',
      isLoading = that.data.isLoading;

    let bodyData = {
      pageSize,
      pageNumber,
      [phoneNumberName]: phoneNumber,
      [productName]: productId,
      [carNumberName]:carNumber
    }

    // console.log(bodyData)
    // return
    // 获取信息
    request({
      url: `/construction`,
      method: 'GET',
      data: bodyData
    }).then((res) => {
      let { list,totalNumber } = res.data


      list.map((lis) => {
        lis.status === 1 ? lis.statusName = '客户确认' : lis.status === 2 ? lis.statusName = '检测确认' : lis.status === 3 ? lis.statusName = '开始施工' : lis.status === 4 ? lis.statusName = '施工完成' : lis.status === 5 ? lis.statusName = '提车确认' :lis.status === 6 ? lis.statusName = '门店确认' : ''

        lis.expectComplete = formatTime(lis.expectComplete)

        // 施工产品
        lis.productName = lis.productName.toString()
      })

      if (isLoading) {
        setTimeout(() => {
          wx.stopPullDownRefresh()
          that.setData({
            isLoading:false
           })
         },1000)
      }

      list = pageNumber === 1 ? list : [...constructionList,...list]
    //   console.log('施工单列表',list)
      that.setData({
        constructionList: list,
        totalNumber
      })
    })
  },

    // 点击搜索框左侧按钮
  onClickLeft:function() {
      wx.navigateBack({
        delta: 1
      })
  },
    

    // 跳转商品详情页
    gotoBuy(e) {

      let productId = e.currentTarget.dataset.productid;
      wx.navigateTo({
        url: '/pages/admin/productDetail/productDetail?productId='+ productId,
      })
  },
    
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

            that.handleConstructionList()
        } else {
          that.setData({
            isTouchGround:true
          })
        }
  },



  onLoad(options) {
    // 施工单
    this.handleConstructionList()

  },

  onShow() {
    this.handleConstructionList()
  },
  onPullDownRefresh: function () {
    this.setData({
      isLoading:true
    })
    // 施工单
    this.handleConstructionList()
  },
})
