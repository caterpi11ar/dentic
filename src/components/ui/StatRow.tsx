import { Text, View } from '@tarojs/components'
import { cn } from '@/components/ui/cn'

export type StatRowTone = 'default' | 'primary'
export type StatRowAlign = 'baseline' | 'stack'

interface StatRowProps {
  label: string
  value: number | string
  unit?: string
  tone?: StatRowTone
  align?: StatRowAlign
  className?: string
}

const LABEL_CLASS = 'text-label-sm font-body font-semibold uppercase text-content-tertiary'

export default function StatRow({
  label,
  value,
  unit,
  tone = 'default',
  align = 'stack',
  className,
}: StatRowProps) {
  const valueClass = cn(
    'text-display-md font-heading font-medium tabular-nums leading-none',
    tone === 'primary' ? 'text-primary' : 'text-content',
  )

  if (align === 'baseline') {
    return (
      <View className={cn('flex items-baseline gap-2', className)}>
        <Text className={LABEL_CLASS}>{label}</Text>
        <Text className={valueClass}>{value}</Text>
        {unit ? <Text className={LABEL_CLASS}>{unit}</Text> : null}
      </View>
    )
  }

  return (
    <View className={cn('flex flex-col gap-1.5', className)}>
      <Text className={LABEL_CLASS}>{label}</Text>
      <View className="flex items-baseline gap-1.5">
        <Text className={valueClass}>{value}</Text>
        {unit ? (
          <Text className="text-label-xs font-body font-semibold uppercase text-content-tertiary">
            {unit}
          </Text>
        ) : null}
      </View>
    </View>
  )
}
