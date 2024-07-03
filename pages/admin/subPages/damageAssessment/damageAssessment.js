// pages/admin/subPages/damageAssessment/damageAssessment.js
const app = getApp();
import {
    request
} from '../../../../utils/request'
Page({

    /**
     * 页面的初始数据
     */
    data: {
        userId: undefined,
        warrantyId: undefined,
        productId: undefined,
        defectPartList: [{
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
        ],
        //缺陷部位
        defectPart: [],
        windowHeight: wx.getStorageSync('windowHeight'),
        navbarHeight: wx.getStorageSync('navbarHeight'),
        defectImages: [],
        memo: '',
        lossAssessmentList: []

    },
    onChange(event) {
        this.setData({
            memo: event.detail
        });
    },
    formSubmit(e) {
        let { userId, warrantyId, productId, defectPart, defectImages, memo } = this.data;

        //缺陷图片
        const files = defectImages.map(image => image.url);
        // console.log('files =>', files);
        //备注
        // console.log('memo=>', memo);

        let num = 0;
        if( defectPart.length > 0 ){
            for (const productPositionId of defectPart) {

                if(files.length === 0){
                    wx.showToast({
                        title: '请选择缺陷图片',
                        icon: 'none'
                    })
                    return
                };
                if(memo.length === 0){
                    wx.showToast({
                        title: '请填写缺陷原因',
                        icon: 'none'
                    })
                    return
                };

                const bodyData = {
                    productPositionId:parseInt(productPositionId),
                    userId,
                    warrantyId,
                    productId,
                    files,
                    memo
                };
    
                // console.log(bodyData);
                // return;
                request({
                    url: `/service-record`,
                    data:bodyData,
                    method: "POST",
                }).then((res) => {
                    
                    num = num + 1;
                    // console.log(num,defectPart.length);
                    if(num === defectPart.length && res.code === 0){
                        wx.showToast({
                            title: '提交成功',
                            icon: 'success'
                        },1000);
                        
                        setTimeout(function() {
                            wx.navigateBack(1);
                        }, 1000);
                    }else{
                        // wx.showToast({
                        //     title: `${res.message}`,
                        //     icon: 'none'
                        // },1000);
                    }
                })
            }
        }else{
            wx.showToast({
              title: '请选择缺陷部位',
              icon: 'none'
            })
        }


    },

    onChangeDefectPart(e) {
        // console.log(e);
        let defectPart = e.detail;
        this.setData({
            defectPart
        })
    },
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

    delDefectImages(e) {
        let index = e.detail.index,
            defectImages = this.data.defectImages;
        defectImages.splice(index, 1)

        this.setData({
            defectImages
        })
    },
    getLossAssessmentList(){
        let { userId, warrantyId} = this.data;
        const bodyData = {
            userId,
            warrantyId
        };
        request({
            url: `/service-record`,
            data:bodyData,
            method: "GET",
        }).then((res) => {
            // console.log('getLossAssessmentList=>',res);
            

            if(res.code === 0){
                const lossAssessmentList = res.data.list.map(item => {

                    const part = this.data.defectPartList.find(part => part.id === item.productPositionId);
                    const createdAt = new Date(item.createdAt * 1000);
                    return {
                        productPositionId:item.productPositionId,
                        productPosition: part ? part.name : '', // 如果找不到对应的部位，使用 'Unknown'
                        createdAt: `${createdAt.getFullYear()}年${createdAt.getMonth() + 1}月${createdAt.getDate()}日 ${createdAt.getHours()}:${createdAt.getMinutes()}:${createdAt.getSeconds()}`,
                        memo: item.memo
                    };
                });
                // console.log(lossAssessmentList);
                //过滤掉已经定损的部位
                const filteredDefectPartList = this.data.defectPartList.filter(defectPart =>
                    !lossAssessmentList.some(lossAssessment =>
                        lossAssessment.productPositionId === defectPart.id
                    )
                );
                // console.log(filteredDefectPartList)
                this.setData({
                    lossAssessmentList,
                    defectPartList:filteredDefectPartList
                })
            }
            
        })
    },

    onLoad(options) {
        // console.log(options);
        this.setData({
            userId: parseInt(options.userId),
            warrantyId: parseInt(options.warrantyId),
            productId: parseInt(options.productId)
        });
        // console.log(this.data.productId)

        //获取定损记录
        this.getLossAssessmentList();
    },


    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {

    }
})