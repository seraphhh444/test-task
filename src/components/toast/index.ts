import { createElement } from '@/utils/create-element'
import styles from './toast.module.scss'

type ToastVariant = 'error' | 'success'

export type ToastApi = {
  element: HTMLElement
  show: (message: string, variant?: ToastVariant) => void
}

export function createToast(): ToastApi {
  const root = createElement('div', {
    className: styles['toast-root'],
  })

  const show = (
    message: string,
    variant: ToastVariant = 'error',
  ): void => {
    const toast = createElement('div', {
      className: `${styles.toast} ${styles[`toast--${variant}`]}`,
    })

    const iconMarkup =
      variant === 'success'
        ? `
          <img
            class="${styles['toast__icon']}"
            src="/icons/success-action.svg"
            alt=""
          >
        `
        : ''

    toast.innerHTML = `
      ${iconMarkup}
      <span class="${styles['toast__message']}">${message}</span>
    `

    root.append(toast)

    window.setTimeout(() => {
      toast.remove()
    }, 3000)
  }

  return {
    element: root,
    show,
  }
}
