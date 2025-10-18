Page({
  data: {
    apiBaseUrl: 'https://ingrid-unencroached-unhumanly.ngrok-free.dev',
    favoriteList: [],
    openid: '',
    isLoading: true,
    hasError: false,
    errorMsg: ''
  },

  onLoad() {
    console.log('🎵 收藏页面 onLoad');
    const openid = wx.getStorageSync('openid');
    this.setData({ openid });
  },

  onShow() {
    console.log('🎵 收藏页面 onShow');
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().updateSelected('/index/favorites/favorites');
    }
    this.loadFavorites();
  },

  loadFavorites() {
    const that = this;
    const openid = wx.getStorageSync('openid');
    
    console.log('🎵 开始加载收藏列表，openid:', openid);
    
    if (!openid) {
      this.setData({ 
        isLoading: false, 
        hasError: true,
        errorMsg: '请先登录 (´･ω･`)'
      });
      return;
    }

    this.setData({ 
      isLoading: true,
      hasError: false,
      errorMsg: ''
    });

    // ✅ 使用 GET 请求，openid 作为查询参数
    const requestUrl = `${this.data.apiBaseUrl}/api/get_favorites?openid=${encodeURIComponent(openid)}`;
    console.log('🎵 请求URL:', requestUrl);

    wx.request({
      url: requestUrl,
      method: 'GET',
      success: (res) => {
        console.log('🎵 收藏列表响应:', res);
        
        that.setData({ isLoading: false });

        if (res.statusCode === 200) {
          if (res.data.status === 'success') {
            const favorites = res.data.favorites || [];
            console.log('🎵 成功加载收藏:', favorites);
            
            that.setData({ 
              favoriteList: favorites,
              hasError: false
            });
          } else {
            that.setData({ 
              hasError: true,
              errorMsg: res.data.msg || '加载失败 (；ω；)'
            });
            console.error('❌ 收藏列表加载失败:', res.data);
          }
        } else {
          that.setData({ 
            hasError: true,
            errorMsg: `服务器错误: ${res.statusCode} (´；ω；｀)`
          });
        }
      },
      fail: (err) => {
        console.error('❌ 网络请求失败:', err);
        that.setData({ 
          isLoading: false,
          hasError: true,
          errorMsg: `网络错误: ${err.errMsg || '未知错误'} (；´Д｀)`
        });
      }
    });
  },

  onRemoveFavorite(e) {
    const music = e.currentTarget.dataset.music;
    const that = this;

    wx.showModal({
      title: '取消收藏',
      content: `确定取消收藏 "${music.music_name}" 吗？`,
      success: (res) => {
        if (res.confirm) {
          wx.request({
            url: `${that.data.apiBaseUrl}/api/remove_favorite`,
            method: 'POST',
            header: { 'Content-Type': 'application/json' },
            data: {
              openid: that.data.openid,
              music_id: music.music_id
            },
            success: (res) => {
              console.log('取消收藏响应:', res.data);
              if (res.data.status === 'success') {
                wx.showToast({ 
                  title: '已取消收藏', 
                  icon: 'success' 
                });
                // 更新列表
                that.setData({
                  favoriteList: that.data.favoriteList.filter(item => 
                    item.music_id !== music.music_id
                  )
                });
              } else {
                wx.showToast({ 
                  title: res.data.msg || '操作失败', 
                  icon: 'none' 
                });
              }
            },
            fail: (err) => {
              console.error('取消收藏失败:', err);
              wx.showToast({ 
                title: '网络错误', 
                icon: 'none' 
              });
            }
          });
        }
      }
    });
  },

  playMusic(e) {
    const song = e.currentTarget.dataset.song;
    console.log('播放歌曲:', song);
    wx.navigateTo({
      url: `/runing/runing?MusicId=${song.music_id}&MusicName=${encodeURIComponent(song.music_name)}&MusicAuthor=${encodeURIComponent(song.music_author || '未知作者')}`
    });
  },

  onRefresh() {
    console.log('手动刷新收藏列表');
    this.loadFavorites();
  },

  onRetry() {
    console.log('重试加载收藏列表');
    this.loadFavorites();
  }
});