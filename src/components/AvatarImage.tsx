import { Image } from '@tarojs/components'
import { useEffect, useState } from 'react'
import defaultAvatarLogo from '@/assets/images/default-avatar-logo.png'

interface AvatarImageProps {
  src?: string
  className?: string
  mode?: 'scaleToFill' | 'aspectFit' | 'aspectFill' | 'widthFix' | 'heightFix'
}

export default function AvatarImage({
  src,
  className,
  mode = 'aspectFill',
}: AvatarImageProps) {
  const [resolvedSrc, setResolvedSrc] = useState(src || defaultAvatarLogo)

  useEffect(() => {
    setResolvedSrc(src || defaultAvatarLogo)
  }, [src])

  const handleError = () => {
    if (resolvedSrc !== defaultAvatarLogo) {
      setResolvedSrc(defaultAvatarLogo)
    }
  }

  return (
    <Image
      src={resolvedSrc}
      className={className}
      mode={mode}
      onError={handleError}
    />
  )
}
