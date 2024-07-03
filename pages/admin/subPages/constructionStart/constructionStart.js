// 获取应用实例
const app = getApp()
import { request } from '../../../../utils/request'
import { formatTime, phoneCheck } from '../../../../utils/util.js'
import Dialog from '@vant/weapp/dialog/dialog'

Page({
  data: {
    windowHeight: wx.getStorageSync('windowHeight'),
    navbarHeight: wx.getStorageSync('navbarHeight'),
    constructionId: null, // 修改时接受的需要修改的ID
    constructionInfo: {},
    isShowEmployee: false,
    phoneNumberVal: '',
    employeeList: [],
    radioVal: null,
    radioValName: '',
    selectIndex: null,
    activeIndex: null,
    isShowRoll:false,
    productId:null,
    RollData:{}
  },

      // 输入消耗米数
      handleInputLength: function (e) {
        let {
            selectionindex,
            activeindex
        } = e.currentTarget.dataset, constructionInfo = this.data.constructionInfo;
        constructionInfo.newconstructionSku[activeindex].productPosition[selectionindex].length = e.detail.value;

        this.setData({
            constructionInfo
        })
    },

      // 选择膜卷
      onRollClick(e) {
        const RollData = e.currentTarget.dataset;

        let selectIndex = this.data.selectIndex,
            activeIndex = this.data.activeIndex,
            constructionInfo = this.data.constructionInfo;

        constructionInfo.newconstructionSku[activeIndex].productPosition[selectIndex].roll = {
            ...RollData
        }


        this.setData({
            RollData: {
                ...RollData
            },
            constructionInfo
        })
    },
      // 搜索膜卷号
      onSearchRoll(e) {
        let that = this,
            value = e?.detail ? e.detail : '',
            keyword = value ? 'rollNumber' : '',
            constructionInfo = that.data.constructionInfo;

        this.setData({
            phoneNumberVal: value
        })

        if (constructionInfo.newconstructionSku.length > 0) {
            constructionInfo.newconstructionSku.map((a, index) => {
                let productId = a.productId ? 'productId' : ''
                a.rollList = a.rollList || []

                let bodyData = {
                    [keyword]: value,
                    [productId]:a.productId||undefined,
                    pageSize: 1000,
                    pageNumber: 1
                }

                // 获取信息
                request({
                    url: `/roll`,
                    method: 'GET',
                    data: bodyData
                }).then((res) => {
                    let {
                        list
                    } = res.data

                    a.rollList = list


                    that.setData({
                        constructionInfo
                    })


                })

            })
        }

    },

      // 弹出膜卷号
      handleRollDialog: function (e) {
        let {
            selectionindex,
            activeindex,
            productid
        } = e.currentTarget.dataset;


        this.setData({
            isShowRoll: true,
            selectIndex: selectionindex,
            activeIndex: activeindex,
            productId: productid,
        })

    },


  // 搜索值
  onSearchEmployee(e) {
    let that = this,
        value = e.detail ? e.detail : '',
        keyword = value ? Number(value) ? 'phoneNumber' : 'name' : '';

        this.setData({
            phoneNumberVal: value
        })
        let badyData = {
            [keyword]: value,
            pageSize: 1000,
            pageNumber: 1
        }
        // 获取
        request({
            url: `/employee`,
            method: 'GET',
            data: badyData
        }).then((res) => {
            let {
                list
            } = res.data
            that.setData({
                employeeList: list
            })
        })
  },

  // 点击确认的值
  handleRadioConfirm(e) {
    let that = this,
        radioVal = that.data.radioVal;


        that.setData({
            userCarId: radioVal
        })
    
  },

  // 选择相应的技师信息
  
  onRadioChange(e) {
    this.setData({
      radioVal:e.detail
    })
  },
  onRadioClick(e) {
    const {
        id,
        name
    } = e.currentTarget.dataset


    this.setData({
      radioVal: id,
      radioValName: name,
    })
  },
    // 选择技师
    onEmployeeChange(e) {
        let selectIndex = this.data.selectIndex,
            activeIndex = this.data.activeIndex,
            constructionInfo = this.data.constructionInfo,
            employeeData = {
                id: e.detail,
                name: e.currentTarget.dataset.name
            };

            constructionInfo.newconstructionSku[activeIndex].productPosition[selectIndex].employee = employeeData

        this.setData({
            constructionInfo,
            employeeData,
        })
    },
    onEmployeeClick(e) {
        const employeeData = e.currentTarget.dataset;

        let selectIndex = this.data.selectIndex,
            activeIndex = this.data.activeIndex,
            constructionInfo = this.data.constructionInfo;


            constructionInfo.newconstructionSku[activeIndex].productPosition[selectIndex].employee = employeeData

        this.setData({
            employeeData,
            constructionInfo
        })
    },


  // 技师弹框
  handleEmployeeDialog: function (e) {
    const { selectionindex,
        activeindex } = e.currentTarget.dataset;

    this.setData({
      isShowEmployee: true,
      selectIndex: selectionindex || 0,
       activeIndex: activeindex || 0,
    })
    
 },

  // 获取需要施工的数据
  handleConstruction() {
    let that = this,
      constructionId = that.data.constructionId;
    request({
      url: `/construction/${constructionId}`,
      method: 'GET'
    }).then((res) => { 
      let { data } = res

      // 施工部位
      let constructionSku = [...data.constructionSku];

      let keyInx = {};
      for (var i = 0; i < constructionSku.length; i++) {
        var id = constructionSku[i].productId;
        constructionSku[i].productPosition = [
            {
                id: constructionSku[i].id,
                name: constructionSku[i].productSkuName,
                productSkuId: constructionSku[i].productSkuId,
                roll: {
                    id: constructionSku[i].rollId || undefined,
                    name: constructionSku[i].rollNumber || undefined,
                },
                employee: {
                    id: constructionSku[i].employeeId || undefined,
                    name: constructionSku[i].employeeName || undefined,
                },
                length: constructionSku[i].length,
            }
        ]
        
        if (keyInx[id] >= 0) {
          var product1 = constructionSku[i].productPosition;
          var product2 = constructionSku[keyInx[id]].productPosition;
          constructionSku[keyInx[id]].productPosition = product1.concat(product2);
          constructionSku.splice(i, 1);
          i--;
        } else {
          keyInx[id] = i;
        }
      }

      data.newconstructionSku = constructionSku

      that.setData({
        constructionInfo: data,
      })

      //   获取膜卷
      that.onSearchRoll()


    })
    
  },


  // 提交数据处理
  submit: function () {
    let constructionInfo = this.data.constructionInfo;

    let list = [], constructionSku = [];

    constructionInfo.newconstructionSku.map((n) => {
      list.push(...n.productPosition)
    })
    let isComplete = true,
    message = [];

    list.map((c) => {
      let positionObj = {};

      positionObj.id = c.id
      positionObj.productSkuId = c.productSkuId
      positionObj.employeeId = c.employee?.id || undefined
      positionObj.rollId = c.roll?.id || undefined
      positionObj.length = Number(c.length) || undefined

      if (!c.id || !c.productSkuId || !c.employee.id || !c.roll.id || !c.length) {

        isComplete = false
        message.push(c.name)

      }
      constructionSku.push(positionObj)

      
    })


    // 调用开始施工接口
    if (constructionInfo.status === 4 && !isComplete) {
        wx.showModal({
            title: '错误提示',
            content: message.toString()+'：技师/膜卷号/米数不能为空！',
            showCancel: false,
        })
    }else{

        Dialog.confirm({
            title: '操作提示',
            message: '请谨慎操作施工进程，是否确认？',
          })
            .then(() => {
                this.handleConstructionStrat(constructionSku)
            })
            .catch(() => {
              // on cancel
            })
    }
  },

  // 开始施工
  handleConstructionStrat(val) {
    let constructionId = this.data.constructionId,constructionInfo=this.data.constructionInfo;
    let bodyData = {
        constructionSku:val,
        status:constructionInfo.status + 1
    }
    // console.log(bodyData)
    // return
    request({
      url: `/construction/${constructionId}`,
      method: 'PUT',
      data: bodyData
    }).then((res) => {

      if (res.code !== 0) {
        wx.showToast({
          title: '提交失败',
          icon: 'error',
          duration: 1000
        })
      } else {
        wx.showToast({
          title: '提交成功',
          icon: 'success',
          duration: 1000
        })
  
        setTimeout(() => {
          wx.navigateBack({
            delta: 1
          })
        }, 1000)
      }
      
    })
  },

  onLoad(options) {
    let constructionId = options.id ? JSON.parse(options.id) : null

    if (constructionId) {

      this.setData({
        constructionId
      })

      // 获取需要修改的施工单数据
      this.handleConstruction()

    }

  },

  onShow() { },
  onPullDownRefresh:function() {
    wx.stopPullDownRefresh()
  },
})
