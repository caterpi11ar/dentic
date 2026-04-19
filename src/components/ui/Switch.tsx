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
      className={cn('w-10 h-6 rounded-full relative transition-colors duration-300', checked ? 'bg-primary' : 'bg-content/[0.15]')}
      onClick={onClick}
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
    >
      <View
        className={cn(
          'absolute top-0.5 left-0.5 size-5 rounded-full bg-surface-white border border-line/80 transition-transform duration-300',
          checked ? 'translate-x-4' : 'translate-x-0',
        )}
      />
    </View>
  )
}
