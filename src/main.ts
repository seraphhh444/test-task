import '@/styles/main.scss'
import { createHeader } from '@/components/header'
import type { GroupData } from '@/entities/group'
import { GroupsService } from '@/services/groups-service'
import { LocalStorageRepository } from '@/services/local-storage-repository'
import { createElement } from '@/utils/create-element'

const appElement = document.querySelector<HTMLDivElement>('#app')

if (!appElement) {
  throw new Error('App root element was not found')
}

const mainElement = createElement('main', { className: 'app' })
const containerElement = createElement('div', { className: 'container' })
const groupsRepository = new LocalStorageRepository<GroupData[]>('groups', [])
const groupsService = new GroupsService(groupsRepository)

groupsService.initialize()

const headerElement = createHeader({ groupsService })

appElement.append(headerElement)
mainElement.append(containerElement)
appElement.append(mainElement)
