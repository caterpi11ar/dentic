import type { DailyTip } from '@/constants/daily-tips'
import { Text, View } from '@tarojs/components'
import { Card, CardContent } from '@/components/ui/Card'
import { DAILY_TIP_CATEGORY_LABELS } from '@/constants/daily-tips'

interface DailyTipCardProps {
  tip: DailyTip
}

export default function DailyTipCard({ tip }: DailyTipCardProps) {
  return (
    <Card className="w-full">
      <CardContent variant="dense">
        <View className="flex items-center gap-2">
          <Text className="text-label-xs font-body text-content-tertiary tracking-wide">
            每日小贴士
          </Text>
          <Text className="text-label-xs font-body text-content-tertiary">·</Text>
          <Text className="text-label-xs font-body text-primary tracking-wide">
            {DAILY_TIP_CATEGORY_LABELS[tip.category]}
          </Text>
        </View>
        <Text className="mt-2 block text-paragraph-md font-body font-semibold text-content">
          {tip.title}
        </Text>
        <Text className="mt-1.5 block text-paragraph-sm font-body text-content-secondary leading-relaxed">
          {tip.body}
        </Text>
        {tip.source && (
          <Text className="mt-2 block text-label-xs font-body text-content-disabled">
            {tip.source}
          </Text>
        )}
      </CardContent>
    </Card>
  )
}
