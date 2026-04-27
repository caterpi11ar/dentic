export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/history/index',
    'pages/family/index',
    'pages/family/create',
    'pages/family/join',
    'pages/rank/index',
    'pages/profile/index',
    'pages/achievements/index',
  ],
  window: {
    navigationStyle: 'custom',
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#faf9f5',
    navigationBarTitleText: '今天刷牙了吗 | 刷牙',
    navigationBarTextStyle: 'black',
  },
  permission: {
    'scope.userLocation': {
      desc: '用于获取当地天气信息',
    },
  },
  requiredPrivateInfos: ['getLocation'],
})
