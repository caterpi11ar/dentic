import { Text, View } from '@tarojs/components'
import { useRiskWarning } from '@/hooks/useRiskWarning'
import { useSettingsStore } from '@/stores/settings'

export default function RiskWarning() {
  const aiEnabled = useSettingsStore(s => s.aiEnabled)
  const { topRisk, aiTip, loading, dismiss } = useRiskWarning()

  if (!aiEnabled || loading || !topRisk || !aiTip)
    return null

  const severityStyles = {
    high: 'border-danger/30 bg-danger/5',
    medium: 'border-warning/30 bg-warning/5',
    low: 'border-info/30 bg-info/5',
  }

  return (
    <View
      className={`rounded-anthropic border px-3.5 py-3 mb-4 animate-fade-scale-in motion-reduce:animate-none ${severityStyles[topRisk.severity] || severityStyles.medium}`}
      role="alert"
      aria-live="polite"
    >
      <View className="flex items-start justify-between gap-2">
        <View className="flex-1">
          <Text className="text-label-xs font-body font-semibold tracking-wide text-content-tertiary uppercase">
            健康提醒
          </Text>
          <Text className="mt-1.5 block text-paragraph-sm font-body text-content-secondary leading-relaxed">
            {aiTip}
          </Text>
        </View>
        <View
          className="shrink-0 size-6 flex items-center justify-center rounded-full"
          role="button"
          aria-label="关闭提醒"
          onClick={() => dismiss(topRisk.type)}
        >
          <Text className="text-label-sm text-content-tertiary">×</Text>
        </View>
      </View>
    </View>
  )
}
