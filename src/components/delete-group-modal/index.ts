import type { Group } from '@/entities/group'
import { createElement } from '@/utils/create-element'
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
  const root = createElement('div', {
    className: styles['delete-group-modal-root'],
  })

  root.innerHTML = `
    <div class="${styles['delete-group-modal-root__backdrop']}"></div>
    <section class="${styles['delete-group-modal']}">
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
          Удаление группы повлечет за собой удаление контактов, связанных с этой группой.
        </p>
        <div class="${styles['delete-group-modal__actions']}">
          <button
            type="button"
            class="${styles['delete-group-modal__action-button']} ${styles['delete-group-modal__action-button--primary']}"
            data-role="confirm"
          >
            Да, удалить
          </button>
          <button
            type="button"
            class="${styles['delete-group-modal__action-button']}"
            data-role="cancel"
          >
            Отмена
          </button>
        </div>
      </div>
    </section>
  `

  const backdrop = root.querySelector<HTMLElement>(
    `.${styles['delete-group-modal-root__backdrop']}`,
  )
  const closeButton = root.querySelector<HTMLButtonElement>(
    `.${styles['delete-group-modal__close-button']}`,
  )
  const cancelButton = root.querySelector<HTMLButtonElement>('[data-role="cancel"]')
  const confirmButton = root.querySelector<HTMLButtonElement>('[data-role="confirm"]')
  const title = root.querySelector<HTMLElement>(
    `.${styles['delete-group-modal__title']}`,
  )
  let selectedGroup: Group | null = null

  const close = (): void => {
    selectedGroup = null
    root.classList.remove(styles['delete-group-modal-root--open'])
  }

  const open = (group: Group): void => {
    selectedGroup = group

    if (title) {
      title.textContent = `Удалить группу${group.name ? ` «${group.name}»` : ''}?`
    }

    root.classList.add(styles['delete-group-modal-root--open'])
  }

  const isOpen = (): boolean =>
    root.classList.contains(styles['delete-group-modal-root--open'])

  backdrop?.addEventListener('click', close)
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
    element: root,
    isOpen,
    open,
  }
}
