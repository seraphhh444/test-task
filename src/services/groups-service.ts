import { Group, type GroupData } from '@/entities/group'
import { DuplicateEntityError } from '@/services/duplicate-entity-error'
import { LocalStorageRepository } from '@/services/local-storage-repository'

const DEFAULT_GROUP_NAMES = ['Друзья', 'Коллеги']

export class GroupsService {
  private readonly repository: LocalStorageRepository<GroupData[]>

  constructor(
    repository: LocalStorageRepository<GroupData[]>,
  ) {
    this.repository = repository
  }

  initialize(): void {
    const groups = this.repository.read()

    if (groups.length > 0) {
      return
    }

    this.repository.write(
      DEFAULT_GROUP_NAMES.map((name) => Group.create(name).toJSON()),
    )
  }

  getGroups(): Group[] {
    return this.repository.read().map((group) => new Group(group))
  }

  addGroup(name: string): Group {
    const normalizedName = name.trim()
    const groups = this.repository.read()
    const isDuplicate = groups.some(
      (group) => group.name.trim().toLowerCase() === normalizedName.toLowerCase(),
    )

    if (isDuplicate) {
      throw new DuplicateEntityError('Группа с таким названием уже существует')
    }

    const nextGroup = Group.create(normalizedName)

    this.repository.write([...groups, nextGroup.toJSON()])

    return nextGroup
  }

  deleteGroup(groupId: string): void {
    const nextGroups = this.repository
      .read()
      .filter((group) => group.id !== groupId)

    this.repository.write(nextGroups)
  }
}
