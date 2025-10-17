Page({
  data: {
    MusicId: 0,
    MusicVolume: 15,
    MusicState: 1, // 1: 播放, 0: 暂停
    MusicName: "",
    MusicAuthor: '',
    totalTime: 0, // 总时长（秒）
    currentTime: 0, // 当前播放时间（秒）
    progressPercent: 0, // 进度条百分比
    timer: null // 定时器
  },
  
  onLoad(options) {
    console.log("start");
    const musicId = options.MusicId || 0;
    const musicName = options.MusicName || '未知音乐';
    const musicAuthor = options.MusicAuthor || '佚名';
    const duration = options.duration || '0:00'; // 获取时长字符串
    
    // 将时长字符串转换为秒数
    const totalSeconds = this.durationToSeconds(duration);
    
    this.setData({
      MusicId: musicId,
      MusicName: musicName,
      MusicAuthor: musicAuthor,
      totalTime: totalSeconds,
      currentTime: 0,
      progressPercent: 0
    });
    this.sendDeviceCommand();

    this.startProgressTimer(); // 开始进度条计时
  },

  onUnload() {
    console.log('onUnload 被触发 - 页面卸载');
    this.clearProgressTimer();
    this.setData({
      MusicId: 0,
      MusicName: '',
      MusicAuthor:'',
      MusicState:0
    });
    this.sendDeviceCommand();
  },

  // 将时长字符串转换为秒数
  durationToSeconds(duration) {
    if (!duration) return 0;
    const parts = duration.split(':');
    if (parts.length === 2) {
      const minutes = parseInt(parts[0]) || 0;
      const seconds = parseInt(parts[1]) || 0;
      return minutes * 60 + seconds;
    }
    return 0;
  },

  // 开始进度条计时
  startProgressTimer() {
    this.clearProgressTimer(); // 先清除之前的定时器
    
    this.data.timer = setInterval(() => {
      if (this.data.MusicState === 1 && this.data.currentTime < this.data.totalTime) {
        const newTime = this.data.currentTime + 1;
        const newPercent = (newTime / this.data.totalTime) * 100;
        
        this.setData({
          currentTime: newTime,
          progressPercent: newPercent
        });
        
        // 如果到达总时长，自动暂停
        if (newTime >= this.data.totalTime) {
          this.setData({
            MusicState: 0,
            currentTime: this.data.totalTime,
            progressPercent: 100
          });
          this.sendDeviceCommand();
          this.clearProgressTimer();
        }
      }
    }, 1000);
  },

  // 清除进度条定时器
  clearProgressTimer() {
    if (this.data.timer) {
      clearInterval(this.data.timer);
      this.data.timer = null;
    }
  },

  // 切换播放状态
  togglePlayState() {
    const newState = this.data.MusicState === 1 ? 0 : 1;
    this.setData({
      MusicState: newState
    });
    
    if (newState === 1) {
      // 如果是播放状态，开始计时
      this.startProgressTimer();
    } else {
      // 如果是暂停状态，停止计时
      this.clearProgressTimer();
    }
    
    this.sendDeviceCommand();
  },

  // 增加音量
  increaseVolume() {
    if (this.data.MusicVolume < 30) {
      this.setData({
        MusicVolume: this.data.MusicVolume + 3
      });
      this.sendDeviceCommand();
    } else {
      this.setData({
        MusicVolume: 30
      });
    }
  },

  // 减少音量
  decreaseVolume() {
    if (this.data.MusicVolume > 0) {
      this.setData({
        MusicVolume: this.data.MusicVolume - 3
      });
      this.sendDeviceCommand();
    } else {
      this.setData({
        MusicVolume: 0
      });
    }
  },

  // 发送设备控制命令
  sendDeviceCommand() {
    const config=require('../utils/config.js');
    wx.request({
      url: config.OnenetConfig.set_url,
      method: 'POST',
      data: {
        "product_id": config.OnenetConfig.product_id,
        "device_name": config.OnenetConfig.device_name,
        "params": {
          "Song": `${this.data.MusicId}`.padStart(3, '0'),
          "Volume": `${this.data.MusicVolume}`.padStart(2, '0'),
          "Mode_Yinyue_State": `${this.data.MusicState}`.padStart(1, '0')
        }
      },
      header: {
        'Content-Type': 'application/json',
        'Authorization': config.OnenetConfig.token
      },
      success: (res) => {
        console.log("请求成功:", res.data);
        if (res.data.code !== 0) {
          wx.showToast({
            title: '设备控制失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.log("请求失败:", err);
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        });
      }
    });
  }
});