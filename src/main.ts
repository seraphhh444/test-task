import '@/styles/main.scss'
import { createContactsList } from '@/components/contacts-list'
import { createHeader } from '@/components/header'
import type { ContactData } from '@/entities/contact'
import type { GroupData } from '@/entities/group'
import { ContactsService } from '@/services/contacts-service'
import { GroupsService } from '@/services/groups-service'
import { LocalStorageRepository } from '@/services/local-storage-repository'
import { createElement } from '@/utils/create-element'

const appElement = document.querySelector<HTMLDivElement>('#app')

if (!appElement) {
  throw new Error('App root element was not found')
}

const mainElement = createElement('main', { className: 'app' })
const containerElement = createElement('div', { className: 'container' })
const contactsList = createContactsList()
const contactsRepository = new LocalStorageRepository<ContactData[]>('contacts', [])
const contactsService = new ContactsService(contactsRepository)
const groupsRepository = new LocalStorageRepository<GroupData[]>('groups', [])
const groupsService = new GroupsService(groupsRepository)

groupsService.initialize()

const renderContacts = (): void => {
  contactsList.render({
    contacts: contactsService.getContacts(),
    groups: groupsService.getGroups(),
  })
}

const headerElement = createHeader({
  contactsService,
  groupsService,
  onContactsChange: renderContacts,
})

renderContacts()

appElement.append(headerElement)
containerElement.append(contactsList.element)
mainElement.append(containerElement)
appElement.append(mainElement)
