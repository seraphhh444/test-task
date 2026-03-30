import type { Group } from '@/entities/group'
import { createElement } from '@/utils/create-element'
import closeIcon from '@/assets/close-popover-icon.svg'
import deleteIcon from '@/assets/delete-icon.svg'
import styles from './groups-popover.module.scss'

export type GroupsPopoverApi = {
  close: () => void
  element: HTMLElement
  isOpen: () => boolean
  open: () => void
  render: (groups: Group[]) => void
  toggle: () => void
}

type CreateGroupsPopoverOptions = {
  onAddGroupClick?: () => void
  groups?: Group[]
  onDeleteGroupClick?: (group: Group) => void
}

export function createGroupsPopover({
  onAddGroupClick,
  groups = [],
  onDeleteGroupClick,
}: CreateGroupsPopoverOptions = {}): GroupsPopoverApi {
  const root = createElement('div', {
    className: styles['groups-popover-root'],
  })

  root.innerHTML = `
    <div class="${styles['groups-popover-root__backdrop']}"></div>
    <section class="${styles['groups-popover']}">
      <div class="${styles['groups-popover__header']}">
        <h2 class="${styles['groups-popover__title']}">Группы контактов</h2>
        <button
          type="button"
          class="${styles['groups-popover__close-button']}"
          aria-label="Закрыть поповер групп"
        >
          <img
            class="${styles['groups-popover__close-icon']}"
            src="${closeIcon}"
            alt=""
          >
        </button>
      </div>
      <div class="${styles['groups-popover__content']}">
        <ul class="${styles['groups-popover__groups-list']}"></ul>
      </div>
      <div class="${styles['groups-popover__actions']}">
        <button
          type="button"
          class="${styles['groups-popover__action-button']}"
        >
          Добавить
        </button>
        <button
          type="button"
          class="${styles['groups-popover__action-button']} ${styles['groups-popover__action-button--primary']}"
        >
          Сохранить
        </button>
      </div>
    </section>
  `

  const backdrop = root.querySelector<HTMLElement>(
    `.${styles['groups-popover-root__backdrop']}`,
  )
  const closeButton = root.querySelector<HTMLButtonElement>(
    `.${styles['groups-popover__close-button']}`,
  )
  const saveButton = root.querySelector<HTMLButtonElement>(
  `.${styles['groups-popover__action-button--primary']}`,
  );
  const addButton = root.querySelector<HTMLButtonElement>(
    `.${styles['groups-popover__action-button']}`,
  )
  const groupsList = root.querySelector<HTMLUListElement>(
    `.${styles['groups-popover__groups-list']}`,
  )

  const renderList = (nextGroups: Group[]): void => {
    if (!groupsList) {
      return
    }

    if (nextGroups.length === 0) {
      groupsList.innerHTML = `
        <li class="${styles['groups-popover__empty-state']}">Групп пока нет</li>
      `

      return
    }

    groupsList.innerHTML = nextGroups
      .map(
        (group) => `
          <li class="${styles['groups-popover__group-item']}">
            <span class="${styles['groups-popover__group-name']}">${group.name}</span>
            <button
              type="button"
              class="${styles['groups-popover__delete-button']}"
              aria-label="Удалить группу ${group.name}"
              data-group-id="${group.id}"
            >
              <img
                class="${styles['groups-popover__delete-icon']}"
                src="${deleteIcon}"
                alt=""
              >
            </button>
          </li>
        `,
      )
      .join('')
  }

  const open = (): void => {
    root.classList.add(styles['groups-popover-root--open'])
  }

  const close = (): void => {
    root.classList.remove(styles['groups-popover-root--open'])
  }

  const toggle = (): void => {
    root.classList.toggle(styles['groups-popover-root--open'])
  }

  const isOpen = (): boolean =>
    root.classList.contains(styles['groups-popover-root--open'])

  closeButton?.addEventListener('click', close)
  backdrop?.addEventListener('click', close)
  addButton?.addEventListener('click', () => {
    onAddGroupClick?.()
  })
  saveButton?.addEventListener('click', () => {
    close();
  });
  groupsList?.addEventListener('click', (event) => {
    const target = event.target

    if (!(target instanceof HTMLElement)) {
      return
    }

    const deleteButton = target.closest<HTMLButtonElement>(
      `.${styles['groups-popover__delete-button']}`,
    )

    if (!deleteButton) {
      return
    }

    const groupId = deleteButton.dataset.groupId
    const selectedGroup = groups.find((group) => group.id === groupId)

    if (!selectedGroup) {
      return
    }

    close()
    onDeleteGroupClick?.(selectedGroup)
  })

  renderList(groups)

  return {
    close,
    element: root,
    isOpen,
    open,
    render: (nextGroups) => {
      groups = nextGroups
      renderList(groups)
    },
    toggle,
  }
}
