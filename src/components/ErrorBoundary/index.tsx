import { Component } from 'react'
import type { ReactNode } from 'react'
import { View, Text } from '@tarojs/components'

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
    console.error('错误边界捕获到异常：', error)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <View className="flex items-center justify-center min-h-24 bg-gradient-to-b from-primary-light to-surface rounded-2xl" role="alert">
            <Text className="text-sm text-content-secondary">加载失败，请重试</Text>
          </View>
        )
      )
    }
    return this.props.children
  }
}
