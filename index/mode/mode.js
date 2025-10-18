Page({
  data: {},

  onLoad() {},

  chooseMode(e) {
    const mode = e.currentTarget.dataset.mode || 'single';
    wx.setStorageSync('selected_mode', mode);

    // 发送模式到硬件设备
    this.sendModeToDevice(mode);

    // 跳转到选歌页面
    wx.switchTab({
      url: '/index/index'
    });
  },

  // 发送模式到硬件设备
  sendModeToDevice(mode) {
    // 这里实现与硬件设备的通信
    console.log(`发送模式到设备: ${mode}`);
    // 示例：调用硬件接口
    // wx.request({
    //   url: '硬件设备接口地址',
    //   method: 'POST',
    //   data: { mode: mode },
    //   success: (res) => {
    //     console.log('模式设置成功:', res);
    //   },
    //   fail: (err) => {
    //     console.error('模式设置失败:', err);
    //   }
    // });
  }
});