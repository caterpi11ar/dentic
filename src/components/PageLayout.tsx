import type { PropsWithChildren } from 'react'
import { View } from '@tarojs/components'
import { cn } from '@/components/ui/cn'
import { usePageTransition } from '@/motion'

interface PageLayoutProps extends PropsWithChildren {
  className?: string
  scroll?: boolean
}

export default function PageLayout({ className, scroll, children }: PageLayoutProps) {
  const pageTransition = usePageTransition()

  return (
    <View className={cn('theme-page theme-day min-h-screen', scroll && 'app-scroll')}>
      <View
        className={cn(
          'px-page-x pt-12 pb-bottom-safe max-w-2xl mx-auto',
          scroll ? 'min-h-screen' : 'h-screen overflow-hidden flex flex-col',
          pageTransition.className,
          className,
        )}
        style={pageTransition.style}
      >
        {children}
      </View>
    </View>
  )
}
