import { Group, type GroupData } from '@/entities/group'
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

  deleteGroup(groupId: string): void {
    const nextGroups = this.repository
      .read()
      .filter((group) => group.id !== groupId)

    this.repository.write(nextGroups)
  }
}
