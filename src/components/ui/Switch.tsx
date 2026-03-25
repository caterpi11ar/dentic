import { View } from '@tarojs/components'
import { cn } from '@/components/ui/cn'

interface SwitchProps {
  checked: boolean
  onClick: () => void
  ariaLabel: string
}

export default function Switch({ checked, onClick, ariaLabel }: SwitchProps) {
  return (
    <View
      className={cn('w-12 h-7 rounded-full relative transition-colors duration-200', checked ? 'bg-primary' : 'bg-line')}
      onClick={onClick}
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
    >
      <View
        className={cn(
          'absolute top-0.5 left-0.5 size-6 rounded-full bg-surface-white border border-line-light shadow-card transition-transform duration-200',
          checked ? 'translate-x-5' : 'translate-x-0'
        )}
      />
    </View>
  )
}
