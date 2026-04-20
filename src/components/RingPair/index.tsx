import type { ReactNode } from 'react'
import { View } from '@tarojs/components'
import { cn } from '@/components/ui/cn'

interface RingPairProps {
  morning: boolean
  evening: boolean
  size: number
  variant?: 'filled' | 'skeleton'
  ringWidth?: number
  innerRingWidth?: number
  gap?: number
  className?: string
  children?: ReactNode
}

const SURFACE_WHITE = 'rgb(var(--twc-surface-white))'
const COLOR_MORNING = 'var(--color-morning, #EAB196)'
const COLOR_EVENING = 'var(--color-evening, #c96442)'
const COLOR_LINE = 'var(--color-line, #f0eee6)'
const COLOR_LINE_LIGHTER = 'var(--color-line-lighter, #f6f5f0)'

function defaultDims(size: number) {
  if (size <= 48)
    return { outer: 5, inner: 4, gap: 0 }
  return {
    outer: Math.round(size * 0.08),
    inner: Math.round(size * 0.07),
    gap: 0,
  }
}

function describeState(morning: boolean, evening: boolean, variant: 'filled' | 'skeleton'): string {
  if (variant === 'skeleton')
    return ''
  const m = morning ? '早晨已刷牙' : '早晨未刷牙'
  const e = evening ? '夜晚已刷牙' : '夜晚未刷牙'
  return `${m}，${e}`
}

export default function RingPair({
  morning,
  evening,
  size,
  variant = 'filled',
  ringWidth,
  innerRingWidth,
  gap,
  className,
  children,
}: RingPairProps) {
  const dims = defaultDims(size)
  const outer = ringWidth ?? dims.outer
  const inner = innerRingWidth ?? dims.inner
  const actualGap = gap ?? dims.gap

  const morningColor = variant === 'skeleton'
    ? COLOR_LINE_LIGHTER
    : morning ? COLOR_MORNING : COLOR_LINE

  const eveningColor = variant === 'skeleton'
    ? COLOR_LINE_LIGHTER
    : evening ? COLOR_EVENING : COLOR_LINE

  const gapDiameter = size - 2 * outer
  const innerDiameter = gapDiameter - 2 * actualGap
  const centerDiameter = innerDiameter - 2 * inner

  const ariaLabel = describeState(morning, evening, variant)

  return (
    <View
      className={cn('relative rounded-full flex items-center justify-center', className)}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: morningColor,
      }}
      role="img"
      aria-label={ariaLabel}
    >
      <View
        className="rounded-full flex items-center justify-center"
        style={{
          width: `${gapDiameter}px`,
          height: `${gapDiameter}px`,
          backgroundColor: SURFACE_WHITE,
        }}
      >
        <View
          className="rounded-full flex items-center justify-center"
          style={{
            width: `${innerDiameter}px`,
            height: `${innerDiameter}px`,
            backgroundColor: eveningColor,
          }}
        >
          <View
            className="rounded-full flex items-center justify-center"
            style={{
              width: `${centerDiameter}px`,
              height: `${centerDiameter}px`,
              backgroundColor: SURFACE_WHITE,
            }}
          >
            {children}
          </View>
        </View>
      </View>
    </View>
  )
}
