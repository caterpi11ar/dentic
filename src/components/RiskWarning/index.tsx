import { View } from '@tarojs/components'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert'
import { useRiskWarning } from '@/hooks/useRiskWarning'
import { useSettingsStore } from '@/stores/settings'

const SEVERITY_VARIANT = {
  high: 'destructive',
  medium: 'warning',
  low: 'info',
} as const

export default function RiskWarning() {
  const aiEnabled = useSettingsStore(s => s.aiEnabled)
  const { topRisk, aiTip, loading, dismiss } = useRiskWarning()

  if (!aiEnabled || loading || !topRisk || !aiTip)
    return null

  return (
    <Alert
      variant={SEVERITY_VARIANT[topRisk.severity] || 'warning'}
      className="mb-4 animate-fade-scale-in motion-reduce:animate-none"
    >
      <View className="flex items-start justify-between gap-2">
        <View className="flex-1 min-w-0">
          <AlertTitle>健康提醒</AlertTitle>
          <AlertDescription>{aiTip}</AlertDescription>
        </View>
        <View
          className="shrink-0 size-6 flex items-center justify-center rounded-full"
          role="button"
          aria-label="关闭提醒"
          onClick={() => dismiss(topRisk.type)}
        >
          <View className="text-label-sm text-content-tertiary">×</View>
        </View>
      </View>
    </Alert>
  )
}
