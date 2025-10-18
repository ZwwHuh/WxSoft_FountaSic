Page({
  data: {},

  onLoad() {},

  onShow() {
    // 优化：删除更新tabBar选中状态的代码
    // 设置页不是tabBar页面，不应该更新tabBar选中状态
    // 这样可以避免"用户"页高亮状态出现延迟或错误
  },

  onLogout() {
    wx.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          // 清除本地存储
          wx.removeStorageSync('openid');
          wx.removeStorageSync('avatarUrl');
          wx.removeStorageSync('nickname');
          
          // 重置全局数据
          const app = getApp();
          app.globalData.openid = '';
          app.globalData.avatarUrl = '';
          app.globalData.nickname = '';
          
          // 跳转到登录页面
          wx.redirectTo({
            url: '/login/login'
          });
        }
      }
    });
  }
});