// pages/admin/putMaterial/putMaterial.js
const app = getApp();
import { request } from '../../../utils/request';
import { formatTime } from '../../../utils/util';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    constructionInfo: null,
    materialImg:{}, // 图片
  },
  submit(e) {
    let constructionId = this.data.constructionInfo.id;
    const materialImgs = this.data.materialImg;
    Object.keys(materialImgs).map(i=>{
      var productId = +i
      const constructionImageId = this.data.constructionInfo.constructionImage.find(j=>j.productId === productId)?.id||0
      const value = {
        constructionId,
        src: materialImgs[i].map(j=>j.url),
        productId
      }
      console.log('value',value)
      if ( value.src.length == 0 ) {
        wx.showToast({
          title: '请添加素材图片',
          icon: 'none',
          duration: 1000
        })
        return;
      }
      if(constructionImageId){
        request({
          url: `/construction-image/${constructionImageId}`,
          method: "PUT",
          data:value
        }).then((res) => {
          if( res.code == 0 ){
            wx.showToast({
              title: '上传成功',
              icon: 'success',
              duration: 1000
            })
            setTimeout(function() {
              wx.navigateBack(1);
            }, 700);
          }
        })
      }else{
        request({
        url: `/construction-image`,
        method: "POST",
        data:value
      }).then((res) => {
        if( res.code == 0 ){
          wx.showToast({
            title: '上传成功',
            icon: 'success',
            duration: 1000
          })
          setTimeout(function() {
            wx.navigateBack(1);
          }, 700);
        }
      })
      }
    })
  },

  delmaterialImg(e) {
    var that = this
    that.data.materialImg[e.target.id] = that.data.materialImg[e.target.id].filter((_,index)=>index!==e.detail.index)
    this.setData({
      materialImg: that.data.materialImg
    })
  },
  afterReadImage(e) {
    let that = this,
        productId = e.currentTarget.id;
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
          that.data.materialImg[productId].push({url:data.url})
          that.setData({
            materialImg:that.data.materialImg
          })
          // const {
          //   materialImg = []
          // } = that.data;

          // materialImg.push({
          //   url: data.url
          // });
          // that.setData({
          //   materialImg
          // });
        },
      });
    })


  },
  // 获取施工单详情
  handleConstruction(id) {
    let that = this,
      constructionId = id;
    // 获取信息
    request({
      url: `/construction/${constructionId}`,
      method: "GET",
    }).then((res) => {
      let constructionInfo = res.data;
     
      constructionInfo.createdAt = formatTime(constructionInfo.createdAt)
      // 施工部位
      let constructionSku = [...constructionInfo.constructionSku];

      let keyInx = {};
      for (var i = 0; i < constructionSku.length; i++) {
        var id = constructionSku[i].productId;
        constructionSku[i].productPosition = [
          {
            productSkuName: constructionSku[i].productSkuName,
            rollNumber: constructionSku[i].rollNumber,
            employeeName: constructionSku[i].employeeName,
            length: constructionSku[i].length,
          },
        ];

        if (keyInx[id] >= 0) {
          var product1 = constructionSku[i].productPosition;
          var product2 = constructionSku[keyInx[id]].productPosition;
          constructionSku[keyInx[id]].productPosition = product1.concat(
            product2
          );
          constructionSku.splice(i, 1);
          i--;
        } else {
          keyInx[id] = i;
        }
      }

      constructionInfo.newconstructionSku = constructionSku;
      let json = {}
      constructionInfo.newconstructionSku.forEach(j=>{
        json[j.productId] = constructionInfo.constructionImage.filter(k=>k.productId === j.productId).map(k=>k.src).flat().map(k=>({url:k}))
      })
      console.log(constructionInfo)
      that.setData({
        materialImg:json,
        constructionInfo,
      });
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let that = this,
      id = options.id;
    console.log('施工单id', id)
    if (id) {
      this.handleConstruction(id); // 获取施工单详情 
    }

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