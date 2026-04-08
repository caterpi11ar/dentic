import { Text, View } from '@tarojs/components'
import { cn } from '@/components/ui/cn'
import { BRUSHING_STEPS } from '@/constants/brushing-steps'

type SceneMode = 'brushing' | 'paused' | 'inactive'
interface ToothCircle { x: number, y: number, size: number }

interface Props {
  currentStepIndex: number
  isActive: boolean
  compact?: boolean
  showStepName?: boolean
  mode?: SceneMode
}

/**
 * 牙齿区域 → 对应的 tooth index
 * 上排 0~13（左→右），下排 14~27（右→左）
 */
const ZONE_TOOTH_MAP: Record<string, number[]> = {
  'upper-outer-right': [10, 11, 12, 13],
  'upper-outer-front': [4, 5, 6, 7, 8, 9],
  'upper-outer-left': [0, 1, 2, 3],
  'upper-inner-right': [10, 11, 12, 13],
  'upper-inner-front': [4, 5, 6, 7, 8, 9],
  'upper-inner-left': [0, 1, 2, 3],
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
const UPPER_TEETH: ToothCircle[] = (() => {
  const teeth: ToothCircle[] = []
  const cx = 140
  const cy = 100
  const rx = 112
  const ry = 82
  const count = 14
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1)
    const angle = Math.PI - t * Math.PI
    const isFront = i >= 4 && i <= 9
    teeth.push({
      x: cx + Math.cos(angle) * rx,
      y: cy - Math.sin(angle) * ry,
      size: isFront ? 30 : 34,
    })
  }
  return teeth
})()

/** 下排 14 颗牙齿的位置（俯视 U 形，开口朝上） */
const LOWER_TEETH: ToothCircle[] = (() => {
  const teeth: ToothCircle[] = []
  const cx = 140
  const cy = 192
  const rx = 107
  const ry = 78
  const count = 14
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1)
    const angle = t * Math.PI
    const isFront = i >= 4 && i <= 9
    teeth.push({
      x: cx + Math.cos(angle) * rx,
      y: cy + Math.sin(angle) * ry,
      size: isFront ? 30 : 34,
    })
  }
  return teeth
})()

export default function ToothScene({ currentStepIndex, isActive, compact = false, showStepName = true, mode }: Props) {
  const step = BRUSHING_STEPS[currentStepIndex]
  const sceneMode: SceneMode = mode ?? (isActive ? 'brushing' : 'inactive')
  const activeZone = sceneMode === 'inactive' ? null : step?.zone
  const highlightSet = new Set(activeZone ? ZONE_TOOTH_MAP[activeZone] ?? [] : [])
  const scale = compact ? 0.84 : 1
  const sceneHeight = compact ? 268 : 310
  const sceneTop = compact ? '8px' : '10px'
  const sceneLeft = compact ? '22px' : '0px'
  const sceneWrapperPadding = compact ? 'py-2' : 'py-3'

  return (
    <View className={cn('w-full flex flex-col items-center', sceneWrapperPadding)}>
      <View className="relative" style={{ width: '280px', height: `${sceneHeight}px` }}>
        <View
          className="absolute"
          style={{
            top: sceneTop,
            left: sceneLeft,
            width: '280px',
            height: '300px',
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
        >
          {/* 上排牙齿 */}
          {UPPER_TEETH.map((t, i) => {
            const lit = highlightSet.has(i)
            return (
              <View
                key={`u${i}`}
                className="absolute"
                style={{
                  left: `${t.x - t.size / 2}px`,
                  top: `${t.y - t.size / 2}px`,
                  width: `${t.size}px`,
                  height: `${t.size}px`,
                  borderRadius: '50%',
                  backgroundColor: lit ? '#c96442' : '#faf9f5',
                  border: lit ? '1.5px solid #a85232' : '1.5px solid #f0eee6',
                  boxShadow: '0px 0px 0px 1px rgba(240,238,230,1)',
                  transition: 'background-color 0.3s',
                  zIndex: Math.round(7 - Math.abs(i - 6.5)),
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
                  left: `${t.x - t.size / 2}px`,
                  top: `${t.y - t.size / 2}px`,
                  width: `${t.size}px`,
                  height: `${t.size}px`,
                  borderRadius: '50%',
                  backgroundColor: lit ? '#c96442' : '#faf9f5',
                  border: lit ? '1.5px solid #a85232' : '1.5px solid #f0eee6',
                  boxShadow: '0px 0px 0px 1px rgba(240,238,230,1)',
                  transition: 'background-color 0.3s',
                  zIndex: Math.round(7 - Math.abs(i - 6.5)),
                }}
              />
            )
          })}
        </View>
      </View>

      {showStepName && (
        <Text className={cn('text-content font-medium mt-1 text-sm', !compact && 'text-base')}>
          {step?.name ?? '准备开始'}
        </Text>
      )}
    </View>
  )
}
