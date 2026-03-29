export type ContactData = {
  groupId: string | null
  id: string
  name: string
  phone: string
}

export class Contact {
  readonly groupId: string | null
  readonly id: string
  readonly name: string
  readonly phone: string

  constructor({ groupId, id, name, phone }: ContactData) {
    this.groupId = groupId
    this.id = id
    this.name = name.trim()
    this.phone = phone.trim()
  }

  static create({
    groupId,
    name,
    phone,
  }: Omit<ContactData, 'id'>): Contact {
    return new Contact({
      groupId,
      id: crypto.randomUUID(),
      name,
      phone,
    })
  }

  toJSON(): ContactData {
    return {
      groupId: this.groupId,
      id: this.id,
      name: this.name,
      phone: this.phone,
    }
  }
}
