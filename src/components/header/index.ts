import {
  createContactFormPopover,
  type ContactFormPopoverPayload,
} from '@/components/add-contact-popover'
import { createAddGroupModal } from '@/components/add-group-modal'
import { createButton } from '@/components/button'
import { createDeleteGroupModal } from '@/components/delete-group-modal'
import { createGroupsPopover } from '@/components/groups-popover'
import { createLabel } from '@/components/label'
import type { Group } from '@/entities/group'
import { createElement } from '@/utils/create-element'
import contactIcon from '@/assets/add-contact.svg'
import styles from './header.module.scss'
import { createImage } from '../image'

type CreateHeaderOptions = {
  groups: Group[]
  onAddContact?: (payload: ContactFormPopoverPayload) => boolean | void
  onAddGroup?: (groupName: string) => void
  onDeleteGroup?: (groupId: string) => void
}

export type HeaderApi = {
  element: HTMLElement
  renderGroups: (groups: Group[]) => void
}

export function createHeader({
  groups,
  onAddContact,
  onAddGroup,
  onDeleteGroup,
}: CreateHeaderOptions): HeaderApi {
  const header = createElement('header', { className: styles.header })
  const container = createElement('div', {
    className: `container ${styles['header__container']}`,
  })
  const label = createLabel(styles['header__label'])
  const addContactButton = createButton({
    text: 'Добавить контакт',
    className: styles['header__add-contact-button'],
  })
  const addContactIcon = createImage({
    alt: 'add-contant-icon',
    src: contactIcon,
  })

  addContactButton.append(addContactIcon)

  const groupsControl = createElement('div', {
    className: styles['header__groups-control'],
  })
  const addContactPopover = createContactFormPopover({
    groups,
    submitButtonText: 'Сохранить',
    title: 'Добавление контакта',
    onSubmit: (payload) => onAddContact?.(payload),
  })
  const addGroupModal = createAddGroupModal({
    onSubmit: (groupName) => onAddGroup?.(groupName),
  })
  const deleteGroupModal = createDeleteGroupModal({
    onConfirm: (group) => {
      onDeleteGroup?.(group.id)
    },
  })
  const groupsPopover = createGroupsPopover({
    groups,
    onAddGroupClick: () => {
      addGroupModal.open()
    },
    onDeleteGroupClick: (group) => {
      deleteGroupModal.open(group)
    },
  })
  const groupsButton = createButton({
    text: 'Группы',
    className: styles['header__groups-button'],
    onClick: (event) => {
      event.stopPropagation()
      groupsPopover.toggle()
    },
  })

  const renderGroups = (nextGroups: Group[]): void => {
    groupsPopover.render(nextGroups)
    addContactPopover.renderGroups(nextGroups)
  }

  addContactButton.addEventListener('click', (event) => {
    event.stopPropagation()
    addContactPopover.open()
  })

  addContactPopover.element.addEventListener('click', (event) => {
    event.stopPropagation()
  })
  addGroupModal.element.addEventListener('click', (event) => {
    event.stopPropagation()
  })
  groupsPopover.element.addEventListener('click', (event) => {
    event.stopPropagation()
  })

  document.addEventListener('click', () => {
    groupsPopover.close()
  })

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && groupsPopover.isOpen()) {
      groupsPopover.close()
    }

    if (event.key === 'Escape' && deleteGroupModal.isOpen()) {
      deleteGroupModal.close()
    }

    if (event.key === 'Escape' && addGroupModal.isOpen()) {
      addGroupModal.close()
    }

    if (event.key === 'Escape' && addContactPopover.isOpen()) {
      addContactPopover.close()
    }
  })

  groupsControl.append(groupsButton, groupsPopover.element)
  header.append(
    addContactPopover.element,
    addGroupModal.element,
    deleteGroupModal.element,
  )
  container.append(label, addContactButton, groupsControl)
  header.append(container)

  return {
    element: header,
    renderGroups,
  }
}
