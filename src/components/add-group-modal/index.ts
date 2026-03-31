import { OverlayController } from '@/components/overlay-controller'
import styles from './add-group-modal.module.scss'

export type AddGroupModalApi = {
  close: () => void
  element: HTMLElement
  isOpen: () => boolean
  open: () => void
}

type CreateAddGroupModalOptions = {
  onSubmit?: (groupName: string) => boolean | void
}

const REQUIRED_FIELD_MESSAGE = 'Поле обязательно для заполнения'

export function createAddGroupModal({
  onSubmit,
}: CreateAddGroupModalOptions = {}): AddGroupModalApi {
  const overlay = new OverlayController({
    backdropClassName: styles['add-group-modal-root__backdrop'],
    openClassName: styles['add-group-modal-root--open'],
    panelClassName: styles['add-group-modal'],
    rootClassName: styles['add-group-modal-root'],
  })

  overlay.panel.setAttribute('aria-label', 'Добавление группы')
  overlay.panel.innerHTML = `
    <button
      type="button"
      class="${styles['add-group-modal__close-button']}"
      aria-label="Закрыть окно добавления группы"
    >
      <span class="${styles['add-group-modal__close-icon']}"></span>
    </button>
    <form class="${styles['add-group-modal__content']}">
      <h2 class="${styles['add-group-modal__title']}">Добавление группы</h2>
      <div
        class="${styles['add-group-modal__field-group']}"
        data-field-group="name"
      >
        <input
          class="${styles['add-group-modal__field']}"
          name="name"
          type="text"
          placeholder="Введите название группы"
        >
        <p
          class="${styles['add-group-modal__field-message']}"
          data-field-message="name"
          hidden
        ></p>
      </div>
      <div class="${styles['add-group-modal__actions']}">
        <button
          type="button"
          class="${styles['add-group-modal__action-button']}"
          data-role="cancel"
        >
          Отмена
        </button>
        <button
          type="submit"
          class="${styles['add-group-modal__action-button']} ${styles['add-group-modal__action-button--primary']}"
        >
          Сохранить
        </button>
      </div>
    </form>
  `

  const closeButton = overlay.panel.querySelector<HTMLButtonElement>(
    `.${styles['add-group-modal__close-button']}`,
  )
  const cancelButton = overlay.panel.querySelector<HTMLButtonElement>('[data-role="cancel"]')
  const form = overlay.panel.querySelector<HTMLFormElement>(`.${styles['add-group-modal__content']}`)
  const nameField = form?.elements.namedItem('name') as HTMLInputElement | null

  const setFieldError = (message?: string): void => {
    const fieldGroup = overlay.panel.querySelector<HTMLElement>('[data-field-group="name"]')
    const fieldMessage = overlay.panel.querySelector<HTMLElement>('[data-field-message="name"]')

    fieldGroup?.classList.toggle(
      styles['add-group-modal__field-group--error'],
      Boolean(message),
    )

    if (!fieldMessage) {
      return
    }

    fieldMessage.textContent = message ?? ''
    fieldMessage.hidden = !message
  }

  const clearForm = (): void => {
    if (nameField) {
      nameField.value = ''
    }

    setFieldError()
  }

  const close = (): void => {
    overlay.close()
  }

  const open = (): void => {
    overlay.open()
    nameField?.focus()
  }

  overlay.onClose = () => {
    clearForm()
  }

  closeButton?.addEventListener('click', close)
  cancelButton?.addEventListener('click', close)
  nameField?.addEventListener('input', () => {
    if (nameField.value.trim()) {
      setFieldError()
    }
  })
  form?.addEventListener('submit', (event) => {
    event.preventDefault()

    const formData = new FormData(form)
    const groupName = String(formData.get('name') ?? '').trim()

    if (!groupName) {
      setFieldError(REQUIRED_FIELD_MESSAGE)
      return
    }

    const submitResult = onSubmit?.(groupName)

    if (submitResult === false) {
      return
    }

    close()
  })

  return {
    close,
    element: overlay.element,
    isOpen: () => overlay.isOpen(),
    open,
  }
}
