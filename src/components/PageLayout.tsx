import { View } from '@tarojs/components'
import type { PropsWithChildren } from 'react'
import { cn } from '@/components/ui/cn'

interface PageLayoutProps extends PropsWithChildren {
  className?: string
  scroll?: boolean
}

export default function PageLayout({ className, scroll, children }: PageLayoutProps) {
  return (
    <View className={cn('theme-page theme-day min-h-screen', scroll && 'app-scroll')}>
      <View
        className={cn(
          'px-page-x pt-12 pb-bottom-safe max-w-2xl mx-auto',
          scroll ? 'min-h-screen' : 'h-screen overflow-hidden flex flex-col',
          className
        )}
      >
        {children}
      </View>
    </View>
  )
}
