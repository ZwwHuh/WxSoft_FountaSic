Component({
  data: {
    showRipple: false,
    usercode:null,
    allCardList: [
      { "id": 1, "name": "死别", "author": "在虚无中永存/rnb脑袋", "duration": "2:13" },
      { "id": 2, "name": "肖邦：降E大调夜曲, Op. 9 No. 2", "author": "土星皇家交响乐团", "duration": "3:54" },
      { "id": 3, "name": "肖斯塔科维奇：第二圆舞曲", "author": "土星皇家交响乐团", "duration": "3:44" },
      { "id": 4, "name": "Cogwork Core", "author": "Christopher Larkin", "duration": "1:30" },
      { "id": 5, "name": "讨厌红楼梦", "author": "陶喆", "duration": "4:02" },
      { "id": 6, "name": "找自己", "author": "陶喆", "duration": "5:04" },
      { "id": 7, "name": "才二十三", "author": "方大同", "duration": "3:44" },
      { "id": 8, "name": "红豆", "author": "方大同", "duration": "3:56" },
      { "id": 9, "name": "君の胸にLaLaLa", "author": "MADOKA", "duration": "3:38" },
      { "id": 10, "name": "Downfall", "author": "Brian Cheng", "duration": "4:39" }
    ],
    cardList: [],
    displayList: [],
    pageSize: 10,
    currentPage: 0,
    hasMore: true,
    searchText: ''
  },
  onLoad(options) {
    usercode:options.usercode
  },
  methods: {
    onRippleTap(e) {
      this.setData({
        showRipple: true
      });

      setTimeout(() => {
        this.setData({
          showRipple: false
        });
      }, 600);
    },
    onLoad() {
      // 初始化加载第一页数据
      this.loadMoreData();
    },
    // 搜索输入事件
    onSearchInput(e) {
      const searchText = e.detail.value;
      this.setData({ searchText });
      this.filterData(searchText);
    },

    // 清除搜索
    onClearSearch() {
      this.setData({ searchText: '' });
      this.filterData('');
    },

    // 过滤数据
    filterData(searchText) {
      if (!searchText) {
        // 没有搜索文本，恢复分页显示
        this.setData({
          displayList: this.data.cardList,
          hasMore: this.data.cardList.length < this.data.allCardList.length
        });
        return;
      }

      // 过滤包含搜索文本的数据
      const filteredList = this.data.allCardList.filter(item => 
        item.name.toLowerCase().includes(searchText.toLowerCase())
      );
      
      this.setData({
        displayList: filteredList,
        hasMore: false // 搜索状态下不显示加载更多
      });
    },

    // 加载更多数据
    loadMoreData() {
      if (!this.data.hasMore || this.data.searchText) return;
      
      const start = this.data.currentPage * this.data.pageSize;
      const end = start + this.data.pageSize;
      const newData = this.data.allCardList.slice(start, end);
      
      // 如果没有新数据了
      if (newData.length === 0) {
        this.setData({ hasMore: false });
        return;
      }
      
      // 合并数据
      const updatedCardList = [...this.data.cardList, ...newData];
      this.setData({
        cardList: updatedCardList,
        displayList: updatedCardList,
        currentPage: this.data.currentPage + 1
      });
    },

    // 上拉触底事件
    onReachBottom() {
      this.loadMoreData();
    },

    onCardTap(e) {
      const name = e.currentTarget.dataset.name;
      const id=e.currentTarget.dataset.id;
      const author=e.currentTarget.dataset.author;
      const duration=e.currentTarget.dataset.duration;
      wx.showModal({
        title: 'Start',
        content: ` 开始"${name}"的演奏？ `,
        showCancel: true,
        cancelText: '否',
        confirmText: '是',
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({
              url: `/index/runing?MusicId=${id}&MusicName=${name}&MusicAuthor=${author}&duration=${duration}`,
            })
          }
        }
      });
    },

    onLongPress(e) {
      // 长按不触发任何操作
    }
  },

  pageLifetimes: {
    show() {
      if (typeof this.getTabBar === 'function') {
        this.getTabBar((tabBar) => {
          tabBar.setData({
            selected: 0
          });
        });
      }
    }
  }
})