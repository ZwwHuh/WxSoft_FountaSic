Component({
  data: {
    selected: 0,
    color: "#7A7E83",
    selectedColor: "#3cc51f",
    list: [{
      pagePath: "/index/index",
      iconPath: "/image/icon_choise.png",
      selectedIconPath: "/image/icon_choise_HL.png",
      text: "选歌"
    },
    {
      pagePath: "/index/index2",
      iconPath: "/image/icon_home.png",
      selectedIconPath: "/image/icon_home_HL.png",
      text: "首页"
    }, 
    {
      pagePath: "/index/index3",
      iconPath: "/image/icon_user.png",
      selectedIconPath: "/image/icon_user_HL.png",
      text: "用户"
    }]
  },
  attached() {
  },
  methods: {
    switchTab(e) {
      const data = e.currentTarget.dataset
      const url = data.path
      wx.switchTab({url})
      this.setData({
        selected: data.index
      })
    }
  }
})