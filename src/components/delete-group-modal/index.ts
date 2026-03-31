import { OverlayController } from '@/components/overlay-controller'
import type { Group } from '@/entities/group'
import styles from './delete-group-modal.module.scss'

export type DeleteGroupModalApi = {
  close: () => void
  element: HTMLElement
  isOpen: () => boolean
  open: (group: Group) => void
}

type CreateDeleteGroupModalOptions = {
  onConfirm?: (group: Group) => void
}

export function createDeleteGroupModal({
  onConfirm,
}: CreateDeleteGroupModalOptions = {}): DeleteGroupModalApi {
  const overlay = new OverlayController({
    backdropClassName: styles['delete-group-modal-root__backdrop'],
    openClassName: styles['delete-group-modal-root--open'],
    panelClassName: styles['delete-group-modal'],
    rootClassName: styles['delete-group-modal-root'],
  })

  overlay.panel.innerHTML = `
    <button
      type="button"
      class="${styles['delete-group-modal__close-button']}"
      aria-label="Закрыть окно удаления группы"
    >
      <span class="${styles['delete-group-modal__close-icon']}"></span>
    </button>
    <div class="${styles['delete-group-modal__content']}">
      <h2 class="${styles['delete-group-modal__title']}">Удалить группу?</h2>
      <p class="${styles['delete-group-modal__description']}">
        Вы уверены, что хотите удалить эту группу? Это приведет к удалению всех контактов, находящихся в этой группе.
      </p>
      <div class="${styles['delete-group-modal__actions']}">
        <button
          type="button"
          class="${styles['delete-group-modal__action-button']} ${styles['delete-group-modal__action-button--primary']}"
          data-role="confirm"
        >
          Подтвердить
        </button>
        <button
          type="button"
          class="${styles['delete-group-modal__action-button']}"
          data-role="cancel"
        >
          Отменить
        </button>
      </div>
    </div>
  `

  const closeButton = overlay.panel.querySelector<HTMLButtonElement>(
    `.${styles['delete-group-modal__close-button']}`,
  )
  const cancelButton = overlay.panel.querySelector<HTMLButtonElement>('[data-role="cancel"]')
  const confirmButton = overlay.panel.querySelector<HTMLButtonElement>('[data-role="confirm"]')
  let selectedGroup: Group | null = null

  const close = (): void => {
    overlay.close()
  }

  const open = (group: Group): void => {
    selectedGroup = group
    overlay.open()
  }

  overlay.onClose = () => {
    selectedGroup = null
  }

  closeButton?.addEventListener('click', close)
  cancelButton?.addEventListener('click', close)
  confirmButton?.addEventListener('click', () => {
    if (!selectedGroup) {
      return
    }

    onConfirm?.(selectedGroup)
    close()
  })

  return {
    close,
    element: overlay.element,
    isOpen: () => overlay.isOpen(),
    open,
  }
}
