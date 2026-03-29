import { Contact, type ContactData } from '@/entities/contact'
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

  addContact(payload: CreateContactPayload): Contact {
    const nextContact = Contact.create(payload)
    const contacts = this.repository.read()

    this.repository.write([...contacts, nextContact.toJSON()])

    return nextContact
  }

  deleteContactsByGroup(groupId: string): void {
    const nextContacts = this.repository
      .read()
      .filter((contact) => contact.groupId !== groupId)

    this.repository.write(nextContacts)
  }
}
