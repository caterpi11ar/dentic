import type { DailyTip } from '@/constants/daily-tips'
import type { DailyStatus } from '@/domains/brush/utils'
import { Image, Text, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import iconCheck from '@/assets/icons/icon-check.svg'
import Button from '@/components/ui/Button'
import { TOTAL_STEPS } from '@/constants/brushing-steps'
import DailyTipCard from '@/domains/brush/components/DailyTipCard'
import NewlyUnlockedStrip from '@/domains/brush/components/NewlyUnlockedStrip'
import { isDailyComplete } from '@/domains/brush/utils'
import { isEveningSessionHour } from '@/services/dateBoundary'

function getNextPrompt(dailyStatus: DailyStatus): string | null {
  if (isDailyComplete(dailyStatus))
    return '今天的刷牙任务全部完成了，明天见！'

  const hour = new Date().getHours()

  if (isEveningSessionHour(hour)) {
    // 晚间时段完成，早刷不管了
    return '今天晚刷已完成，明天见！'
  }

  // 早间时段完成，提示晚上再来
  if (!dailyStatus.eveningDone)
    return '记得晚上再来刷一次哦'

  return null
}

interface BrushCompletedStateProps {
  completionMessage: string
  newlyUnlockedIds: string[]
  dailyTip: DailyTip | null
  elapsedTime: number
  streak: number
  dailyStatus: DailyStatus
  onReset: () => void
}

export default function BrushCompletedState({
  completionMessage,
  newlyUnlockedIds,
  dailyTip,
  elapsedTime,
  streak,
  dailyStatus,
  onReset,
}: BrushCompletedStateProps) {
  const nextPrompt = getNextPrompt(dailyStatus)

  return (
    <View className="flex-1 flex flex-col items-center justify-center animate-subtle-scale motion-reduce:animate-none">
      {/* 对勾 */}
      <View className="size-16 rounded-full bg-primary flex items-center justify-center mb-5">
        <Image src={iconCheck} className="size-8" mode="aspectFit" />
      </View>

      {/* 完成文案 */}
      <Text className="text-display-md font-heading font-medium text-content text-center px-4">
        {completionMessage}
      </Text>

      {/* 新解锁成就高光 */}
      {newlyUnlockedIds.length > 0 && (
        <View className="mt-6 w-full">
          <NewlyUnlockedStrip ids={newlyUnlockedIds} />
        </View>
      )}

      {/* 统计数据 - 横向三栏 */}
      <View className="mt-8 w-full flex items-center justify-center gap-6">
        <View className="flex flex-col items-center">
          <Text className="text-display-sm font-heading font-medium text-primary tabular-nums">
            {Math.floor(elapsedTime / 60)}
            :
            {String(elapsedTime % 60).padStart(2, '0')}
          </Text>
          <Text className="mt-1 text-label-xs font-body text-content-tertiary">用时</Text>
        </View>
        <View className="w-px h-8 bg-line" />
        <View className="flex flex-col items-center">
          <Text className="text-display-sm font-heading font-medium text-content tabular-nums">
            {TOTAL_STEPS}
          </Text>
          <Text className="mt-1 text-label-xs font-body text-content-tertiary">步骤</Text>
        </View>
        <View className="w-px h-8 bg-line" />
        <View className="flex flex-col items-center">
          <Text className="text-display-sm font-heading font-medium text-primary tabular-nums">
            {streak}
          </Text>
          <Text className="mt-1 text-label-xs font-body text-content-tertiary">连续天数</Text>
        </View>
      </View>

      {/* 每日小贴士 */}
      {dailyTip && (
        <View className="mt-6 w-full px-2">
          <DailyTipCard tip={dailyTip} />
        </View>
      )}

      {/* 今日状态提示 */}
      {nextPrompt && (
        <View className="mt-6 px-4">
          <Text className="text-paragraph-sm font-body text-content-secondary text-center leading-relaxed">
            {nextPrompt}
          </Text>
        </View>
      )}

      {/* 按钮 */}
      <View className="mt-10 w-full flex flex-col gap-3 px-2">
        <Button className="min-h-11 text-base" openType="share" aria-label="分享刷牙成绩">
          分享
        </Button>
        <View className="flex gap-3">
          <Button
            variant="secondary"
            className="min-h-11 text-base flex-1"
            fullWidth={false}
            onClick={() => Taro.redirectTo({ url: '/pages/rank/index' }).catch(() => undefined)}
            aria-label="查看好友排行榜"
          >
            排行榜
          </Button>
          <Button variant="ghost" className="min-h-11 text-base flex-1" fullWidth={false} onClick={onReset} aria-label="返回首页">
            返回
          </Button>
        </View>
      </View>
    </View>
  )
}
