import { Button as TaroButton } from '@tarojs/components'
import type { ComponentProps } from 'react'
import { cn } from '@/components/ui/cn'

type TaroButtonProps = ComponentProps<typeof TaroButton>

export type ButtonVariant = 'default' | 'secondary' | 'outline' | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon'

export interface ButtonProps extends Omit<TaroButtonProps, 'className' | 'size'> {
  className?: string
  fullWidth?: boolean
  variant?: ButtonVariant
  size?: ButtonSize
}

const BASE_CLASS =
  'border font-medium leading-none flex items-center justify-center gap-1.5 transition-[background-color,border-color,opacity,transform] duration-150 active:opacity-90'

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  default: 'bg-primary text-surface border-primary',
  secondary: 'bg-surface-white text-content border-line',
  outline: 'bg-transparent text-content border-line',
  ghost: 'bg-transparent text-content-secondary border-transparent',
}

const SIZE_CLASS: Record<ButtonSize, string> = {
  sm: 'min-h-9 rounded-lg px-3 text-sm',
  md: 'min-h-11 rounded-xl px-4 text-sm',
  lg: 'min-h-12 rounded-xl px-5 text-base',
  icon: 'size-9 min-h-9 min-w-9 rounded-lg p-0',
}

export default function Button({
  variant = 'default',
  size = 'md',
  fullWidth = true,
  className,
  ...props
}: ButtonProps) {
  return (
    <TaroButton
      className={cn(
        BASE_CLASS,
        VARIANT_CLASS[variant],
        SIZE_CLASS[size],
        fullWidth && size !== 'icon' && 'w-full',
        props.disabled && 'opacity-55',
        className
      )}
      {...props}
    />
  )
}
