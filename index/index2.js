const app = getApp();
Component({
  data: {
    mode: 'single',
    rankList: [],
    userRank: null,
    userScore: null
  },

  pageLifetimes: {
    show() {
      if (typeof this.getTabBar === 'function' && this.getTabBar()) {
        this.getTabBar().updateSelected('/index/index2');
      }
      this.loadRankData();
    }
  },

  methods: {
    setMode(e) {
      const mode = e.currentTarget.dataset.mode;
      this.setData({ mode });
      this.loadRankData();
    },

    loadRankData() {
      const mode = this.data.mode;
      const config=require('../utils/config.js');
      const url = `${config.DatabaseConfig.base_url}/api/get_rank?mode=${mode}`;

      wx.request({
        url,
        method: 'GET',
        header: { 'Content-Type': 'application/json' },
        success: (res) => {
          if (res.statusCode === 200 && res.data.rankList) {
            const openid = wx.getStorageSync('openid');
            let userRank = null;
            let userScore = null;
            
            if (openid) {
              const userEntry = res.data.rankList.find(item => item.openid === openid);
              if (userEntry) {
                userRank = userEntry.rank;
                userScore = userEntry.score;
              }
            }
            
            this.setData({ 
              rankList: res.data.rankList,
              userRank,
              userScore
            });
            
            // 优化：添加空榜提示
            if (res.data.rankList.length === 0) {
              wx.showToast({ 
                title: '暂无排行榜数据', 
                icon: 'none',
                duration: 2000
              });
            }
          } else {
            wx.showToast({ title: '获取排行榜失败', icon: 'none' });
          }
        },
        fail: (err) => {
          console.error('排行榜获取失败:', err);
          wx.showToast({ title: '服务器连接失败', icon: 'none' });
        }
      });
    },

    uploadScore(score, mode) {
      const openid = wx.getStorageSync('openid');
      const nickname = wx.getStorageSync('nickname') || '匿名用户';
      const avatarUrl = wx.getStorageSync('avatarUrl') || '';
      const config=require('../utils/config.js');
      if (!openid) {
        console.log('用户未登录，无法上传成绩');
        return;
      }

      wx.request({
        url: `${config.DatabaseConfig.base_url}/api/get_rankings`,
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
        },
        fail: (err) => {
          console.error('成绩上传失败:', err);
        }
      });
    }
  }
})