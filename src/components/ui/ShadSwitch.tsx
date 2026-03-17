import { View } from '@tarojs/components'

interface ShadSwitchProps {
  checked: boolean
  onClick: () => void
  ariaLabel: string
}

export default function ShadSwitch({ checked, onClick, ariaLabel }: ShadSwitchProps) {
  return (
    <View
      className={`w-12 h-7 rounded-full relative transition-colors duration-200 ${checked ? 'bg-primary' : 'bg-line'}`}
      onClick={onClick}
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
    >
      <View
        className={`absolute top-0.5 size-6 rounded-full bg-surface-white border border-line-light shadow-card transition-[left] duration-200 ${
          checked ? 'left-5' : 'left-0.5'
        }`}
      />
    </View>
  )
}
