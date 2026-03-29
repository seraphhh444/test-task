export type GroupData = {
  id: string
  name: string
}

export class Group {
  readonly id: string
  readonly name: string

  constructor({ id, name }: GroupData) {
    this.id = id
    this.name = name.trim()
  }

  static create(name: string): Group {
    return new Group({
      id: crypto.randomUUID(),
      name,
    })
  }

  toJSON(): GroupData {
    return {
      id: this.id,
      name: this.name,
    }
  }
}
