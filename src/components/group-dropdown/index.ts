import checkIcon from '@/assets/check-group.svg'
import { createElement } from '@/utils/create-element'
import styles from './group-dropdown.module.scss'

export type GroupDropdownItem = {
  id: string
  label: string
}

export type GroupDropdownEventMap = {
  change: { item: GroupDropdownItem | null; value: string | null }
  close: undefined
  open: undefined
}

type GroupDropdownEventName = keyof GroupDropdownEventMap
type GroupDropdownListener<EventName extends GroupDropdownEventName> = (
  payload: GroupDropdownEventMap[EventName],
) => void

type GroupDropdownOptions = {
  placeholder: string
}

export class GroupDropdown {
  readonly element: HTMLElement

  private readonly trigger: HTMLButtonElement
  private readonly triggerText: HTMLElement
  private readonly picker: HTMLElement
  private readonly menu: HTMLElement
  private readonly placeholder: string
  private readonly listeners: {
    [EventName in GroupDropdownEventName]: Set<GroupDropdownListener<EventName>>
  } = {
    change: new Set(),
    close: new Set(),
    open: new Set(),
  }

  private items: GroupDropdownItem[] = []
  private selectedId: string | null = null

  constructor({ placeholder }: GroupDropdownOptions) {
    this.placeholder = placeholder
    this.element = createElement('div', {
      className: styles['group-dropdown'],
    })

    this.element.innerHTML = `
      <button
        type="button"
        class="${styles['group-dropdown__trigger']}"
        aria-expanded="false"
      >
        <span class="${styles['group-dropdown__trigger-text']}">${placeholder}</span>
        <img
          class="${styles['group-dropdown__icon']}"
          src="${checkIcon}"
          alt=""
        >
      </button>
      <div class="${styles['group-dropdown__picker']}" hidden>
        <div class="${styles['group-dropdown__menu']}"></div>
      </div>
    `

    const trigger = this.element.querySelector<HTMLButtonElement>(
      `.${styles['group-dropdown__trigger']}`,
    )
    const triggerText = this.element.querySelector<HTMLElement>(
      `.${styles['group-dropdown__trigger-text']}`,
    )
    const picker = this.element.querySelector<HTMLElement>(
      `.${styles['group-dropdown__picker']}`,
    )
    const menu = this.element.querySelector<HTMLElement>(
      `.${styles['group-dropdown__menu']}`,
    )

    if (!trigger || !triggerText || !picker || !menu) {
      throw new Error('group dropdown markup not initialized')
    }

    this.trigger = trigger
    this.triggerText = triggerText
    this.picker = picker
    this.menu = menu

    this.trigger.addEventListener('click', () => {
      this.toggle()
    })
    this.menu.addEventListener('click', (event) => {
      const target = event.target

      if (!(target instanceof HTMLElement)) {
        return
      }

      const option = target.closest<HTMLButtonElement>(
        `.${styles['group-dropdown__option']}`,
      )

      if (!option) {
        return
      }

      this.setValue(option.dataset.groupId ?? null)
      this.close()
      this.emit('change', {
        item: this.getSelectedItem(),
        value: this.selectedId,
      })
    })
  }

  bind<EventName extends GroupDropdownEventName>(
    eventName: EventName,
    listener: GroupDropdownListener<EventName>,
  ): () => void {
    this.listeners[eventName].add(listener)

    return () => {
      this.listeners[eventName].delete(listener)
    }
  }

  get dataItems(): GroupDropdownItem[] {
    return this.items
  }

  set dataItems(items: GroupDropdownItem[]) {
    this.items = [...items]

    if (!this.items.some((item) => item.id === this.selectedId)) {
      this.selectedId = null
    }

    this.renderItems()
    this.syncSelectedItem()
  }

  contains(target: Node | null): boolean {
    return !!target && this.element.contains(target)
  }

  isOpen(): boolean {
    return this.element.classList.contains(styles['group-dropdown--open'])
  }

  open(): void {
    if (this.isOpen()) {
      return
    }

    this.element.classList.add(styles['group-dropdown--open'])
    this.trigger.setAttribute('aria-expanded', 'true')
    this.picker.removeAttribute('hidden')
    this.emit('open', undefined)
  }

  close(): void {
    if (!this.isOpen()) {
      return
    }

    this.element.classList.remove(styles['group-dropdown--open'])
    this.trigger.setAttribute('aria-expanded', 'false')
    this.picker.setAttribute('hidden', '')
    this.emit('close', undefined)
  }

  toggle(): void {
    if (this.isOpen()) {
      this.close()
      return
    }

    this.open()
  }

  setValue(value: string | null): void {
    this.selectedId = this.items.some((item) => item.id === value) ? value : null
    this.syncSelectedItem()
  }

  getValue(): string | null {
    return this.selectedId
  }

  private emit<EventName extends GroupDropdownEventName>(
    eventName: EventName,
    payload: GroupDropdownEventMap[EventName],
  ): void {
    this.listeners[eventName].forEach((listener) => {
      listener(payload)
    })
  }

  private getSelectedItem(): GroupDropdownItem | null {
    return this.items.find((item) => item.id === this.selectedId) ?? null
  }

  private renderItems(): void {
    this.menu.innerHTML = this.items
      .map(
        (item) => `
          <button
            type="button"
            class="${styles['group-dropdown__option']}"
            data-group-id="${item.id}"
          >
            ${item.label}
          </button>
        `,
      )
      .join('')
  }

  private syncSelectedItem(): void {
    const selectedItem = this.getSelectedItem()

    this.triggerText.textContent = selectedItem?.label ?? this.placeholder
    this.triggerText.classList.toggle(
      styles['group-dropdown__trigger-text--selected'],
      Boolean(selectedItem),
    )

    const options = this.menu.querySelectorAll<HTMLButtonElement>(
      `.${styles['group-dropdown__option']}`,
    )

    options.forEach((option) => {
      const isActive = option.dataset.groupId === (this.selectedId ?? '')

      option.classList.toggle(styles['group-dropdown__option--active'], isActive)
    })
  }
}
