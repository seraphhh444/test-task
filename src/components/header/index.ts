import { createButton } from '@/components/button'
import { createDeleteGroupModal } from '@/components/delete-group-modal'
import { createGroupsPopover } from '@/components/groups-popover'
import { createLabel } from '@/components/label'
import { GroupsService } from '@/services/groups-service'
import { createElement } from '@/utils/create-element'
import styles from './header.module.scss'

type CreateHeaderOptions = {
  groupsService: GroupsService
}

export function createHeader({ groupsService }: CreateHeaderOptions): HTMLElement {
  const header = createElement('header', { className: styles.header })
  const container = createElement('div', {
    className: `container ${styles['header__container']}`,
  })
  const label = createLabel(styles['header__label'])
  const addContactButton = createButton({
    text: 'Добавить контакт',
    className: styles['header__add-contact-button'],
  })
  const groupsControl = createElement('div', {
    className: styles['header__groups-control'],
  })
  const groupsPopover = createGroupsPopover({
    groups: groupsService.getGroups(),
    onDeleteGroupClick: (group) => {
      deleteGroupModal.open(group)
    },
  })
  const renderGroups = (): void => {
    groupsPopover.render(groupsService.getGroups())
  }
  const deleteGroupModal = createDeleteGroupModal({
    onConfirm: (group) => {
      groupsService.deleteGroup(group.id)
      renderGroups()
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

  renderGroups()

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
  })

  groupsControl.append(groupsButton, groupsPopover.element)
  header.append(deleteGroupModal.element)
  container.append(label, addContactButton, groupsControl)
  header.append(container)

  return header
}
