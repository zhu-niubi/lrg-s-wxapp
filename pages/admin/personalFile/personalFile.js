// 获取应用实例
const app = getApp();
import { request } from "../../../utils/request";
import { formatTime } from "../../../utils/util.js";

Page({
  data: {
    bgImg: "",
    userInfo: wx.getStorageSync("userInfo"),
    windowHeight: wx.getStorageSync("windowHeight"),
    navbarHeight: wx.getStorageSync("navbarHeight"),
  },

  //   修改用户头像
  onChooseAvatar: function (e) {
    let that = this;
    const storeToken = wx.getStorageSync("storeToken");
    const defaultAvatarUrl =
      "https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0";
    const { avatarUrl } = e.detail;

    wx.uploadFile({
      url: `${app.globalData.hostUri}/upload`,
      method: "POST",
      filePath: avatarUrl || defaultAvatarUrl,
      name: "file",
      header: {
        "content-type": "multipart/form-data",
        Authorization: `Bearer ${storeToken}`,
      },
      formData: {
        file: avatarUrl || defaultAvatarUrl,
      },
      success(res) {
        const data = JSON.parse(res.data);

        let bodyData = {
          image: data.data.url,
        };
        // 修改用户头像
        request({
          url: `/profile`,
          method: "PUT",
          data: bodyData,
        }).then((res) => {
          const { code } = res;
          if (code !== 0) {
            wx.showToast({
              title: "修改失败",
              icon: "error",
              duration: 1000,
            });
          } else {
            wx.showToast({
              title: "修改成功",
              icon: "success",
              duration: 1000,
            });

            that.getEmployeeInfo();
          }
        });
      },
    });
  },

  //   获取员工信息
  getEmployeeInfo: function () {
    request({
      url: `/profile`,
      method: "GET",
    }).then((res) => {
      const { data } = res;
      wx.setStorageSync("employeeInfo", data);

      this.setData({
        userInfo: data,
      });
    });
  },

  // 加载背景图数据
  handleBjImage: function (e) {
    let bodyData = {
      pageSize: 10,
      pageNumber: 1,
      type: 4,
    };

    request({
      url: `/image`,
      method: "GET",
      data: bodyData,
    }).then((res) => {
      let { list } = res.data;
      let bgImg = list[0] ? list[0].url : "";
      let newBgImg = bgImg ? `background-image: url('${bgImg}')` : "";

      this.setData({
        bgImg: newBgImg,
      });
    });
  },

  formSubmit: function (e) {
    const value = e.detail.value;
    if (!value.oldPassword || !value.newPassword) {
      wx.showToast({
        title: "数据不完整",
        icon: "error",
        duration: 1000,
      });
    } else {
      this.handleUpdateUserInfo(value);
    }
  },

  // 修改用户信息接口
  handleUpdateUserInfo: function (val) {
    let that = this;
    let { oldPassword, newPassword } = val;

    let bodyData = {
      oldPassword,
      newPassword,
    };

    // console.log(bodyData)
    // return
    request({
      url: `/employee/reset_pass`,
      method: "POST",
      data: bodyData,
    }).then((res) => {
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
    });
  },

  onLoad() {
    this.handleBjImage(); // 背景图
    this.getEmployeeInfo();
    this.setData({
      userInfo:
        wx.getStorageSync("employeeInfo") || wx.getStorageSync("userInfo"),
    });
  },

  onShow() {},
  onPullDownRefresh: function () {
    wx.stopPullDownRefresh();
  },
});
