import Taro from '@tarojs/taro'

export function setBrushScreenWakeLock(active: boolean): void {
  Taro.setKeepScreenOn({ keepScreenOn: active }).catch(() => {})
}
