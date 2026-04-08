import type { ReactNode } from 'react'
import type { ButtonProps } from '@/components/ui/Button'
import Button from '@/components/ui/Button'
import { cn } from '@/components/ui/cn'

interface IconButtonProps
  extends Omit<ButtonProps, 'children' | 'variant' | 'size' | 'fullWidth' | 'aria-label'> {
  icon: ReactNode
  ariaLabel: string
}

export default function IconButton({ icon, ariaLabel, className, ...props }: IconButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      fullWidth={false}
      className={cn('text-base', className)}
      aria-label={ariaLabel}
      {...props}
    >
      {icon}
    </Button>
  )
}
