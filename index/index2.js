Component({
  lifetimes: {
    attached: function() {
    }
  },

  pageLifetimes: {
    show: function() {
      if (typeof this.getTabBar === 'function') {
        this.getTabBar((tabBar) => {
          tabBar.setData({
            selected: 1
          });
        });
      }
    },
    hide: function() {
      
    }
  }
});