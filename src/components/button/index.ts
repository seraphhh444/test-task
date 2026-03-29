import { createElement } from '@/utils/create-element'
import { classNames } from '@/utils/class-names'

import styles from './button.module.scss'
import type { CreateButtonOptions } from './types'

export function createButton({
  text,
  className,
  disabled = false,
  onClick,
  type = 'button',
}: CreateButtonOptions): HTMLButtonElement {
  const button = createElement('button', {
    className: classNames(styles.button, className),
    textContent: text,
  })

  button.type = type
  button.disabled = disabled

  if (onClick) {
    button.addEventListener('click', onClick)
  }

  return button
}
