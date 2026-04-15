import { Text, View } from '@tarojs/components'
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
  sm: 'min-h-9 px-3 rounded-anthropic',
  md: 'min-h-10 px-4 rounded-anthropic',
}

export default function Tabs<T extends string>({
  value,
  options,
  onValueChange,
  className,
  size = 'sm',
}: TabsProps<T>) {
  return (
    <View
      className={cn(
        'inline-flex items-center overflow-hidden rounded-anthropic-lg border border-line bg-surface-white p-1',
        className,
      )}
      role="tablist"
    >
      <View className="inline-flex items-center gap-1 w-full">
        {options.map((option) => {
          const active = value === option.value
          const disabled = option.disabled

          return (
            <View
              key={option.value}
              className={cn(
                'flex-1 flex items-center justify-center min-w-[68px] border transition-all duration-200 ease-out',
                SIZE_CLASS[size],
                active
                  ? 'border-line bg-primary-light text-primary'
                  : 'border-transparent bg-transparent text-content-secondary',
                disabled ? 'opacity-45' : 'active:bg-line-lighter',
              )}
              role="tab"
              aria-selected={active}
              aria-disabled={disabled}
              onClick={!disabled ? () => onValueChange(option.value) : undefined}
            >
              <Text className={cn('text-paragraph-sm font-body font-semibold', active ? 'text-primary' : 'text-content-secondary')}>
                {option.label}
              </Text>
            </View>
          )
        })}
      </View>
    </View>
  )
}
