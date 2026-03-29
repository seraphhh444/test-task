import {
  createContactFormPopover,
  type ContactFormPopoverPayload,
} from '@/components/add-contact-popover'
import { createContactsList } from '@/components/contacts-list'
import { createHeader } from '@/components/header'
import type { Contact, ContactData } from '@/entities/contact'
import type { GroupData } from '@/entities/group'
import { ContactsService } from '@/services/contacts-service'
import { DuplicateEntityError } from '@/services/duplicate-entity-error'
import { GroupsService } from '@/services/groups-service'
import { LocalStorageRepository } from '@/services/local-storage-repository'
import { NotificationManager } from '@/services/notification-manager'
import { createElement } from '@/utils/create-element'

export function createMainPage(): HTMLElement {
  const root = createElement('div')
  const mainElement = createElement('main', { className: 'app' })
  const containerElement = createElement('div', { className: 'container' })
  const contactsRepository = new LocalStorageRepository<ContactData[]>('contacts', [])
  const contactsService = new ContactsService(contactsRepository)
  const groupsRepository = new LocalStorageRepository<GroupData[]>('groups', [])
  const groupsService = new GroupsService(groupsRepository)
  const notifications = new NotificationManager()
  let editingContactId: string | null = null

  groupsService.initialize()

  const getContactById = (contactId: string): Contact | undefined =>
    contactsService.getContacts().find((contact) => contact.id === contactId)

  const handleContactSubmitError = (error: unknown): false => {
    if (error instanceof DuplicateEntityError) {
      notifications.error(error.message)
    }

    return false
  }

  const renderContacts = (): void => {
    contactsList.render({
      contacts: contactsService.getContacts(),
      groups: groupsService.getGroups(),
    })
  }

  const editContactPopover = createContactFormPopover({
    groups: groupsService.getGroups(),
    title: 'Редактирование контакта',
    submitButtonText: 'Сохранить',
    onClose: () => {
      editingContactId = null
    },
    onSubmit: ({ groupId, name, phone }) => {
      if (!editingContactId) {
        return false
      }

      try {
        contactsService.updateContact(editingContactId, {
          groupId,
          name,
          phone,
        })
        notifications.success('Контакт успешно обновлён')
        renderContacts()

        return true
      } catch (error) {
        return handleContactSubmitError(error)
      }
    },
  })

  const renderGroups = (): void => {
    header.renderGroups(groupsService.getGroups())
    editContactPopover.renderGroups(groupsService.getGroups())
  }

  const handleAddContact = ({
    groupId,
    name,
    phone,
  }: ContactFormPopoverPayload): boolean => {
    try {
      contactsService.addContact({
        groupId,
        name,
        phone,
      })
      notifications.success('Контакт успешно создан')
      renderContacts()

      return true
    } catch (error) {
      return handleContactSubmitError(error)
    }
  }

  const contactsList = createContactsList({
    onEditContactClick: (contactId) => {
      const contact = getContactById(contactId)

      if (!contact) {
        return
      }

      editingContactId = contact.id
      editContactPopover.open({
        groupId: contact.groupId,
        name: contact.name,
        phone: contact.phone,
      })
    },
    onDeleteContactClick: (contactId) => {
      contactsService.deleteContact(contactId)
      renderContacts()
    },
  })

  const header = createHeader({
    groups: groupsService.getGroups(),
    onAddContact: handleAddContact,
    onAddGroup: (groupName) => {
      try {
        groupsService.addGroup(groupName)
        renderGroups()
        notifications.success('Группа успешно создана')
      } catch (error) {
        if (error instanceof DuplicateEntityError) {
          notifications.error(error.message)
        }
      }
    },
    onDeleteGroup: (groupId) => {
      contactsService.deleteContactsByGroup(groupId)
      groupsService.deleteGroup(groupId)
      renderGroups()
      renderContacts()
      notifications.success('Группа успешно удалена')
    },
  })

  renderContacts()

  root.append(header.element, editContactPopover.element, notifications.element)
  containerElement.append(contactsList.element)
  mainElement.append(containerElement)
  root.append(mainElement)

  return root
}
