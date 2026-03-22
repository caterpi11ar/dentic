import type { BrushingStep, CameraPosition } from '../types'

// 相机位置预设
const CAM = {
  upperRight: { x: 3, y: 1.5, z: 4, lookAtY: 1 } as CameraPosition,
  upperFront: { x: 0, y: 1.5, z: 5, lookAtY: 1 } as CameraPosition,
  upperLeft: { x: -3, y: 1.5, z: 4, lookAtY: 1 } as CameraPosition,
  upperRightInner: { x: 1, y: 3, z: 2, lookAtY: 1 } as CameraPosition,
  upperFrontInner: { x: 0, y: 3, z: 2, lookAtY: 1 } as CameraPosition,
  upperLeftInner: { x: -1, y: 3, z: 2, lookAtY: 1 } as CameraPosition,
  upperTop: { x: 0, y: 5, z: 1, lookAtY: 1 } as CameraPosition,
  lowerRight: { x: 3, y: -1, z: 4, lookAtY: -0.5 } as CameraPosition,
  lowerFront: { x: 0, y: -1, z: 5, lookAtY: -0.5 } as CameraPosition,
  lowerLeft: { x: -3, y: -1, z: 4, lookAtY: -0.5 } as CameraPosition,
  lowerRightInner: { x: 1, y: -2.5, z: 2, lookAtY: -0.5 } as CameraPosition,
  lowerFrontInner: { x: 0, y: -2.5, z: 2, lookAtY: -0.5 } as CameraPosition,
  lowerLeftInner: { x: -1, y: -2.5, z: 2, lookAtY: -0.5 } as CameraPosition,
  lowerTop: { x: 0, y: -4.5, z: 1, lookAtY: -0.5 } as CameraPosition,
  tongue: { x: 0, y: -1, z: 5, lookAtY: -0.5 } as CameraPosition,
}

export const BRUSHING_STEPS: BrushingStep[] = [
  {
    id: 1,
    zone: 'upper-outer-right',
    name: '上牙外侧右',
    description: '右上外侧，牙刷45°对准牙龈线',
    prompt: '刷右上方外侧，牙刷倾斜45度',
    camera: CAM.upperRight,
  },
  {
    id: 2,
    zone: 'upper-outer-front',
    name: '上牙外侧前',
    description: '上前牙外侧',
    prompt: '刷上方门牙外侧',
    camera: CAM.upperFront,
  },
  {
    id: 3,
    zone: 'upper-outer-left',
    name: '上牙外侧左',
    description: '左上外侧',
    prompt: '刷左上方外侧',
    camera: CAM.upperLeft,
  },
  {
    id: 4,
    zone: 'upper-inner-right',
    name: '上牙内侧右',
    description: '右上内侧',
    prompt: '翻到内侧，刷右上方内侧',
    camera: CAM.upperRightInner,
  },
  {
    id: 5,
    zone: 'upper-inner-front',
    name: '上牙内侧前',
    description: '上前牙内侧，竖刷',
    prompt: '上门牙内侧，牙刷竖起来刷',
    camera: CAM.upperFrontInner,
  },
  {
    id: 6,
    zone: 'upper-inner-left',
    name: '上牙内侧左',
    description: '左上内侧',
    prompt: '刷左上方内侧',
    camera: CAM.upperLeftInner,
  },
  {
    id: 7,
    zone: 'upper-occlusal',
    name: '上牙咬合面',
    description: '上牙咬合面',
    prompt: '刷上方咬合面，来回刷',
    camera: CAM.upperTop,
  },
  {
    id: 8,
    zone: 'lower-outer-right',
    name: '下牙外侧右',
    description: '右下外侧',
    prompt: '下排牙齿，刷右下方外侧',
    camera: CAM.lowerRight,
  },
  {
    id: 9,
    zone: 'lower-outer-front',
    name: '下牙外侧前',
    description: '下前牙外侧',
    prompt: '刷下方门牙外侧',
    camera: CAM.lowerFront,
  },
  {
    id: 10,
    zone: 'lower-outer-left',
    name: '下牙外侧左',
    description: '左下外侧',
    prompt: '刷左下方外侧',
    camera: CAM.lowerLeft,
  },
  {
    id: 11,
    zone: 'lower-inner-right',
    name: '下牙内侧右',
    description: '右下内侧',
    prompt: '翻到内侧，刷右下方内侧',
    camera: CAM.lowerRightInner,
  },
  {
    id: 12,
    zone: 'lower-inner-front',
    name: '下牙内侧前',
    description: '下前牙内侧，竖刷',
    prompt: '下门牙内侧，牙刷竖起来刷',
    camera: CAM.lowerFrontInner,
  },
  {
    id: 13,
    zone: 'lower-inner-left',
    name: '下牙内侧左',
    description: '左下内侧',
    prompt: '刷左下方内侧',
    camera: CAM.lowerLeftInner,
  },
  {
    id: 14,
    zone: 'lower-occlusal',
    name: '下牙咬合面',
    description: '下牙咬合面',
    prompt: '刷下方咬合面',
    camera: CAM.lowerTop,
  },
  {
    id: 15,
    zone: 'tongue',
    name: '舌头',
    description: '刷舌面',
    prompt: '最后，轻轻刷舌头表面',
    camera: CAM.tongue,
  },
]

export const TOTAL_STEPS = BRUSHING_STEPS.length

export const COMPLETION_MESSAGES = [
  '恭喜完成！今天又坚持了一次！',
  '太棒了！牙齿闪闪发光！',
  '完美刷牙！口腔健康 +1！',
  '坚持就是胜利！你做到了！',
  '巴氏刷牙法掌握啦！牙医都夸你！',
  '好习惯养成中，继续加油！',
  '每一次刷牙，都是对自己的关爱！',
  '又一次完美刷牙，牙齿感谢你！',
  '刷牙小达人，就是你！',
  '今天的牙齿护理任务完成！',
]

export function getRandomCompletionMessage(): string {
  return COMPLETION_MESSAGES[Math.floor(Math.random() * COMPLETION_MESSAGES.length)]
}

export const MILESTONES = [3, 7, 14, 30, 60, 100, 365]
export const MILESTONE_MESSAGES: Record<number, string> = {
  3: '连续3天！好的开始！',
  7: '一周达成！习惯正在养成！',
  14: '两周坚持！你太棒了！',
  30: '一个月！刷牙达人！',
  60: '两个月！牙齿一定很健康！',
  100: '100天里程碑！',
  365: '一整年！传奇！',
}
