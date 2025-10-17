const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'

Page({
  data: {
    avatarUrl: defaultAvatarUrl,
    nickname: '',
    usercode: null,
    openid: null,
  },

  onLoad: function(options) {
    const app=getApp();
    const that = this;
    // 启动时检查本地缓存中是否有openid
    app.globalData.avatarUrl=wx.getStorageSync('avatarUrl')||'';
    app.globalData.nickname=wx.getStorageSync('nickname')||'';
    const cachedOpenid = wx.getStorageSync('openid');
    if (cachedOpenid) {
      console.log('发现缓存的openid:', cachedOpenid);
      this.setData({
        openid: cachedOpenid
      });
      // 直接跳转到主页
      
      wx.switchTab({
        url: '/index/index2',
      });
      return; // 直接返回，不执行后面的登录逻辑
      
    }
    
    // 如果没有缓存，则进行登录流程
    wx.showLoading({
      title: '加载中...',
      mask: true
    });
    wx.login({
      success: function(res) {
        if (res.code) {
          console.log('code:', res.code);
          that.setData({
            usercode: res.code
          });
          // 发送code到服务器自检
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
    console.log("头像地址:", this.data.avatarUrl);
  },

  TapLogin: function(e) {
    const that = this;
    console.log('开始注册流程');

    // 保存用户信息到全局数据
    const app = getApp();
    app.globalData.nickname = this.data.nickname;
    app.globalData.avatarUrl = this.data.avatarUrl;
    console.log('用户名为' + this.data.nickname);
    
    // 执行注册流程
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
    const config=require('../utils/config.js');
    console.log(`发送code到服务器, registerType: ${registerType}, code:`, code);
    wx.request({
      url: config.DatabaseConfig.login_url,
      method: 'POST',
      data: {
        code: code,
        register: registerType, // 0: 自检, 1: 注册
        nickname: registerType === 1 ? this.data.nickname : '',
        avatarUrl: registerType === 1 ? this.data.avatarUrl : ''
      },
      header: {
        'Content-Type': 'application/json'
      },
      success: (res) => {
        console.log("服务器响应:", res.data);

        // 隐藏加载动画
        wx.hideLoading();
        if (res.data.existUser === 1) {
          const openid = res.data.openid;
          const avatarUrl=res.data.avatarUrl;
          const nickname=res.data.nickname;
          wx.setStorageSync('openid', openid);
          wx.setStorageSync('avatarUrl', avatarUrl);
          wx.setStorageSync('nickname', nickname);
          wx.switchTab({
            url: '/index/index2',
          });
        }
      },
      fail: (error) => {
        // 请求失败时也要隐藏加载动画
        wx.hideLoading();
        console.error('请求失败:', error);
        wx.showToast({
          title: '网络请求失败',
          icon: 'none'
        });
      }
    });
  },
  
  // 可选：添加清除缓存的方法（用于退出登录）
  clearCache: function() {
    wx.removeStorageSync('openid');
    this.setData({
      openid: null
    });
    console.log('openid缓存已清除');
    wx.showToast({
      title: '已退出登录',
      icon: 'success'
    });
  }
})