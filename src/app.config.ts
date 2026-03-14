export default defineAppConfig({
  pages: [
    'pages/brush/index',
    'pages/history/index',
    'pages/settings/index',
  ],
  tabBar: {
    color: '#999999',
    selectedColor: '#4FC3F7',
    backgroundColor: '#ffffff',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/brush/index',
        text: '刷牙',
        iconPath: 'assets/images/tab-brush.png',
        selectedIconPath: 'assets/images/tab-brush-active.png',
      },
      {
        pagePath: 'pages/history/index',
        text: '记录',
        iconPath: 'assets/images/tab-history.png',
        selectedIconPath: 'assets/images/tab-history-active.png',
      },
      {
        pagePath: 'pages/settings/index',
        text: '设置',
        iconPath: 'assets/images/tab-settings.png',
        selectedIconPath: 'assets/images/tab-settings-active.png',
      },
    ],
  },
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#4FC3F7',
    navigationBarTitleText: '刷了吗',
    navigationBarTextStyle: 'white',
  },
})
