Component({
  data: {
    selected: 0,
    color: "#7A7E83",
    selectedColor: "#007AFF",
    list: [
      {
        pagePath: "/index/index",
        iconPath: "/image/icon_choise.png",
        selectedIconPath: "/image/icon_choise_HL.png",
        text: "选歌"
      },
      {
        pagePath: "/index/index2",
        iconPath: "/image/icon_home.png",
        selectedIconPath: "/image/icon_home_HL.png",
        text: "排行榜"
      },
      {
        pagePath: "/index/favorites/favorites",
        iconPath: "/image/tab_fav.png",
        selectedIconPath: "/image/tab_fav_active.png",
        text: "收藏"
      },
      {
        pagePath: "/index/index3",
        iconPath: "/image/icon_user.png",
        selectedIconPath: "/image/icon_user_HL.png",
        text: "用户"
      }
    ]
  },

  methods: {
    switchTab(e) {
      const data = e.currentTarget.dataset
      const url = data.path
      wx.switchTab({ url })
      this.setData({
        selected: data.index
      })
    },

    updateSelected(route) {
      const list = this.data.list
      const normalizedRoute = route.replace(/^\//, '');
      for (let i = 0; i < list.length; i++) {
        const pagePath = list[i].pagePath.replace(/^\//, '');
        if (pagePath === normalizedRoute) {
          this.setData({ selected: i })
          break
        }
      }
    }
  }
})