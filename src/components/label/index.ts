import { classNames } from '@/utils/class-names'
import { createElement } from '@/utils/create-element'
import styles from './label.module.scss'

export function createLabel(className?: string): HTMLElement {
  const label = createElement('div', {
    className: classNames(styles.label, className),
  })

  label.innerHTML = `
    <img
      class="${styles['label__icon']}"
      src="/icons/label-icon.svg"
      alt="label"
    >
    <span class="${styles['label__title']}">Книга контактов</span>
  `

  return label
}
