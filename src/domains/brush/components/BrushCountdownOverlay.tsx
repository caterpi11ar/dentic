import { View, Text } from '@tarojs/components'

interface BrushCountdownOverlayProps {
  remaining: number
}

export default function BrushCountdownOverlay({ remaining }: BrushCountdownOverlayProps) {
  return (
    <View
      className="fixed inset-0 flex items-center justify-center z-[120] bg-surface"
      aria-live="assertive"
    >
      <Text
        key={remaining}
        className="text-countdown font-heading font-medium animate-countdown-pulse motion-reduce:animate-none text-content"
      >
        {remaining}
      </Text>
    </View>
  )
}
