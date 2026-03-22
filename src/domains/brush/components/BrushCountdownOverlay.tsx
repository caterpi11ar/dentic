import { View, Text } from '@tarojs/components'

interface BrushCountdownOverlayProps {
  remaining: number
  isNight: boolean
}

export default function BrushCountdownOverlay({ remaining, isNight }: BrushCountdownOverlayProps) {
  return (
    <View
      className={`fixed inset-0 flex items-center justify-center z-[120] ${isNight ? 'bg-black' : 'bg-white'}`}
      aria-live="assertive"
    >
      <Text
        key={remaining}
        className={`text-countdown font-bold animate-countdown-pulse motion-reduce:animate-none ${
          isNight ? 'text-white' : 'text-black'
        }`}
      >
        {remaining}
      </Text>
    </View>
  )
}
