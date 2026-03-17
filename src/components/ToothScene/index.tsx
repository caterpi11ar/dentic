import { View, Text } from '@tarojs/components'
import { BRUSHING_STEPS } from '../../constants/brushing-steps'

interface Props {
  currentStepIndex: number
  isActive: boolean
  compact?: boolean
}

/**
 * 牙齿区域 → 对应的 tooth index
 * 上排 0~13（右→左），下排 14~27（右→左）
 */
const ZONE_TOOTH_MAP: Record<string, number[]> = {
  'upper-outer-right': [0, 1, 2, 3],
  'upper-outer-front': [4, 5, 6, 7, 8, 9],
  'upper-outer-left': [10, 11, 12, 13],
  'upper-inner-right': [0, 1, 2, 3],
  'upper-inner-front': [4, 5, 6, 7, 8, 9],
  'upper-inner-left': [10, 11, 12, 13],
  'upper-occlusal': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
  'lower-outer-right': [14, 15, 16, 17],
  'lower-outer-front': [18, 19, 20, 21, 22, 23],
  'lower-outer-left': [24, 25, 26, 27],
  'lower-inner-right': [14, 15, 16, 17],
  'lower-inner-front': [18, 19, 20, 21, 22, 23],
  'lower-inner-left': [24, 25, 26, 27],
  'lower-occlusal': [14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27],
  'tongue': [14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27],
}

/** 上排 14 颗牙齿的位置（俯视 U 形，开口朝下） */
const UPPER_TEETH: { x: number; y: number; w: number; h: number }[] = (() => {
  const teeth: { x: number; y: number; w: number; h: number }[] = []
  const cx = 140
  const cy = 100
  const rx = 100
  const ry = 72
  const count = 14
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1)
    // 从右到左：180° → 0°（上半弧）
    const angle = Math.PI - t * Math.PI
    const isFront = i >= 4 && i <= 9
    teeth.push({
      x: cx + Math.cos(angle) * rx,
      y: cy - Math.sin(angle) * ry,
      w: isFront ? 15 : 18,
      h: isFront ? 20 : 17,
    })
  }
  return teeth
})()

/** 下排 14 颗牙齿的位置（俯视 U 形，开口朝上） */
const LOWER_TEETH: { x: number; y: number; w: number; h: number }[] = (() => {
  const teeth: { x: number; y: number; w: number; h: number }[] = []
  const cx = 140
  const cy = 170
  const rx = 95
  const ry = 68
  const count = 14
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1)
    // 从右到左：0° → 180°（下半弧）
    const angle = t * Math.PI
    const isFront = i >= 4 && i <= 9
    teeth.push({
      x: cx + Math.cos(angle) * rx,
      y: cy + Math.sin(angle) * ry,
      w: isFront ? 15 : 18,
      h: isFront ? 20 : 17,
    })
  }
  return teeth
})()

export default function ToothScene({ currentStepIndex, isActive, compact = false }: Props) {
  const step = BRUSHING_STEPS[currentStepIndex]
  const activeZone = isActive ? step?.zone : null
  const highlightSet = new Set(activeZone ? ZONE_TOOTH_MAP[activeZone] ?? [] : [])
  const scale = compact ? 0.84 : 1
  const sceneHeight = compact ? 236 : 270
  const sceneLeft = compact ? '22px' : '0px'
  const sceneWrapperPadding = compact ? 'py-2' : 'py-3'

  return (
    <View className={`w-full flex flex-col items-center ${sceneWrapperPadding}`}>
      {/* 牙齿图容器 */}
      <View className="relative overflow-hidden" style={{ width: '280px', height: `${sceneHeight}px` }}>
        <View
          className="absolute top-0"
          style={{
            left: sceneLeft,
            width: '280px',
            height: '270px',
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
        >
          {/* 上排牙龈背景 */}
          <View
            className="absolute rounded-full"
            style={{
              left: '15px',
              top: '5px',
              width: '250px',
              height: '155px',
              borderRadius: '125px 125px 60px 60px',
              backgroundColor: 'rgba(255,176,196,0.25)',
            }}
          />
          {/* 下排牙龈背景 */}
          <View
            className="absolute"
            style={{
              left: '20px',
              top: '115px',
              width: '240px',
              height: '150px',
              borderRadius: '60px 60px 120px 120px',
              backgroundColor: 'rgba(255,176,196,0.25)',
            }}
          />

          {/* 上排牙齿 */}
          {UPPER_TEETH.map((t, i) => {
            const lit = highlightSet.has(i)
            return (
              <View
                key={`u${i}`}
                className="absolute"
                style={{
                  left: `${t.x - t.w / 2}px`,
                  top: `${t.y - t.h / 2}px`,
                  width: `${t.w}px`,
                  height: `${t.h}px`,
                  borderRadius: '5px',
                  backgroundColor: lit ? 'var(--color-primary)' : 'rgb(var(--twc-surface-white))',
                  border: lit ? '2px solid var(--color-primary-dark)' : '1.5px solid rgb(var(--twc-line))',
                  transition: 'background-color 0.3s, border-color 0.3s',
                }}
              />
            )
          })}

          {/* 下排牙齿 */}
          {LOWER_TEETH.map((t, i) => {
            const idx = i + 14
            const lit = highlightSet.has(idx)
            return (
              <View
                key={`l${i}`}
                className="absolute"
                style={{
                  left: `${t.x - t.w / 2}px`,
                  top: `${t.y - t.h / 2}px`,
                  width: `${t.w}px`,
                  height: `${t.h}px`,
                  borderRadius: '5px',
                  backgroundColor: lit ? 'var(--color-primary)' : 'rgb(var(--twc-surface-white))',
                  border: lit ? '2px solid var(--color-primary-dark)' : '1.5px solid rgb(var(--twc-line))',
                  transition: 'background-color 0.3s, border-color 0.3s',
                }}
              />
            )
          })}
        </View>
      </View>

      {/* 当前区域名 */}
      <Text className={`text-content font-medium mt-1 ${compact ? 'text-xs' : 'text-sm'}`}>
        {step?.name ?? '准备开始'}
      </Text>
    </View>
  )
}
