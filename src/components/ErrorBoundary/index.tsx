import type { ReactNode } from 'react'
import { Text, View } from '@tarojs/components'
import { Component } from 'react'

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
          <View className="flex items-center justify-center min-h-24 bg-content/[0.03] rounded-anthropic border border-content/[0.06]" role="alert">
            <Text className="text-paragraph-sm text-content/50">加载失败，请重试</Text>
          </View>
        )
      )
    }
    return this.props.children
  }
}
