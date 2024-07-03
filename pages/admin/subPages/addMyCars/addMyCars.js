// 获取应用实例
const app = getApp();
import { request } from "../../../../utils/request";

Page({
  data: {
    carInfo: {},
    windowHeight: wx.getStorageSync("windowHeight"),
    navbarHeight: wx.getStorageSync("navbarHeight"),
    carId: null,
    carName: "",
    VIN: null,
    plate_num:'',
    submitLoading: false,
  },

  // 行驶证识别
  driverSuccess(e){
    let that = this;

    
    that.setData({
      VIN : e.detail.vin.text,
      // carName : e.detail.model.text,
      plate_num : e.detail.plate_num.text,

    })
},

  //  选择车型跳转车品牌页面
  changeCar: function () {
    wx.navigateTo({
      url: "/pages/admin/subPages/carList/carList",
    });
  },

  toUpperCase(e) {
    const value = e.detail.value;
    let VIN = this.data.VIN;
    VIN = value.toLocaleUpperCase();

    this.setData({
      VIN,
    });
  },

  // 提交信息
  formSubmit: function (e) {
    let that = this;
    let badyData = e.detail.value;
    let carInfo = that.data.carInfo;

    badyData.carId = Number(that.data.carId) || carInfo.carId;
    console.log(badyData);
    // return
    if (
      !badyData ||
      !badyData.phoneNumber ||
      !badyData.carId ||
      !badyData.carNumber ||
      !badyData.VIN ||
      !badyData.color
    ) {
      wx.showToast({
        title: "数据不完整",
        icon: "error",
        duration: 1000,
      });
    } else {
      that.setData({
        submitLoading: true,
      });
      if (carInfo.id) {
        request({
          url: `/user_car/${carInfo.id}`,
          method: "PUT",
          data: badyData,
        }).then((res) => {
          const { code, message } = res;
          if (code !== 0) {
            wx.showToast({
              title: "修改失败" + message,
              icon: "error",
              duration: 1000,
            });
          } else {
            wx.showToast({
              title: "修改成功",
              icon: "success",
              duration: 1000,
            });

            setTimeout(() => {
              wx.navigateBack({
                delta: 1,
              });
            }, 1000);
          }

          that.setData({
            submitLoading: false,
          });
        });
      } else {
        request({
          url: `/user_car`,
          method: "POST",
          data: badyData,
        }).then((res) => {
          const { code, message } = res;
          if (code !== 0) {
            wx.showToast({
              title: "添加失败" + message,
              icon: "error",
              duration: 1000,
            });
          } else {
            wx.showToast({
              title: "添加成功",
              icon: "success",
              duration: 1000,
            });

            setTimeout(() => {
              wx.navigateBack({
                delta: 1,
              });
            }, 1000);
          }

          that.setData({
            submitLoading: false,
          });
        });
      }
    }
  },

  onLoad(options) {
    let carInfo = options.item ? JSON.parse(options.item) : "";

    if (carInfo) {
      this.setData({
        carInfo,
      });
    }
  },

  onShow() {},
  onPullDownRefresh: function () {
    wx.stopPullDownRefresh();
  },
});
