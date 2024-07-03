// pages/admin/NFCWarranty/NFCWarranty.js
import { request } from "../../../utils/request";
import { formatTime } from "../../../utils/util.js";
import { byteToString, formatNullCharacter, throttle, stringToBuffer } from '../../../utils/nfcutils';
Page({
  NFCAdapter: null,
  data: {
    windowHeight: wx.getStorageSync('windowHeight'),
    navbarHeight: wx.getStorageSync('navbarHeight'),
    tabList: [
      { id: 1, name: '录入质保' },
      { id: 2, name: '质保信息确认' },
    ],
    qualityAssuranceData: {},
    combinedProductNames: '',
    read: {},
    vs: false
  },

  getWarranty(id) {
    const constructionId = id;
    // console.log(constructionId);
    request({
      url: `/construction/${constructionId}`,
      method: "GET",
    }).then((res) => {
      const qualityAssuranceData = res.data;
      // console.log(qualityAssuranceData);
      qualityAssuranceData.completeAt = formatTime(qualityAssuranceData.completeAt);
      qualityAssuranceData.deadline = formatTime(qualityAssuranceData.deadline);
      const productNamesSet = new Set();
      qualityAssuranceData.constructionSku.forEach((sku) => {
        productNamesSet.add(sku.productName);
      });
      const productNamesArray = Array.from(productNamesSet);
      const combinedProductNames = productNamesArray.join('-');
      combinedProductNames: combinedProductNames,

        // console.log('combinedProductNames', combinedProductNames)
        // this.warrantyInfo
        qualityAssuranceData.combinedProductNames = combinedProductNames
      console.log('qualityAssuranceData', qualityAssuranceData)
      this.setData({
        qualityAssuranceData: qualityAssuranceData,
        combinedProductNames: combinedProductNames,
      });
    });

  },
  onLoad(options) {
    let that = this,
      obj = JSON.parse(options.obj);
    // 获取质保数据
    that.getWarranty(obj.id);
  },
  onShow() {
    // 获取NFC实例
    this.NFCAdapter = wx.getNFCAdapter();
    // 监听NFC靠近
    this.NFClistener();
    
    this.onValidate();

    this.onWriteNdefInfo();


  },
  NFClistener() {
    this.NFCAdapter.startDiscovery({
      success: () => {
        wx.showToast({
          title: '开启NFC适配器成功，请靠近NFC',
          icon: 'success',
        })
      },
      fail: error => {
        wx.showToast({
          title: '开启适配器失败',
          icon: 'error'
        })
      }
    })
  },
  validateDiscoverHandler(callback) {
    console.log('==================== START ====================')
    console.log('onDiscovered callback=>', callback)
    if (callback?.messages.length > 0) {
      let cordsArray = callback.messages[0].records;
      cordsArray.forEach(item => {
        const read = {
          payload: formatNullCharacter(byteToString(new Uint8Array(item.payload))),
          id: byteToString(new Uint8Array(item.id)),
          type: byteToString(new Uint8Array(item.type))
        }
        console.log('NFC buffer 转字符串 =>',read)
      })
    } 
    if (callback.techs.length != 0) {
      wx.showToast({
        title: '识别成功',
        icon: 'success',
        duration: 2000
      })
      this.setData({
        vs: true
      })
    } else {
      wx.showToast({
        title: '无效设备',
        icon: 'error',
        duration: 2000
      })
    }

    this.NFCAdapter.offDiscovered(this.validateDiscoverHandler)
    console.log('===================== END =====================')
  },
  onWriteNdefInfo: throttle(function (e) {
    // 监听 NFC 标签
    this.NFCAdapter.onDiscovered(this.writeDiscoverHandler)
  }),

  async writeDiscoverHandler() {
    const NFCTab = await this.initTab()
    if (!NFCTab) return
    console.log('this.data.qualityAssuranceData',this.data.qualityAssuranceData)
    let textArray = JSON.stringify(this.data.qualityAssuranceData.id);

    const buffer = stringToBuffer(textArray);
    const buffer1 = stringToBuffer('asdasdasda');
    console.log(buffer,buffer1)

    let records = [{
      id: stringToBuffer("1"),
      payload: stringToBuffer(textArray),
      type: stringToBuffer(""),
      tnf: 2
    }];
    // 执行写入
    NFCTab.writeNdefMessage({
      records,
      success: (res) => {
        console.log("writeNdefMessage res=>", res)
        wx.showToast({
          title: '写入成功',
          icon: 'success',
          duration: 2000
        })
      },
      fail: (err) => {
        console.log("writeNdefMessage err=>", err)
      },
      complete: res => {
        this.closeConnect(NFCTab)
      }
    })
  },

  initTab() {
    const NFCTab = this.NFCAdapter.getNdef()
    return new Promise((resolve, reject) => {
      NFCTab.connect({
        success: () => {
          this.setData({
            title: '连接设备成功',
          })
          resolve(NFCTab)
        },
        fail: error => {
          console.log('error', error)
          wx.showToast({
            title: '连接设备失败',
            icon: 'error'
          })
          this.setData({
            title: '连接设备失败',
          })
          this.NFCAdapter.offDiscovered(this.writeDiscoverHandler)
          reject()
        }
      })
    })
  },
  closeConnect(NFCTab) {
    NFCTab.close({
      complete: res => {
        console.log('清除标签连接：res', res)
        this.NFCAdapter.offDiscovered(this.writeDiscoverHandler)
      }
    })
  },


  onValidate: throttle(function (e) {
    setTimeout(() => {
      // 监听 NFC 标签
      this.NFCAdapter.onDiscovered(this.validateDiscoverHandler)
    },"3000")
  }),

  closeNFC() {
    if (this.NFCAdapter) {
      this.NFCAdapter.offDiscovered(this.writeDiscoverHandler)
      this.NFCAdapter.offDiscovered(this.validateDiscoverHandler)
      this.NFCAdapter.stopDiscovery()
      this.NFCAdapter = null
    }
  },

  onHide: function () {
    this.closeNFC()
  },
  onUnload: function () {
    this.closeNFC()
  }

})