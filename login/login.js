const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'

Page({
  data: {
    avatarUrl: defaultAvatarUrl,
    nickname: '',
    usercode: null,
    openid: null,
  },

  onLoad: function(options) {
    const app = getApp();
    const that = this;

    app.globalData.avatarUrl = wx.getStorageSync('avatarUrl') || '';
    app.globalData.nickname = wx.getStorageSync('nickname') || '';

    const cachedOpenid = wx.getStorageSync('openid');
    if (cachedOpenid) {
      console.log('发现缓存的openid:', cachedOpenid);
      this.setData({
        openid: cachedOpenid
      });

      wx.redirectTo({
        url: '/index/mode/mode',
      });
      return;
    }
    
    wx.showLoading({
      title: '加载中...',
      mask: true
    });

    wx.login({
      success: function(res) {
        if (res.code) {
          that.setData({
            usercode: res.code
          });
          that.sendCodeToServer(res.code, 0);
        } 
      },
    });
  },

  onNicknameInput: function(e) {
    const value = e.detail.value;
    this.setData({
      nickname: value
    });
  },
  
  onChooseAvatar(e) {
    const { avatarUrl } = e.detail;
    this.setData({
      avatarUrl,
    });
  },

  TapLogin: function(e) {
    const that = this;
    console.log('开始注册流程');

    if (!this.data.nickname.trim()) {
      wx.showToast({ title: '请输入昵称', icon: 'none' });
      return;
    }

    const app = getApp();
    app.globalData.nickname = this.data.nickname;
    app.globalData.avatarUrl = this.data.avatarUrl;
    
    this.executeRegister();
  },

  executeRegister: function() {
    const that = this;
    wx.login({
      success: function(res) {
        if (res.code) {
          that.setData({
            usercode: res.code
          });
          that.sendCodeToServer(res.code, 1);
        }
      },
    });
  },
  
  sendCodeToServer: function(code, registerType) {
    const that = this;
    console.log(`发送code到服务器, registerType: ${registerType}, code:`, code);

    wx.request({
      url: 'https://ingrid-unencroached-unhumanly.ngrok-free.dev/api/login',
      method: 'POST',
      data: {
        code: code,
        register: registerType,
        nickname: registerType === 1 ? this.data.nickname : '',
        avatarUrl: registerType === 1 ? this.data.avatarUrl : ''
      },
      header: {
        'Content-Type': 'application/json'
      },
      success: (res) => {
        console.log("服务器响应:", res.data);

        wx.hideLoading();

        if (res.data.status === 'success' && res.data.existUser === 1) {
          const openid = res.data.openid;
          const avatarUrl = res.data.avatar_url || that.data.avatarUrl;
          const nickname = res.data.nickname || that.data.nickname;

          wx.setStorageSync('openid', openid);
          wx.setStorageSync('avatarUrl', avatarUrl);
          wx.setStorageSync('nickname', nickname);

          // 更新全局数据
          getApp().globalData.openid = openid;
          getApp().globalData.avatarUrl = avatarUrl;
          getApp().globalData.nickname = nickname;

          wx.redirectTo({
            url: '/index/mode/mode',
          });
        } else {
          wx.showToast({
            title: '登录失败，请重试',
            icon: 'none'
          });
        }
      },
      fail: (error) => {
        wx.hideLoading();
        console.error('请求失败:', error);

        wx.showToast({
          title: '网络请求失败',
          icon: 'none'
        });
      }
    });
  }
})