import { classNames } from '@/utils/class-names'
import { createElement } from '@/utils/create-element'
import styles from './image.module.scss'
import type { CreateImageOptions } from './types'

export function createImage({
  alt,
  className,
  src,
}: CreateImageOptions): HTMLImageElement {
  const image = createElement('img', {
    className: classNames(styles.image, className),
  })

  image.src = src
  image.alt = alt

  return image
}
