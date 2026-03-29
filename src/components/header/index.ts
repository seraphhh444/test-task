import { createAddContactPopover } from '@/components/add-contact-popover'
import { createButton } from '@/components/button'
import { ContactsService } from '@/services/contacts-service'
import { createDeleteGroupModal } from '@/components/delete-group-modal'
import { createGroupsPopover } from '@/components/groups-popover'
import { createLabel } from '@/components/label'
import { createToast } from '@/components/toast'
import { DuplicateEntityError } from '@/services/duplicate-entity-error'
import { GroupsService } from '@/services/groups-service'
import { createElement } from '@/utils/create-element'
import styles from './header.module.scss'

type CreateHeaderOptions = {
  contactsService: ContactsService
  groupsService: GroupsService
  onContactsChange?: () => void
}

export function createHeader({
  contactsService,
  groupsService,
  onContactsChange,
}: CreateHeaderOptions): HTMLElement {
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
  const toast = createToast()
  const addContactPopover = createAddContactPopover({
    groups: groupsService.getGroups(),
    onSubmit: ({ groupId, name, phone }) => {
      try {
        contactsService.addContact({
          groupId,
          name,
          phone,
        })
        toast.show('Контакт успешно создан', 'success')
        onContactsChange?.()
      } catch (error) {
        if (error instanceof DuplicateEntityError) {
          toast.show(error.message, 'error')
        }
      }
    },
  })
  const groupsPopover = createGroupsPopover({
    groups: groupsService.getGroups(),
    onAddGroupClick: () => {
      const groupName = window.prompt('Введите название группы')

      if (!groupName?.trim()) {
        return
      }

      try {
        groupsService.addGroup(groupName)
        renderGroups()
        toast.show('Группа успешно создана', 'success')
      } catch (error) {
        if (error instanceof DuplicateEntityError) {
          toast.show(error.message, 'error')
        }
      }
    },
    onDeleteGroupClick: (group) => {
      deleteGroupModal.open(group)
    },
  })
  const renderGroups = (): void => {
    const groups = groupsService.getGroups()

    groupsPopover.render(groups)
    addContactPopover.renderGroups(groups)
  }
  const deleteGroupModal = createDeleteGroupModal({
    onConfirm: (group) => {
      contactsService.deleteContactsByGroup(group.id)
      groupsService.deleteGroup(group.id)
      renderGroups()
      onContactsChange?.()
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
  addContactButton.addEventListener('click', (event) => {
    event.stopPropagation()
    renderGroups()
    addContactPopover.open()
  })

  renderGroups()

  addContactPopover.element.addEventListener('click', (event) => {
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

    if (event.key === 'Escape' && addContactPopover.isOpen()) {
      addContactPopover.close()
    }
  })

  groupsControl.append(groupsButton, groupsPopover.element)
  header.append(addContactPopover.element)
  header.append(deleteGroupModal.element)
  header.append(toast.element)
  container.append(label, addContactButton, groupsControl)
  header.append(container)

  return header
}
