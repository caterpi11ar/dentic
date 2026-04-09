import Alert from '@/components/ui/Alert'
import { useRiskWarning } from '@/hooks/useRiskWarning'
import { useSettingsStore } from '@/stores/settings'

const SEVERITY_VARIANT = {
  high: 'danger',
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
      title="健康提醒"
      description={aiTip}
      onClose={() => dismiss(topRisk.type)}
      className="mb-4 animate-fade-scale-in motion-reduce:animate-none"
    />
  )
}
