import Taro from '@tarojs/taro'

export function applyLightThemeToChrome(): void {
  Taro.setNavigationBarColor({
    frontColor: '#000000',
    backgroundColor: '#faf9f5',
    animation: { duration: 180, timingFunc: 'easeIn' },
  }).catch(() => {})
}
