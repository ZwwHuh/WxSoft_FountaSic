Component({
  data: {
    userInfo: {
      avatarUrl: '',
      nickName: ''
    },
    menuList: [
      { id: 1, title: 'OPT1' },
      { id: 2, title: 'OPT2' },
      { id: 3, title: 'OPT3' },
      { id: 4, title: 'OPT4' },
    ]
  },

  lifetimes: {
    attached: function() {
      this.loadUserInfo();
    }
  },
  methods: {
    loadUserInfo: function() {
      const app = getApp();
      console.log('加载用户信息:', app.globalData);
      this.setData({
        'userInfo.avatarUrl': app.globalData.avatarUrl || 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0',
        'userInfo.nickName': app.globalData.nickname || '用户'
      });
    }
  },

  pageLifetimes: {
    show() {
      // 每次页面显示时重新加载用户信息
      this.loadUserInfo();
      if (typeof this.getTabBar === 'function' && this.getTabBar()) {
        this.getTabBar().setData({
          selected: 2 
        });
      }
    }
  }
})