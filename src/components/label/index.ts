import { createImage } from '@/components/image'
import { classNames } from '@/utils/class-names'
import styles from './label.module.scss'

export function createLabel(className?: string): HTMLElement {
  const label = document.createElement('div')
  const icon = createImage({
    alt: 'label',
    className: styles['label__icon'],
    src: '/icons/label-icon.svg',
  })
  const title = document.createElement('span')

  label.className = classNames(styles.label, className)

  title.className = styles['label__title']
  title.textContent = 'Книга контактов'

  label.append(icon, title)

  return label
}
