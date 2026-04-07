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
  'font-body font-semibold leading-none flex items-center justify-center gap-1.5 transition-[background-color,border-color,opacity,transform] duration-200 active:scale-[0.98] active:opacity-90'

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  default: 'bg-primary text-surface-white border border-transparent',
  secondary: 'bg-surface-white text-content border border-content/[0.12]',
  outline: 'bg-transparent text-content border border-content/[0.2]',
  ghost: 'bg-transparent text-content-secondary border-transparent',
}

const SIZE_CLASS: Record<ButtonSize, string> = {
  sm: 'min-h-9 rounded-anthropic-sm px-3.5 text-paragraph-sm',
  md: 'min-h-11 rounded-anthropic px-5 text-paragraph-sm',
  lg: 'min-h-[3.25rem] rounded-anthropic px-6 text-paragraph-md',
  icon: 'size-10 min-h-10 min-w-10 rounded-anthropic p-0',
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
