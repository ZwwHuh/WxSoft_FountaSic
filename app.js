App({
  globalData: {
    avatarUrl: '',
    nickname: '',
    openid: '',
    apiBaseUrl: "https://ingrid-unencroached-unhumanly.ngrok-free.dev"
  },

  onLaunch() {
    console.log('ヽ(●´∀`●)ﾉ Fountasic App Launch')
    
    // 检查登录状态
    const openid = wx.getStorageSync('openid')
    if (openid) {
      this.globalData.openid = openid
      this.globalData.avatarUrl = wx.getStorageSync('avatarUrl') || ''
      this.globalData.nickname = wx.getStorageSync('nickname') || ''
      console.log(' 用户已登录～(￣▽￣～)~:', this.globalData.nickname)
    }
  },

  onShow() {
    console.log('ヾ(◍°∇°◍)ﾉﾞ App Show')
  },

  onHide() {
    console.log('(๑•̀ㅂ•́)و✧ App Hide')
  }
})