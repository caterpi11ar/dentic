import { View, Text } from '@tarojs/components'
import { BRUSHING_STEPS } from '@/constants/brushing-steps'

type SceneMode = 'brushing' | 'paused' | 'inactive'
type BrushPattern = 'horizontal' | 'vertical' | 'diagonal-up' | 'diagonal-down' | 'sweep'
type ToothRect = { x: number; y: number; w: number; h: number }
type BristleConfig = { left: number; width: number; height: number; opacity: number }

interface Props {
  currentStepIndex: number
  isActive: boolean
  compact?: boolean
  showStepName?: boolean
  mode?: SceneMode
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
const UPPER_TEETH: ToothRect[] = (() => {
  const teeth: ToothRect[] = []
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
const LOWER_TEETH: ToothRect[] = (() => {
  const teeth: ToothRect[] = []
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

const TOOTH_CENTER_MAP: Record<number, { x: number; y: number }> = (() => {
  const map: Record<number, { x: number; y: number }> = {}
  UPPER_TEETH.forEach((tooth, idx) => {
    map[idx] = { x: tooth.x, y: tooth.y }
  })
  LOWER_TEETH.forEach((tooth, idx) => {
    map[idx + 14] = { x: tooth.x, y: tooth.y }
  })
  return map
})()

const BRUSH_ZONE_OFFSET_MAP: Record<string, { dx: number; dy: number; angle: number; pattern: BrushPattern }> = {
  'upper-outer-right': { dx: 2, dy: -10, angle: -32, pattern: 'diagonal-down' },
  'upper-outer-front': { dx: 0, dy: -8, angle: 0, pattern: 'horizontal' },
  'upper-outer-left': { dx: -2, dy: -10, angle: 32, pattern: 'diagonal-up' },
  'upper-inner-right': { dx: 8, dy: 10, angle: 35, pattern: 'diagonal-up' },
  'upper-inner-front': { dx: 0, dy: 9, angle: 90, pattern: 'vertical' },
  'upper-inner-left': { dx: -8, dy: 10, angle: -35, pattern: 'diagonal-down' },
  'upper-occlusal': { dx: 0, dy: -2, angle: 0, pattern: 'horizontal' },
  'lower-outer-right': { dx: -4, dy: 10, angle: 30, pattern: 'diagonal-up' },
  'lower-outer-front': { dx: 0, dy: 8, angle: 0, pattern: 'horizontal' },
  'lower-outer-left': { dx: 4, dy: 10, angle: -30, pattern: 'diagonal-down' },
  'lower-inner-right': { dx: -8, dy: -10, angle: -35, pattern: 'diagonal-down' },
  'lower-inner-front': { dx: 0, dy: -9, angle: 90, pattern: 'vertical' },
  'lower-inner-left': { dx: 8, dy: -10, angle: 35, pattern: 'diagonal-up' },
  'lower-occlusal': { dx: 0, dy: 0, angle: 0, pattern: 'horizontal' },
}

const BRUSH_MOTION_CLASS_MAP: Record<BrushPattern, string> = {
  horizontal: 'brush-motion-horizontal',
  vertical: 'brush-motion-vertical',
  'diagonal-up': 'brush-motion-diagonal-up',
  'diagonal-down': 'brush-motion-diagonal-down',
  sweep: 'brush-motion-sweep',
}

const BRISTLE_COLUMNS: BristleConfig[] = [
  { left: 16, width: 3, height: 8, opacity: 0.84 },
  { left: 20, width: 3, height: 9, opacity: 0.9 },
  { left: 24, width: 3, height: 10, opacity: 0.96 },
  { left: 28, width: 3, height: 10, opacity: 0.96 },
  { left: 32, width: 3, height: 9, opacity: 0.9 },
  { left: 36, width: 3, height: 8, opacity: 0.84 },
]

function getZoneCenter(zone: string): { x: number; y: number } | null {
  const indexes = ZONE_TOOTH_MAP[zone]
  if (!indexes || indexes.length === 0) return null

  let totalX = 0
  let totalY = 0
  indexes.forEach((idx) => {
    const toothCenter = TOOTH_CENTER_MAP[idx]
    if (!toothCenter) return
    totalX += toothCenter.x
    totalY += toothCenter.y
  })
  return { x: totalX / indexes.length, y: totalY / indexes.length }
}

function getBrushPose(zone: string): { x: number; y: number; angle: number; pattern: BrushPattern } | null {
  if (zone === 'tongue') {
    return { x: 140, y: 248, angle: 0, pattern: 'sweep' }
  }

  const center = getZoneCenter(zone)
  if (!center) return null

  const offset = BRUSH_ZONE_OFFSET_MAP[zone]
  if (!offset) return { x: center.x, y: center.y, angle: 0, pattern: 'horizontal' }

  return {
    x: center.x + offset.dx,
    y: center.y + offset.dy,
    angle: offset.angle,
    pattern: offset.pattern,
  }
}

export default function ToothScene({ currentStepIndex, isActive, compact = false, showStepName = true, mode }: Props) {
  const step = BRUSHING_STEPS[currentStepIndex]
  const sceneMode: SceneMode = mode ?? (isActive ? 'brushing' : 'inactive')
  const activeZone = sceneMode === 'inactive' ? null : step?.zone
  const highlightSet = new Set(activeZone ? ZONE_TOOTH_MAP[activeZone] ?? [] : [])
  const shouldShowBrush = (sceneMode === 'brushing' || sceneMode === 'paused') && !!step?.zone
  const brushPose = shouldShowBrush && step?.zone ? getBrushPose(step.zone) : null
  const brushMotionClass = sceneMode === 'brushing' && brushPose ? BRUSH_MOTION_CLASS_MAP[brushPose.pattern] : ''
  const scale = compact ? 0.84 : 1
  const sceneHeight = compact ? 254 : 290
  const sceneTop = compact ? '8px' : '10px'
  const sceneLeft = compact ? '22px' : '0px'
  const sceneWrapperPadding = compact ? 'py-2' : 'py-3'

  return (
    <View className={`w-full flex flex-col items-center ${sceneWrapperPadding}`}>
      {/* 牙齿图容器 */}
      <View className="relative" style={{ width: '280px', height: `${sceneHeight}px` }}>
        <View
          className="absolute"
          style={{
            top: sceneTop,
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

          {brushPose && (
            <View
              className="absolute z-20"
              style={{
                left: `${brushPose.x}px`,
                top: `${brushPose.y}px`,
                transform: `translate(-50%, -50%) rotate(${brushPose.angle}deg)`,
                transition: 'left 0.32s ease, top 0.32s ease, transform 0.32s ease',
              }}
            >
              <View className={`relative ${brushMotionClass}`} style={{ width: '140px', height: '52px' }}>
                <View
                  className="absolute rounded-full"
                  style={{
                    left: '48px',
                    top: '38px',
                    width: '84px',
                    height: '9px',
                    backgroundColor: 'rgba(20,34,58,0.2)',
                    filter: 'blur(1.6px)',
                  }}
                />
                <View
                  className="absolute rounded-full"
                  style={{
                    left: '56px',
                    top: '14px',
                    width: '78px',
                    height: '24px',
                    backgroundImage: 'linear-gradient(90deg, #67e8f9 0%, #60a5fa 52%, #3b82f6 100%)',
                    border: '2px solid #0b3d91',
                  }}
                />
                <View
                  className="absolute rounded-full"
                  style={{
                    left: '67px',
                    top: '20px',
                    width: '48px',
                    height: '6px',
                    backgroundColor: 'rgba(255,255,255,0.62)',
                  }}
                />
                <View
                  className="absolute rounded-full"
                  style={{
                    left: '89px',
                    top: '20px',
                    width: '10px',
                    height: '10px',
                    border: '2px solid #dbeafe',
                    backgroundColor: '#60a5fa',
                  }}
                />
                <View
                  className="absolute rounded-full"
                  style={{
                    left: '50px',
                    top: '18px',
                    width: '14px',
                    height: '14px',
                    backgroundColor: '#1e40af',
                    border: '2px solid #0b3d91',
                  }}
                />
                <View
                  className="absolute rounded-full"
                  style={{
                    left: '36px',
                    top: '20px',
                    width: '18px',
                    height: '12px',
                    border: '2px solid #0b3d91',
                    backgroundColor: '#bfdbfe',
                  }}
                />
                <View
                  className="absolute rounded-full"
                  style={{
                    left: '8px',
                    top: '10px',
                    width: '32px',
                    height: '32px',
                    backgroundColor: '#ffffff',
                    border: '2px solid #0b3d91',
                  }}
                />
                <View
                  className="absolute rounded-full"
                  style={{
                    left: '13px',
                    top: '15px',
                    width: '22px',
                    height: '22px',
                    backgroundColor: '#e0f2fe',
                    border: '1px solid rgba(56, 189, 248, 0.6)',
                  }}
                />
                {BRISTLE_COLUMNS.map((bristle) => (
                  <View
                    key={bristle.left}
                    className="absolute"
                    style={{
                      left: `${bristle.left}px`,
                      top: `${10 - bristle.height}px`,
                      width: `${bristle.width}px`,
                      height: `${bristle.height}px`,
                      borderRadius: '4px 4px 0 0',
                      backgroundColor: '#22d3ee',
                      border: '1.5px solid #0b3d91',
                      borderBottom: 'none',
                      opacity: bristle.opacity,
                    }}
                  />
                ))}
                <View
                  className="absolute rounded-full"
                  style={{
                    left: '17px',
                    top: '13px',
                    width: '14px',
                    height: '2px',
                    backgroundColor: 'rgba(255,255,255,0.7)',
                  }}
                />
                <View
                  className="absolute rounded-full"
                  style={{
                    left: '7px',
                    top: '40px',
                    width: '34px',
                    height: '3px',
                    backgroundColor: 'rgba(20,34,58,0.16)',
                  }}
                />
              </View>
            </View>
          )}
        </View>
      </View>

      {showStepName && (
        <Text className={`text-content font-medium mt-1 text-sm ${compact ? '' : 'text-base'}`}>
          {step?.name ?? '准备开始'}
        </Text>
      )}
    </View>
  )
}
