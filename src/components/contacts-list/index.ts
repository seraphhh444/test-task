import type { Contact } from '@/entities/contact'
import type { Group } from '@/entities/group'
import { createElement } from '@/utils/create-element'
import styles from './contacts-list.module.scss'

type RenderContactsListPayload = {
  contacts: Contact[]
  groups: Group[]
}

type ContactGroup = {
  contacts: Contact[]
  id: string
  name: string
}

export type ContactsListApi = {
  element: HTMLElement
  render: (payload: RenderContactsListPayload) => void
}

export function createContactsList(): ContactsListApi {
  const root = createElement('section', {
    className: styles['contacts-list'],
  })
  let expandedGroupIds = new Set<string>()

  const getContactGroups = (
    contacts: Contact[],
    groups: Group[],
  ): ContactGroup[] => {
    const groupedContacts = new Map<string, Contact[]>()

    contacts.forEach((contact) => {
      const groupId = contact.groupId ?? 'ungrouped'
      const currentContacts = groupedContacts.get(groupId) ?? []

      currentContacts.push(contact)
      groupedContacts.set(groupId, currentContacts)
    })

    return Array.from(groupedContacts.entries()).map(([groupId, groupContacts]) => {
      const group = groups.find((item) => item.id === groupId)

      return {
        contacts: groupContacts,
        id: groupId,
        name: group?.name ?? 'Без группы',
      }
    })
  }

  const render = ({ contacts, groups }: RenderContactsListPayload): void => {
    if (contacts.length === 0) {
      root.innerHTML = `
        <p class="${styles['contacts-list__empty']}">Список контактов пуст</p>
      `

      return
    }

    const contactGroups = getContactGroups(contacts, groups)

    expandedGroupIds = new Set(
      Array.from(expandedGroupIds).filter((groupId) =>
        contactGroups.some((group) => group.id === groupId),
      ),
    )

    root.innerHTML = `
      <div class="${styles['contacts-list__groups']}">
        ${contactGroups
          .map((group) => {
            const isExpanded = expandedGroupIds.has(group.id)

            return `
              <article class="${styles['contacts-list__group']} ${isExpanded ? styles['contacts-list__group--expanded'] : ''}">
                <button
                  type="button"
                  class="${styles['contacts-list__group-toggle']}"
                  data-group-id="${group.id}"
                  aria-expanded="${String(isExpanded)}"
                >
                  <span class="${styles['contacts-list__group-title']}">${group.name}</span>
                  <span class="${styles['contacts-list__group-arrow']}"></span>
                </button>
                ${
                  isExpanded
                    ? `
                      <div class="${styles['contacts-list__group-content']}">
                        <div class="${styles['contacts-list__divider']}"></div>
                        ${group.contacts
                          .map(
                            (contact, index) => `
                              <article class="${styles['contacts-list__contact']}">
                                <p class="${styles['contacts-list__contact-name']}">${contact.name}</p>
                                <div class="${styles['contacts-list__contact-row']}">
                                  <p class="${styles['contacts-list__contact-phone']}">${contact.phone}</p>
                                  <div class="${styles['contacts-list__contact-actions']}">
                                    <button
                                      type="button"
                                      class="${styles['contacts-list__action-button']}"
                                      aria-label="Редактировать контакт ${contact.name}"
                                    >
                                      <img
                                        class="${styles['contacts-list__edit-icon']}"
                                        src="/icons/edit-contact-icon.svg"
                                        alt=""
                                      >
                                    </button>
                                    <button
                                      type="button"
                                      class="${styles['contacts-list__action-button']}"
                                      aria-label="Удалить контакт ${contact.name}"
                                    >
                                      <img
                                        class="${styles['contacts-list__delete-icon']}"
                                        src="/icons/delete-contact.svg"
                                        alt=""
                                      >
                                    </button>
                                  </div>
                                </div>
                              </article>
                              ${
                                index < group.contacts.length - 1
                                  ? `<div class="${styles['contacts-list__divider']}"></div>`
                                  : ''
                              }
                            `,
                          )
                          .join('')}
                      </div>
                    `
                    : ''
                }
              </article>
            `
          })
          .join('')}
      </div>
    `
  }

  root.addEventListener('click', (event) => {
    const target = event.target

    if (!(target instanceof HTMLElement)) {
      return
    }

    const toggle = target.closest<HTMLButtonElement>(
      `.${styles['contacts-list__group-toggle']}`,
    )

    if (!toggle) {
      return
    }

    const groupId = toggle.dataset.groupId

    if (!groupId) {
      return
    }

    if (expandedGroupIds.has(groupId)) {
      expandedGroupIds.delete(groupId)
    } else {
      expandedGroupIds.add(groupId)
    }

    toggle.dispatchEvent(new CustomEvent('contacts-list:rerender', { bubbles: true }))
  })

  root.addEventListener('contacts-list:rerender', () => {
    const contacts = root.dataset.contacts
    const groups = root.dataset.groups

    if (!contacts || !groups) {
      return
    }

    render({
      contacts: JSON.parse(contacts) as Contact[],
      groups: JSON.parse(groups) as Group[],
    })
  })

  return {
    element: root,
    render: (payload) => {
      root.dataset.contacts = JSON.stringify(payload.contacts)
      root.dataset.groups = JSON.stringify(payload.groups)
      render(payload)
    },
  }
}
