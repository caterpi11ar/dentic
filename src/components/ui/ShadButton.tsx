import { Button } from '@tarojs/components'
import type { ComponentProps } from 'react'

type TaroButtonProps = ComponentProps<typeof Button>

type Variant = 'default' | 'secondary' | 'outline' | 'ghost'

interface ShadButtonProps extends Omit<TaroButtonProps, 'className'> {
  className?: string
  fullWidth?: boolean
  variant?: Variant
}

const BASE_CLASS =
  'min-h-11 rounded-xl border text-sm font-medium leading-none flex items-center justify-center transition-colors duration-150 active:opacity-90'

const VARIANT_CLASS: Record<Variant, string> = {
  default: 'bg-primary text-surface border-primary',
  secondary: 'bg-surface-white text-content border-line',
  outline: 'bg-transparent text-content border-line',
  ghost: 'bg-transparent text-content-secondary border-transparent',
}

function cx(...classes: Array<string | undefined | false>): string {
  return classes.filter(Boolean).join(' ')
}

export default function ShadButton({
  variant = 'default',
  fullWidth = true,
  className,
  ...props
}: ShadButtonProps) {
  return (
    <Button
      className={cx(
        BASE_CLASS,
        VARIANT_CLASS[variant],
        fullWidth && 'w-full',
        props.disabled && 'opacity-55',
        className
      )}
      {...props}
    />
  )
}
