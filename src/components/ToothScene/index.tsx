import { useEffect, useRef, useState } from 'react'
import { Canvas, View, Text } from '@tarojs/components'
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
  const [initFailed, setInitFailed] = useState(false)

  useReady(() => {
    const query = Taro.createSelectorQuery()
    query
      .select('#toothCanvas')
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res[0]) {
          setInitFailed(true)
          return
        }
        const canvas = res[0].node
        const width = res[0].width
        const h = res[0].height

        if (canvas) {
          try {
            managerRef.current = new ToothSceneManager(canvas, width, h)
            setReady(true)
          } catch (e) {
            console.error('ToothScene init failed:', e)
            setInitFailed(true)
          }
        } else {
          setInitFailed(true)
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

  const step = BRUSHING_STEPS[currentStepIndex]

  if (initFailed) {
    return (
      <View className={styles.fallback} style={{ height: `${height}rpx` }}>
        <Text className={styles.fallbackZone}>{step?.name ?? '刷牙中'}</Text>
        <Text className={styles.fallbackPrompt}>{step?.prompt ?? ''}</Text>
      </View>
    )
  }

  return (
    <View className={styles.container} style={{ height: `${height}rpx` }}>
      <Canvas
        type="webgl"
        id="toothCanvas"
        className={styles.canvas}
        aria-label="牙齿3D模型"
      />
      {!ready && <View className={styles.loading}>加载中\u2026</View>}
    </View>
  )
}
