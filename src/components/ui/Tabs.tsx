import { View, Text } from '@tarojs/components'
import { cn } from '@/components/ui/cn'

export interface TabOption<T extends string = string> {
  value: T
  label: string
  disabled?: boolean
}

export interface TabsProps<T extends string = string> {
  value: T
  options: Array<TabOption<T>>
  onValueChange: (value: T) => void
  className?: string
  size?: 'sm' | 'md'
}

const SIZE_CLASS: Record<NonNullable<TabsProps['size']>, string> = {
  sm: 'min-h-9 px-3 rounded-md',
  md: 'min-h-10 px-4 rounded-lg',
}

export default function Tabs<T extends string>({
  value,
  options,
  onValueChange,
  className,
  size = 'sm',
}: TabsProps<T>) {
  return (
    <View className={cn('inline-flex items-center rounded-lg border border-line-light bg-surface p-0.5', className)} role="tablist">
      {options.map((option) => {
        const active = value === option.value
        const disabled = option.disabled

        return (
          <View
            key={option.value}
            className={cn(
              'flex items-center justify-center min-w-[68px] transition-colors duration-150',
              SIZE_CLASS[size],
              active
                ? 'bg-primary text-surface-white shadow-sm shadow-primary/25'
                : 'bg-transparent text-content-secondary',
              disabled ? 'opacity-45' : 'active:opacity-85'
            )}
            role="tab"
            aria-selected={active}
            aria-disabled={disabled}
            onClick={!disabled ? () => onValueChange(option.value) : undefined}
          >
            <Text className={cn('text-sm font-medium', active ? 'text-surface-white' : 'text-content-secondary')}>
              {option.label}
            </Text>
          </View>
        )
      })}
    </View>
  )
}
