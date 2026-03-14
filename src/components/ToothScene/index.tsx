import { useEffect, useRef, useState } from 'react'
import { Canvas } from '@tarojs/components'
import Taro, { useReady } from '@tarojs/taro'
import { ToothSceneManager } from './tooth-model'
import { BRUSHING_STEPS } from '../../constants/brushing-steps'
import styles from './index.module.scss'

interface Props {
  currentStepIndex: number
  isActive: boolean
  height?: number
}

export default function ToothScene({ currentStepIndex, isActive, height = 400 }: Props) {
  const managerRef = useRef<ToothSceneManager | null>(null)
  const [ready, setReady] = useState(false)

  useReady(() => {
    const query = Taro.createSelectorQuery()
    query
      .select('#toothCanvas')
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res[0]) return
        const canvas = res[0].node
        const width = res[0].width
        const h = res[0].height

        if (canvas) {
          try {
            managerRef.current = new ToothSceneManager(canvas, width, h)
            setReady(true)
          } catch (e) {
            console.error('ToothScene init failed:', e)
          }
        }
      })
  })

  // 步骤变化时更新高亮和相机
  useEffect(() => {
    if (!managerRef.current || !isActive) return
    const step = BRUSHING_STEPS[currentStepIndex]
    if (step) {
      managerRef.current.highlightZone(currentStepIndex)
      managerRef.current.rotateToZone(step.camera)
    }
  }, [currentStepIndex, isActive])

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      managerRef.current?.dispose()
      managerRef.current = null
    }
  }, [])

  return (
    <view className={styles.container} style={{ height: `${height}rpx` }}>
      <Canvas
        type="webgl"
        id="toothCanvas"
        className={styles.canvas}
        style={{ width: '100%', height: '100%' }}
      />
      {!ready && <view className={styles.loading}>加载中...</view>}
    </view>
  )
}
