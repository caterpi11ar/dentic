import { Component } from 'react'
import type { ReactNode } from 'react'
import { View, Text } from '@tarojs/components'
import styles from './index.module.scss'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error) {
    console.error('ErrorBoundary caught:', error)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <View className={styles.fallback} role="alert">
            <Text className={styles.fallbackText}>加载失败，请重试</Text>
          </View>
        )
      )
    }
    return this.props.children
  }
}
