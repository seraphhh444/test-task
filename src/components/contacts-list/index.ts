import type { Contact } from '@/entities/contact'
import type { Group } from '@/entities/group'
import { createElement } from '@/utils/create-element'
import styles from './contacts-list.module.scss'

type RenderContactsListPayload = {
  contacts: Contact[]
  groups: Group[]
}

export type ContactsListApi = {
  element: HTMLElement
  render: (payload: RenderContactsListPayload) => void
}

export function createContactsList(): ContactsListApi {
  const root = createElement('section', {
    className: styles['contacts-list'],
  })

  const render = ({ contacts, groups }: RenderContactsListPayload): void => {
    if (contacts.length === 0) {
      root.innerHTML = `
        <p class="${styles['contacts-list__empty']}">Список контактов пуст</p>
      `

      return
    }

    root.innerHTML = `
      <div class="${styles['contacts-list__items']}">
        ${contacts
          .map((contact) => {
            const groupName = groups.find(
              (group) => group.id === contact.groupId,
            )?.name

            return `
              <article class="${styles['contacts-list__item']}">
                <h3 class="${styles['contacts-list__name']}">${contact.name}</h3>
                <p class="${styles['contacts-list__meta']}">${contact.phone}</p>
                <p class="${styles['contacts-list__meta']}">${groupName ?? 'Без группы'}</p>
              </article>
            `
          })
          .join('')}
      </div>
    `
  }

  return {
    element: root,
    render,
  }
}
