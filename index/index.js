Component({
  data: {
    showRipple: false,
    allCardList: [
      { id: 1, name: "死别", author: "在虚无中永存/rnb脑袋", duration: "2:13" },
      { id: 2, name: "肖邦：降E大调夜曲, Op. 9 No. 2", author: "土星皇家交响乐团", duration: "3:54" },
      { id: 3, name: "肖斯塔科维奇：第二圆舞曲", author: "土星皇家交响乐团", duration: "3:44" },
      { id: 4, name: "Cogwork Core", author: "Christopher Larkin", duration: "1:30" },
      { id: 5, name: "讨厌红楼梦", author: "陶喆", duration: "4:02" },
      { id: 6, name: "找自己", author: "陶喆", duration: "5:04" },
      { id: 7, name: "才二十三", author: "方大同", duration: "3:44" },
      { id: 8, name: "红豆", author: "方大同", duration: "3:56" },
      { id: 9, name: "君の胸にLaLaLa", author: "MADOKA", duration: "3:38" },
      { id: 10, name: "Downfall", author: "Brian Cheng", duration: "4:39" }
    ],
    cardList: [],
    displayList: [],
    pageSize: 10,
    currentPage: 0,
    hasMore: true,
    searchText: '',
  },

  lifetimes: {
    attached() {
      this.loadMoreData();
      this.markFavs();
    }
  },

  methods: {
    onRippleTap() { 
      this.setData({ showRipple: true }); 
      setTimeout(() => this.setData({ showRipple: false }), 600); 
    },

    onSearchInput(e) { 
      const searchText = e.detail.value; 
      this.setData({ searchText }); 
      this.filterData(searchText); 
    },
    
    onClearSearch() { 
      this.setData({ searchText: '' }); 
      this.filterData(''); 
    },

    filterData(searchText) {
      if (!searchText) {
        this.setData({ 
          displayList: this.data.cardList, 
          hasMore: this.data.cardList.length < this.data.allCardList.length 
        });
        return;
      }
      const filtered = this.data.allCardList.filter(item => 
        item.name.toLowerCase().includes(searchText.toLowerCase())
      );
      this.setData({ displayList: filtered, hasMore: false });
    },

    loadMoreData() {
      if (!this.data.hasMore || this.data.searchText) return;
      const start = this.data.currentPage * this.data.pageSize;
      const end = start + this.data.pageSize;
      const newData = this.data.allCardList.slice(start, end);
      if (newData.length === 0) { 
        this.setData({ hasMore: false }); 
        return; 
      }
      const updatedList = [...this.data.cardList, ...newData];
      this.setData({ 
        cardList: updatedList, 
        displayList: updatedList, 
        currentPage: this.data.currentPage + 1 
      }, () => { 
        this.markFavs(); 
      });
    },

    onReachBottom() { 
      this.loadMoreData(); 
    },

    onFavTap(e) {
      const id = e.currentTarget.dataset.id;
      const name = e.currentTarget.dataset.name || '';
      const author = e.currentTarget.dataset.author || '';
      const openid = wx.getStorageSync('openid');
      
      if (!openid) {
        wx.showToast({ title: '请先登录', icon: 'none' });
        return;
      }
      
      const target = this.data.displayList.find(i => i.id === id);
      if (target._fav) {
        this.removeFavorite(openid, id);
      } else {
        this.addFavorite(openid, id, name, author);
      }
    },

    addFavorite(openid, music_id, music_name, music_author) {
      const that = this;
      const config=require('../utils/config.js');
      wx.request({
        url: `${config.DatabaseConfig.base_url}/api/add_favorite`,
        method: 'POST',
        header: { 'Content-Type': 'application/json' },
        data: { openid, music_id, music_name, music_author },
        success(res) {
          if (res.data.status === 'success') {
            wx.showToast({ title: '收藏成功', icon: 'success' });
            that.updateFavFlag(music_id, true);
          } else {
            wx.showToast({ title: res.data.msg || '收藏失败', icon: 'none' });
          }
        },
        fail(err) {
          console.error('收藏失败', err);
          wx.showToast({ title: '网络错误', icon: 'none' });
        }
      });
    },

    removeFavorite(openid, music_id) {
      const that = this;
      const config=require('../utils/config.js');
      wx.request({
        url: `${config.DatabaseConfig.base_url}/api/remove_favorite`,
        method: 'POST',
        header: { 'Content-Type': 'application/json' },
        data: { openid, music_id },
        success(res) {
          if (res.data.status === 'success') {
            wx.showToast({ title: '已取消收藏', icon: 'success' });
            that.updateFavFlag(music_id, false);
          } else {
            wx.showToast({ title: res.data.msg || '取消收藏失败', icon: 'none' });
          }
        },
        fail(err) {
          console.error('取消收藏失败', err);
          wx.showToast({ title: '网络错误', icon: 'none' });
        }
      });
    },

    updateFavFlag(id, flag) {
      const update = list => list.map(item => 
        item.id === id ? { ...item, _fav: flag } : item
      );
      this.setData({
        displayList: update(this.data.displayList),
        cardList: update(this.data.cardList)
      });
    },

    // 在 index/index.js 的 markFavs 方法中修复
markFavs() {
  const openid = wx.getStorageSync('openid');
  if (!openid) return;
  
  const that = this;
  const config=require('../utils/config.js');
  // ✅ 确保使用正确的 GET 请求方式
  const requestUrl = `${config.DatabaseConfig.base_url}/api/get_favorites?openid=${encodeURIComponent(openid)}`;
  
  wx.request({
    url: requestUrl,
    method: 'GET',
    success(res) {
      console.log('🎵 获取收藏列表响应:', res.data);
      if (res.data.status === 'success') {
        const favIds = res.data.favorites.map(f => f.music_id);
        console.log('🎵 用户收藏的歌曲ID:', favIds);
        
        const mark = list => list.map(item => ({
          ...item,
          _fav: favIds.includes(item.id)
        }));
        
        that.setData({
          displayList: mark(that.data.displayList),
          cardList: mark(that.data.cardList)
        });
        
        console.log('🎵 收藏标记完成');
      } else {
        console.error('❌ 获取收藏列表失败:', res.data.msg);
      }
    },
    fail(err) {
      console.error('❌ 获取收藏列表网络错误:', err);
    }
  });
},

    onCardTap(e) {
      const { id, name, author, duration } = e.currentTarget.dataset;
      wx.showModal({
        title: 'Start',
        content: `开始 "${name}" 的演奏？`,
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({ 
              url: `/runing/runing?MusicId=${id}&MusicName=${encodeURIComponent(name)}&MusicAuthor=${encodeURIComponent(author)}&duration=${duration}` 
            });
          }
        }
      });
    }
  },

  pageLifetimes: {
    show() {
      if (typeof this.getTabBar === 'function' && this.getTabBar()) { 
        this.getTabBar().updateSelected('/index/index');
      }
    }
  }
})