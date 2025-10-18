Page({
  data: {
    MusicId: 0,
    MusicVolume: 15,
    MusicState: 1,
    MusicName: "",
    MusicAuthor: '',
    totalTime: 0,
    currentTime: 0,
    progressPercent: 0,
    timer: null,
    currentTimeText: '00:00',
    totalTimeText: '00:00',
    selectedMode: 'single'
  },
  
  onLoad(options) {
    console.log('播放页面接收到的参数:', options);
    
    const musicId = options.MusicId || 0;
    // 解码URL参数
    const musicName = options.MusicName ? decodeURIComponent(options.MusicName) : '未知音乐';
    const musicAuthor = options.MusicAuthor ? decodeURIComponent(options.MusicAuthor) : '佚名';
    const duration = options.duration || '0:00';
    
    const totalSeconds = this.durationToSeconds(duration);
    const selectedMode = wx.getStorageSync('selected_mode') || 'single';
    
    this.setData({
      MusicId: musicId,
      MusicName: musicName,
      MusicAuthor: musicAuthor,
      totalTime: totalSeconds,
      currentTime: 0,
      progressPercent: 0,
      selectedMode: selectedMode,
      totalTimeText: this.formatTime(totalSeconds),
      currentTimeText: '00:00'
    });

    console.log('设置播放信息:', {
      id: musicId,
      name: musicName,
      author: musicAuthor,
      duration: totalSeconds,
      mode: selectedMode
    });

    this.sendDeviceCommand();
    this.startProgressTimer();
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

  onHide() {
    console.log('播放页面隐藏');
    this.clearProgressTimer();
  },

  onMusicEnd() {
    console.log('音乐播放结束');
    this.clearProgressTimer();
    this.setData({
      MusicState: 0,
      currentTime: this.data.totalTime,
      progressPercent: 100,
      currentTimeText: this.formatTime(this.data.totalTime)
    });

    const mode = this.data.selectedMode;
    const score = Math.floor(Math.random() * 1000) + 500;
    
    this.uploadScoreToRank(score, mode);
    
    wx.showToast({
      title: `演奏完成！得分: ${score}`,
      icon: 'success',
      duration: 2000
    });
    
    setTimeout(() => {
      wx.switchTab({
        url: '/index/index2'
      });
    }, 2000);
  },

  uploadScoreToRank(score, mode) {
    const openid = wx.getStorageSync('openid');
    const nickname = wx.getStorageSync('nickname') || '匿名用户';
    const avatarUrl = wx.getStorageSync('avatarUrl') || '';
    const config=require('../utils/config.js');
    if (!openid) {
      console.log('用户未登录，无法上传成绩');
      return;
    }

    wx.request({
      url: `${config.DatabaseConfig.base_url}/api/upload_rank`,
      method: 'POST',
      data: {
        openid: openid,
        nickname: nickname,
        avatar_url: avatarUrl,
        mode: mode,
        score: score
      },
      header: { 'Content-Type': 'application/json' },
      success: (res) => {
        console.log('成绩上传成功:', res.data);
        // 设置排行榜更新标志
        wx.setStorageSync('rank_updated', true);
      },
      fail: (err) => {
        console.error('成绩上传失败:', err);
      }
    });
  },

  durationToSeconds(duration) {
    if (!duration) return 180;
    const parts = duration.split(':');
    if (parts.length === 2) {
      const minutes = parseInt(parts[0]) || 0;
      const seconds = parseInt(parts[1]) || 0;
      return minutes * 60 + seconds;
    }
    return 180;
  },

  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  },

  startProgressTimer() {
    this.clearProgressTimer();
    
    this.data.timer = setInterval(() => {
      if (this.data.MusicState === 1 && this.data.currentTime < this.data.totalTime) {
        const newTime = this.data.currentTime + 1;
        const newPercent = (newTime / this.data.totalTime) * 100;
        
        this.setData({
          currentTime: newTime,
          progressPercent: newPercent,
          currentTimeText: this.formatTime(newTime)
        });
        
        if (newTime >= this.data.totalTime) {
          this.onMusicEnd();
        }
      }
    }, 1000);
  },

  clearProgressTimer() {
    if (this.data.timer) {
      clearInterval(this.data.timer);
      this.data.timer = null;
    }
  },

  togglePlayState() {
    const newState = this.data.MusicState === 1 ? 0 : 1;
    this.setData({
      MusicState: newState
    });
    
    if (newState === 1) {
      this.startProgressTimer();
    } else {
      this.clearProgressTimer();
    }
    
    this.sendDeviceCommand();
    
    wx.showToast({
      title: newState === 1 ? '播放' : '暂停',
      icon: 'none',
      duration: 1000
    });
  },

  increaseVolume() {
    if (this.data.MusicVolume < 30) {
      const newVolume = this.data.MusicVolume + 3;
      this.setData({
        MusicVolume: newVolume
      });
      this.sendDeviceCommand();
      wx.showToast({
        title: `音量: ${newVolume}`,
        icon: 'none',
        duration: 800
      });
    } else {
      this.setData({
        MusicVolume: 30
      });
    }
  },

  decreaseVolume() {
    if (this.data.MusicVolume > 0) {
      const newVolume = this.data.MusicVolume - 3;
      this.setData({
        MusicVolume: newVolume
      });
      this.sendDeviceCommand();
      wx.showToast({
        title: `音量: ${newVolume}`,
        icon: 'none',
        duration: 800
      });
    } else {
      this.setData({
        MusicVolume: 0
      });
    }
  },

  sendDeviceCommand() {
    const config=require('../utils/config.js');
    console.log('发送设备命令:', {
      Song: this.data.MusicId,
      Volume: this.data.MusicVolume,
      State: this.data.MusicState
    });
    
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
        console.log("设备控制请求成功:", res.data);
        if (res.data.code !== 0) {
          console.error('设备控制失败:', res.data);
        }
      },
      fail: (err) => {
        console.error("设备控制请求失败:", err);
        wx.showToast({
          title: '设备连接失败',
          icon: 'none'
        });
      }
    });
  }
})