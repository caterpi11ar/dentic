import { Text, View } from '@tarojs/components'
import { useAiWeeklyReport } from '@/hooks/useAiWeeklyReport'
import { useSettingsStore } from '@/stores/settings'

export default function AiWeeklyReport() {
  const aiEnabled = useSettingsStore(s => s.aiEnabled)
  const { data, loading } = useAiWeeklyReport()

  if (!aiEnabled)
    return null

  if (loading) {
    return (
      <View className="mt-5 rounded-anthropic border border-line bg-surface-white p-4">
        <View className="h-4 w-16 rounded bg-content/[0.06] animate-pulse" />
        <View className="mt-3 h-3 w-full rounded bg-content/[0.06] animate-pulse" />
        <View className="mt-2 h-3 w-4/5 rounded bg-content/[0.06] animate-pulse" />
        <View className="mt-2 h-3 w-3/5 rounded bg-content/[0.06] animate-pulse" />
      </View>
    )
  }

  if (!data)
    return null

  const text = data.report || data.hint
  if (!text)
    return null

  return (
    <View className="mt-5 rounded-anthropic border border-line bg-surface-white p-4 animate-fade-scale-in motion-reduce:animate-none">
      <Text className="text-label-sm font-body font-semibold tracking-[0.08em] uppercase text-content-tertiary">
        AI 周报
      </Text>
      <Text className="mt-2 block text-paragraph-sm font-body text-content-secondary leading-relaxed">
        {text}
      </Text>
      {data.stats && (
        <View className="mt-3 flex items-center gap-4">
          <View className="flex items-baseline gap-1">
            <Text className="text-paragraph-sm font-heading font-medium tabular-nums text-primary">
              {data.stats.completionRate}
            </Text>
            <Text className="text-label-xs font-body text-content-tertiary">完成率</Text>
          </View>
          <View className="flex items-baseline gap-1">
            <Text className="text-paragraph-sm font-heading font-medium tabular-nums text-content">
              {data.stats.avgDuration}
            </Text>
            <Text className="text-label-xs font-body text-content-tertiary">均时</Text>
          </View>
          <View className="flex items-baseline gap-1">
            <Text className="text-paragraph-sm font-heading font-medium tabular-nums text-primary">
              {data.stats.streakDays}
            </Text>
            <Text className="text-label-xs font-body text-content-tertiary">天连续</Text>
          </View>
        </View>
      )}
    </View>
  )
}
