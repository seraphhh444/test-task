import { Contact, type ContactData } from '@/entities/contact'
import { DuplicateEntityError } from '@/services/duplicate-entity-error'
import { LocalStorageRepository } from '@/services/local-storage-repository'

type CreateContactPayload = {
  groupId: string | null
  name: string
  phone: string
}

export class ContactsService {
  private readonly repository: LocalStorageRepository<ContactData[]>

  constructor(repository: LocalStorageRepository<ContactData[]>) {
    this.repository = repository
  }

  getContacts(): Contact[] {
    return this.repository.read().map((contact) => new Contact(contact))
  }

  private normalizePhone(phone: string): string {
    return phone.replace(/\D/g, '')
  }

  private hasDuplicatePhone(phone: string, excludedContactId?: string): boolean {
    const normalizedPhone = this.normalizePhone(phone)

    return this.repository.read().some((contact) => {
      if (contact.id === excludedContactId) {
        return false
      }

      return this.normalizePhone(contact.phone) === normalizedPhone
    })
  }

  addContact(payload: CreateContactPayload): Contact {
    if (this.hasDuplicatePhone(payload.phone)) {
      throw new DuplicateEntityError('Контакт с таким номером уже существует')
    }

    const nextContact = Contact.create(payload)
    const contacts = this.repository.read()

    this.repository.write([...contacts, nextContact.toJSON()])

    return nextContact
  }

  updateContact(contactId: string, payload: CreateContactPayload): Contact {
    if (this.hasDuplicatePhone(payload.phone, contactId)) {
      throw new DuplicateEntityError('Контакт с таким номером уже существует')
    }

    const updatedContact = new Contact({
      groupId: payload.groupId,
      id: contactId,
      name: payload.name,
      phone: payload.phone,
    })
    const nextContacts = this.repository.read().map((contact) =>
      contact.id === contactId ? updatedContact.toJSON() : contact,
    )

    this.repository.write(nextContacts)

    return updatedContact
  }

  deleteContact(contactId: string): void {
    const nextContacts = this.repository
      .read()
      .filter((contact) => contact.id !== contactId)

    this.repository.write(nextContacts)
  }

  deleteContactsByGroup(groupId: string): void {
    const nextContacts = this.repository
      .read()
      .filter((contact) => contact.groupId !== groupId)

    this.repository.write(nextContacts)
  }
}
