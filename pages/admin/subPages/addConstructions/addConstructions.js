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
        userid:undefined,
        isShowUserCar: false,
        isShowEmployee: false,
        isShowRoll: false,
        phoneNumberVal: '',
        userCarList: [],
        employeeList: [], //技师数据
        selectIndex: null, //暂存部位员工
        activeIndex: null, //暂存产品下标
        employeeData: {},
        RollData: {},
        productId: null, // 选择对应产品的膜卷号的商品id
        radioVal: '',
        userCarName: '',
        isShowProductPopup: false,
        productTypeList: [],
        productsList: [],
        productTypeIndex: 0,
        ProductTypeId: null,
        productModelId: null,
        productModelIndex: 0,
        activeId: [], // 产品id
        activeName: [],
        activeList: [],
        checkedAll:false, //全选
        defectPartList: [
            {
                name: '引擎盖',
                id: 1
            },
            {
                name: '前保险杠',
                id: 2
            },
            {
                name: '后保险杠',
                id: 3
            },
            {
                name: '车顶',
                id: 4
            },
            {
                name: '后翼',
                id: 5
            },
            {
                name: '后盖箱',
                id: 6
            },
            {
                name: '左前翼子板',
                id: 7
            },
            {
                name: '右前翼子板',
                id: 8
            },
            {
                name: '左后翼子板',
                id: 9
            },
            {
                name: '右后翼子板',
                id: 10
            },
            {
                name: '左后视镜',
                id: 11
            },
            {
                name: '右后视镜',
                id: 12
            },
            {
                name: '前左侧门',
                id: 13
            },
            {
                name: '后左侧门',
                id: 14
            },
            {
                name: '右前门',
                id: 15
            },
            {
                name: '右后门',
                id: 16
            },
            {
                name: '仪表号',
                id: 17
            },
            {
                name: '车灯',
                id: 18
            },
            {
                name: '座椅',
                id: 19
            },
            {
                name: '车窗',
                id: 20
            },
            {
                name: '轮眉',
                id: 21
            },
            {
                name: '左下边梁',
                id: 22
            },
            {
                name: '右下边梁',
                id: 23
            },
            {
                name: '轮胎',
                id: 24
            },
        ], // 缺陷部位的数据
        defectPart: [], // 缺陷部位的值
        defectTypeList: [{
                name: '划痕',
                id: 1
            },
            {
                name: '凹凸',
                id: 2
            },
            {
                name: '脱漆',
                id: 3
            },
            {
                name: '破损',
                id: 4
            },
            {
                name: '补漆',
                id: 5
            },
        ], // 缺陷原因数据
        defectType: [], // 缺陷原因得值
        defectImages: [], // 缺陷图片
        isShowTimePopup: false, // 预计完成时间
        minDate: new Date().getTime(),
        formatter(type, value) {
            if (type === 'year') {
                return `${value}年`;
            }
            if (type === 'month') {
                return `${value}月`;
            }
            return value;
        },
        expectComplete: '',
        memo: '', // 备注
        kilometer: '',
        windowHeight: wx.getStorageSync('windowHeight'),
        navbarHeight: wx.getStorageSync('navbarHeight'),
        constructionId: null, // 修改时接受的需要修改的ID
        constructionInfo: {},
        checkedDefectPart:false, // 是否全选
    },
    // 全选
    oncheckAllChange(e){
        let index = e.currentTarget.dataset.index,
        activeList = this.data.activeList;

        activeList[index].checkedAll = e.detail

        if (activeList[index].checkedAll === true) {
            activeList[index].selection = [{id:0,name:'全选'}]
        }else{
            if (activeList[index].constructionPart && activeList[index].constructionPart.length) {
                let selectionList = []
                activeList[index].selection = activeList[index].constructionPart.map((part)=>{
                    let result = activeList[index].constructionPartList.find((f)=>{
                        return f.id  === Number(part)
                    })
                    selectionList.push(result)
                })
                activeList[index].selection = selectionList
            } else {
                activeList[index].selection = []
            }
            
        }

        this.setData({
            activeList
        })

    },
    // 根据产品类型获得商品，在判断商品属于哪个类型，之后根据类型渲染部位
    handleTypeProduct() {
        let that = this,
            activeList = that.data.activeList,
            constructionId = that.data.constructionId;

        // console.log(activeList)
        if (activeList.length > 0) {
            activeList.map((a, index) => {

                a.constructionPart = a.constructionPart || []

                let productId = a.value?.split('-')[2];

                let bodyData = {
                    pageSize: 1000,
                    pageNumber: 1,
                }

                // 获取信息
                request({
                    url: `/product/${productId}`,
                    method: 'GET',
                    data: bodyData
                }).then((res) => {
                    let {
                        productSku
                    } = res.data

                    if (constructionId) {
                        productSku = [...productSku]
                    } else {
                        productSku = [...productSku]
                    }

                    a.constructionPartList = productSku

                    // if (a.constructionPart.length == a.constructionPartList.length - 1) {
                    //     a.constructionPart = ['0']
                    // }

                    // console.log(activeList)


                    that.setData({
                        activeList
                    })


                })

            })
        }

    },


    // 点击时间确认时
    handleTimeOk(e) {
        let value = e.detail,
            expectCompleteShowData = this.data.expectCompleteShowData;

        expectCompleteShowData = formatTime(value / 1000)

        this.setData({
            expectComplete: value,
            expectCompleteShowData,
            isShowTimePopup: false
        })
    },

    // 点击弹出选择完成时间
    handleTimePopup() {
        this.setData({
            isShowTimePopup: true
        })
    },

    // 缺陷图片删除
    delDefectImages(e) {
        let index = e.detail.index,
            defectImages = this.data.defectImages;


        defectImages.splice(index, 1)

        this.setData({
            defectImages
        })
    },

    // 缺陷图片上传
    afterReadImage(e) {
        let that = this;
        const {
            file
        } = e.detail;
        const storeToken = wx.getStorageSync('storeToken')

        file.map((f) => {
            wx.uploadFile({
                url: `${app.globalData.hostUri}/upload`,
                filePath: f.url,
                name: 'file',
                formData: {
                    'file': f
                },
                header: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${storeToken}`
                },
                success(res) {
                    let {
                        data
                    } = JSON.parse(res.data)
                    const {
                        defectImages = []
                    } = that.data;
                    defectImages.push({
                        url: data.url
                    });
                    that.setData({
                        defectImages
                    });
                },
            });
        })


    },

    // 选择缺陷原因
    onChangeDefectType(e) {
        let defectType = e.detail
        this.setData({
            defectType
        })
    },
    oncheckPartChange(e){
        let checkedDefectPart = e.detail,
        defectPartList = this.data.defectPartList,
        defectPart = this.data.defectPart;

        if (checkedDefectPart) {
            defectPart = defectPartList.map((d)=>{
                return d.id.toString()
            })
        }else{
            defectPart = []
        }

        this.setData({
            checkedDefectPart,
            defectPart
        })
    },
    // 选择缺陷部位
    onChangeDefectPart(e) {
        let defectPart = e.detail,
        defectPartList = this.data.defectPartList,
        checkedDefectPart = this.data.checkedDefectPart;

        if (defectPart.length !== defectPartList.length) {
            checkedDefectPart = false
        }else{
            checkedDefectPart = true
        }
        
        this.setData({
            defectPart,
            checkedDefectPart
        })
    },

    // 选择施工部位
    onChangeConstructionPart(e) {

        let value = [...e.detail].map((d) => {
                return d
            }),
            activeList = [...this.data.activeList],
            index = e.currentTarget.dataset.index;


        let constructionSku = activeList

        for (let i = 0; i < constructionSku.length; i++) {
            let ai = constructionSku[i];
            if (i === index) {
                ai.constructionPart = value
            }

            if (!ai.checkedAll || ai.checkedAll === false) {
                //   添加技师，膜卷号，消耗米数
                let selectionList = [];

                ai.selection = ai.selection ? [...ai.selection] : []

                ai.constructionPart.map((p) => {
                    ai.constructionPartList.map((pl) => {
                        if (Number(p) === pl.id) {
                            selectionList.push(pl)
                        }
                    })
                })
                ai.selection = [...selectionList]


                // console.log(ai.selection)

            }
        }

        

        this.setData({
            activeList
        })
    },

    // 点击产品
    onClickProductItem({
        detail = {}
    }) {
        const {
            activeId,
            activeName
        } = this.data;

        const index = activeId.indexOf(detail.id);
        if (index > -1) {
            activeId.splice(index, 1);
            activeName.splice(index, 1);
        } else {
            activeId.push(detail.id);
            activeName.push(detail.text);
        }

        let activeList = []
        activeId.map((a, index) => {
            let obj = {}
            obj.value = a
            obj.name = activeName[index]

            activeList.push(obj)
        })

        // console.log(activeList)

        this.setData({
            activeId,
            activeName,
            activeList
        });

    },


    // 点击产品类型
    onClickProType({
        detail = {}
    }) {
        let index = detail.index
        this.setData({
            productTypeIndex: index || 0,
            productModelIndex: 0,
            productModelId: null
        });

        let productTypeList = this.data.productTypeList
        productTypeList.map((pro, idx) => {
            if (index === idx) {
                this.setData({
                    productTypeId: pro.id
                })
            }
        })

        // 重新获取系列数据
        this.handleProductModelList()

    },

    // 点击产品系列时
    onClickProModel({
        detail = {}
    }) {
        let index = detail.index
        this.setData({
            productModelIndex: index || 0
        });

        let productsList = this.data.productsList

        productsList.map((pro, idx) => {
            if (index === idx) {
                this.setData({
                    productModelId: pro.id
                })
            }
        })

        // 重新获取根据产品系列获取的产品数据
        this.handleProductList()

    },

    // 获取产品系列
    handleProductModelList() {
        let that = this,
            productTypeId = that.data.productTypeId,
            productModelId = that.data.productModelId;


        let bodyData = {
            pageSize: 10000,
            pageNumber: 1,
            productTypeId
        }

        // 获取信息
        request({
            url: `/product_model`,
            method: 'GET',
            data: bodyData
        }).then((res) => {
            let {
                list
            } = res.data

            list.map((lis) => {
                lis.text = lis.name
                lis.codeId = lis.id
                lis.id = productTypeId + '-' + lis.id
            })

            productModelId = productModelId ? productModelId : list.length > 0 ? list[0].id : null


            that.setData({
                productsList: list,
                productModelId
            })


            //获取产品
            if (productModelId) {
                that.handleProductList()
            }

        })
    },

    // 获取产品数据
    handleProductList() {
        let that = this,
            productModelId = that.data.productModelId,
            productsList = that.data.productsList;


        let bodyData = {
            pageSize: 10000,
            pageNumber: 1,
            productModelId: productModelId.split('-')[1]
        }

        // 获取信息
        request({
            url: `/product`,
            method: 'GET',
            data: bodyData
        }).then((res) => {
            let {
                list
            } = res.data

            if (list && list.length) {
                list.map((lis) => {
                    lis.text = lis.name
                    lis.codeId = lis.id
                    lis.id = productModelId + '-' + lis.id
                })

                productsList[that.data.productModelIndex].children = list
            } else {
                productsList[that.data.productModelIndex].children = [{
                    codeId:0,text:'未添加对应部位！',disabled: true
                }]
            }

            that.setData({
                productsList,
            })
        })



    },


    // 获取产品类型信息
    getProductsTypeList() {
        let that = this,
            // constructionInfo = that.data.constructionInfo,
            productTypeId = that.data.productTypeId;
        let bodyData = {
            pageSize: 10000,
            pageNumber: 1
        }
        // 获取信息
        request({
            url: `/product_type`,
            method: 'GET',
            data: bodyData
        }).then((res) => {
            let {
                list
            } = res.data


            list.map((lis, index) => {
                lis.text = lis.name
            })

            // 产品类型id
            productTypeId = productTypeId ? productTypeId : list.length > 0 ? list[0].id : null


            that.setData({
                productTypeList: list,
                productTypeId,
            })

            // 获取产品系列以及产品数据
            that.handleProductModelList()

        })
    },

    // 点击施工产品时弹出产品类型
    showProductPopup(e) {
        this.setData({
            isShowProductPopup: true
        })

        this.getProductsTypeList()
    },

    onCloseProductTime() {
        this.setData({
            isShowTimePopup: false
        })
    },


    // 关闭产品选择弹出层
    onCloseProduct() {

        // 根据产品类型获得商品，在判断商品属于哪个类型，之后根据类型渲染部位
        this.handleTypeProduct()

        // 根据产品id获取对应膜卷
        this.onSearchRoll()

        this.setData({
            isShowProductPopup: false
        })

    },


    // 确认用户汽车弹出选出的值
    handleRadioConfirm(e) {
        let that = this,
            radioVal = that.data.radioVal;
        that.setData({
            userCarId: radioVal
        })

    },
    // 输入消耗米数
    handleInputLength: function (e) {
        let {
            selectionindex,
            activeindex
        } = e.currentTarget.dataset, activeList = this.data.activeList;
        activeList[activeindex].selection[selectionindex].length = e.detail.value;

        this.setData({
            activeList
        })
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
            productId: Number(productid.split('-')[2]),
        })

    },

    // 选择膜卷
    onRollClick(e) {
        const RollData = e.currentTarget.dataset;

        let selectIndex = this.data.selectIndex,
            activeIndex = this.data.activeIndex,
            activeList = this.data.activeList;

        activeList[activeIndex].selection[selectIndex].roll = {
            ...RollData
        }


        this.setData({
            RollData: {
                ...RollData
            },
            activeList
        })
    },


    // 弹出用户技师选择
    handleEmployeeDialog: function (e) {
        let {
            selectionindex,
            activeindex
        } = e.currentTarget.dataset, activeList = this.data.activeList, employeeData = {};
        if (activeList[activeindex].selection[selectionindex].employee?.id) {
            employeeData = activeList[activeindex].selection[selectionindex].employee
        } else {
            employeeData = {}
        }

        console.log(selectionindex,activeindex,employeeData);

        this.setData({
            isShowEmployee: true,
            selectIndex: selectionindex || 0,
            activeIndex: activeindex || 0,
            employeeData
        })
    },

    // 选择技师
    onEmployeeChange(e) {
        let selectIndex = this.data.selectIndex,
            activeIndex = this.data.activeIndex,
            activeList = this.data.activeList,
            employeeData = {
                id: e.detail,
                name: e.currentTarget.dataset.name
            };
        console.log(e)   
        console.log(employeeData);

        activeList[activeIndex].selection[selectIndex].employee = employeeData

        this.setData({
            activeList,
            employeeData,
        })
    },
    onEmployeeClick(e) {
        const employeeData = e.currentTarget.dataset;

        let selectIndex = this.data.selectIndex,
            activeIndex = this.data.activeIndex,
            activeList = this.data.activeList;

        activeList[activeIndex].selection[selectIndex].employee = employeeData

        this.setData({
            employeeData,
            activeList
        })
    },
    // 选择用户车辆
    onRadioChange(e) {
        this.setData({
            radioVal: e.detail
        })
    },
    onRadioClick(e) {
        console.log(e);
        const {
            id,
            name,
            userid
        } = e.currentTarget.dataset

        this.setData({
            radioVal: id,
            userCarName: name,
            userid
        });
    },



    // 根据手机号搜索用户汽车
    onSearchUserCar(e) {
        let that = this,
            value = e.detail ? e.detail : '',
            keyword = value ? 'keyword' : '';
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
            url: `/user_car`,
            method: 'GET',
            data: badyData
        }).then((res) => {
            let {
                list
            } = res.data
            that.setData({
                userCarList: list
            });
        })
    },

    // 搜索膜卷号
    onSearchRoll(e) {
        let that = this,
            productId = that.data.productId,
            value = e?.detail ? e.detail : '',
            keyword = value ? 'rollNumber' : '',
            activeList = that.data.activeList;

        this.setData({
            phoneNumberVal: value
        })

        if (activeList.length > 0) {
            activeList.map((a, index) => {

                a.rollList = a.rollList || []
                let productId = a.value?.split('-')[2]
                let productName = productId ? 'productId' : ''

                let bodyData = {
                    [keyword]: value,
                    [productName]: productId,
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

                    // console.log(activeList)

                    that.setData({
                        activeList
                    })


                })

            })
        }

    },

    // 根据手机号搜索技师
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
            //   console.log(list)
            that.setData({
                employeeList: list
            })
        })
    },


    //  弹出用户车库选择
    handleUserCarDialog: function () {
        this.setData({
            isShowUserCar: true
        })
    },



    // 提交信息
    formSubmit: function (e) {
        // console.log(e);
        // return
        let that = this,
            constructionInfo = that.data.constructionInfo,
            constructionId = that.data.constructionId,
            data = e.detail.value,
            bodyData = {},
            radioVal = that.data.radioVal,
            activeList = that.data.activeList,
            defectPart = that.data.defectPart,
            defectType = that.data.defectType.map(Number),
            defectImages = that.data.defectImages,
            expectComplete = that.data.expectComplete;
        
        bodyData.userId = that.data.userid;

        // 门店
        bodyData.storeId = constructionId ? undefined :0
        // 订单
        bodyData.orderNumber = ''

        // 用户车辆id
        bodyData.userCarId = radioVal ? radioVal : constructionInfo.userCarId
        // 公里数
        bodyData.kilometer = data.kilometer ? Number(data.kilometer) : ''

        // 施工部位
        bodyData.constructionSku = []
        activeList.map((a) => {
            let newList = []

            if (a.constructionPart.length === a.constructionPartList.length) {
                a.checkedAll === true
            }

            if (!a.checkedAll || a.checkedAll === false) {

                newList = a.constructionPart.map((str)=>{
                    let newData = {}
                    let result = a.constructionPartList.find((cos)=>{
                        return cos.id === Number(str)
                    })
                    let resultS = a.selection.find((c)=>{
                        return c.productSkuId === Number(str)
                    })

                    // // 
                    newData.id = Number(resultS?.id) || undefined;
                    // 
                    newData.productSkuId = Number(result.id);
                    newData.employeeId = Number(result.employee?.id) ||  Number(resultS?.employee?.id) || undefined
                    newData.rollId = Number(result.roll?.id) || Number(resultS?.roll?.id) || undefined
                    newData.length = Number(result.length)|| Number(resultS?.length) || undefined

                    return newData
                })


            } else {

                newList = a.constructionPartList.map((str)=>{
                    let newData = {}
                    let result = a.selection.find((s)=>{
                        return  s.id === 0
                    })

                    newData.id = Number(result.id) || undefined
                    newData.productSkuId = Number(str.id) || undefined
                    newData.employeeId = Number(result.employee?.id) || undefined
                    newData.rollId = Number(result.roll?.id) || undefined
                    newData.length = Number(result.length) || undefined
    
                    return newData
                })
            }

            

            bodyData.constructionSku = bodyData.constructionSku.concat([...newList]);
        })

        // 缺陷部位
        bodyData.defectPart = defectPart.toString();

        // 缺陷原因
        bodyData.defectType = defectType.length > 0 ? defectType.toString() : ''


        // 缺陷图片
        defectImages = defectImages.length > 0 ? defectImages : constructionInfo.defectImages
        if (defectImages && defectImages.length > 0) {
            let newImage = []
            defectImages.map((d) => {
                newImage.push(d.url)
            })
            bodyData.defectImages = newImage
        } else {
            bodyData.defectImages = []
        }

        // 预计完成时间
        bodyData.expectComplete = expectComplete ? parseInt(that.data.expectComplete / 1000) : ''
        // 备注
        bodyData.memo = data.memo

        console.log(bodyData);

        // return
        if (!bodyData || !bodyData.userCarId || !bodyData.kilometer || !bodyData.constructionSku.length || !bodyData.expectComplete) {
            wx.showToast({
                title: '数据不完整',
                icon: 'error',
                duration: 1000
            })
        } else {
            if (constructionId) {
                request({
                    url: `/construction/${constructionId}`,
                    method: 'PUT',
                    data: bodyData
                }).then((res) => {
                    wx.showToast({
                        title: '修改成功',
                        icon: 'success',
                        duration: 1000
                    })

                    setTimeout(() => {
                        wx.navigateBack({
                            delta: 1
                        })
                    }, 1000)
                })
            } else {
                request({
                    url: `/construction`,
                    method: 'POST',
                    data: bodyData
                }).then((res) => {
                    wx.showToast({
                        title: '添加成功',
                        icon: 'success',
                        duration: 1000
                    })

                    setTimeout(() => {
                        wx.navigateBack({
                            delta: 1
                        })
                    }, 1000)
                })
            }
        }

    },

    // 获取需要修改的施工单数据
    handleConstruction() {
        let that = this,
            constructionId = that.data.constructionId,
            defectPartList = that.data.defectPartList,
            defectPart = that.data.defectPart,
            defectType = that.data.defectType,
            memo = that.data.memo,
            kilometer = that.data.kilometer,
            expectComplete = that.data.expectComplete,
            expectCompleteShowData = that.data.expectCompleteShowData,
            checkedDefectPart = that.data.checkedDefectPart;
        request({
            url: `/construction/${constructionId}`,
            method: 'GET'
        }).then((res) => {
            let {
                data
            } = res

            console.log(data)
            // 公里数
            kilometer = kilometer ? kilometer : data.kilometer

            // 缺陷部位
            defectPart = defectPart.length > 0 ? defectPart : data.defectPart.split(',')
            if (defectPart.length === defectPartList.length) {
                checkedDefectPart = true
            }

            // 缺陷原因
            defectType = defectType.length > 0 ? defectType : data.defectType !== '' ? data.defectType.split(',') : []

            // 缺陷图片
            if (data.defectImages.length > 0) {
                let newImgList = [];
                for (var key in data.defectImages) {
                    let list = {};
                    list.url = data.defectImages[key];
                    newImgList.push(list);
                }
                data.defectImages = newImgList;
            }

            // 预计完成时间

            expectCompleteShowData = expectComplete ? formatTime(expectComplete / 1000) : formatTime(data.expectComplete)
            expectComplete = expectComplete ? expectComplete : data.expectComplete * 1000


            // 备注
            memo = memo ? memo : data.memo

            // 施工产品
            let constructionSku = [...data.constructionSku];
            console.log(constructionSku)

            let keyInx = {};
            for (var i = 0; i < constructionSku.length; i++) {
                var id = constructionSku[i].productId;
                constructionSku[i].productPosition = [{
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
                    status: 1
                }]

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


            // 选中的商品
            let activeId = [],
                activeName = [],
                activeList = [];

            data.newconstructionSku.map((n, index) => {
                let obj = {},
                    value = n.productTypeId + '-' + n.productModelId + '-' + n.productId

                obj.value = value
                obj.name = n.productName
                let constructionPart = [],
                    selection = [];
                
                console.log(n.productPosition)
                n.productPosition.map((p) => {
                    
                    constructionPart.push(p.productSkuId?.toString())
                    let data = {};
                    data.id = p.id
                    data.productSkuId = p.productSkuId
                    data.roll = p.roll
                    data.employee = p.employee
                    data.length = p.length
                    data.name = p.name
                    data.status = p.status

                    selection.push(data)

                })
                obj.constructionPart = [...constructionPart]

                obj.selection = [...selection]


                activeId.push(value)
                activeName.push(n.productName)
                activeList.push(obj)

            })

            that.setData({
                constructionInfo: data,
                expectComplete,
                expectCompleteShowData,
                defectType,
                defectPart,
                memo,
                kilometer,
                defectImages: data.defectImages,
                activeId,
                activeName,
                activeList,
                checkedDefectPart
            })

            // 获取施工部位
            that.handleTypeProduct()
            //   获取膜卷
            that.onSearchRoll()
        })

    },

    onLoad(options) {

        let {
            id
        } = options;

        if (id) {
            this.setData({
                constructionId: id
            })

            // 获取需要修改的施工单数据
            this.handleConstruction()
        }

    },

    onShow() {},
    onPullDownRefresh: function () {
        wx.stopPullDownRefresh()
    },
})