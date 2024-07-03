'use strict'
const app = getApp()
const hostUri = app.globalData.hostUri

export function request(options){
	
    const { url, data, method } = options

	const storeToken = wx.getStorageSync('storeToken')

	return new Promise((resolve, reject) => {
  
	  const header = { 'Content-Type': 'application/json' }
  
      options.url = `${hostUri ? hostUri.replace(/\/$/, '') : ''}/${url.replace(
        /^\//,
        ''
      )}`
		
  
	  if (data && method !== 'GET') {
		options.data = JSON.stringify(data)
	  }

       header['Authorization'] = `Bearer ${storeToken}`
  
	  wx.request({
		header,
		...options,
		success(res) {
		  if (res.data.code === 0) {
			resolve(res.data)
		  } else {
			switch (res.statusCode) {
				case 401:
					wx.showToast({
						title: '身份过期',
						icon: 'error',
						duration: 2000
                        })

					  
				  // 清除本地缓存
                  wx.removeStorageSync('storeToken')
                  wx.redirectTo({
                      url: `/pages/login/login`,
                    })
				  
				  break
				case 500:
				  wx.showModal({
					title: '错误提示',
					content: res.data.message,
					showCancel: false,
				  })
				  break
				default:
					wx.showModal({
						title: '错误提示',
						content: res.data.message,
						showCancel: false,
					  })
				  break
			  }
		  }
		},
		fail(res) {
		  console.error('fail', res.errMsg)
		  reject(res.data)
		},
		complete() {
		  wx.hideLoading()
		},
	  })
	})
}


