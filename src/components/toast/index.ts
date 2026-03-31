import { createElement } from '@/utils/create-element'
import successIcon from '@/assets/success-action.svg'
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

  const TOAST_LIFETIME_MS = 3000
  const TOAST_EXIT_DURATION_MS = 220

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
            src="${successIcon}"
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
      toast.classList.add(styles['toast--leaving'])
    }, TOAST_LIFETIME_MS - TOAST_EXIT_DURATION_MS)

    window.setTimeout(() => {
      toast.remove()
    }, TOAST_LIFETIME_MS)
  }

  return {
    element: root,
    show,
  }
}
