import IMask from 'imask'
import type { Group } from '@/entities/group'
import { ContactFormValidator } from '@/services/contact-form-validator'
import { createElement } from '@/utils/create-element'
import checkIcon from '@/assets/check-group.svg'
import styles from './add-contact-popover.module.scss'

export type ContactFormPopoverPayload = {
  groupId: string | null
  name: string
  phone: string
}

type ContactFormPopoverValues = ContactFormPopoverPayload

export type ContactFormPopoverApi = {
  close: () => void
  element: HTMLElement
  isOpen: () => boolean
  open: (values?: ContactFormPopoverValues) => void
  renderGroups: (groups: Group[]) => void
}

type CreateContactFormPopoverOptions = {
  groups?: Group[]
  onClose?: () => void
  onSubmit?: (payload: ContactFormPopoverPayload) => boolean | void
  submitButtonText: string
  title: string
}

const GROUP_PLACEHOLDER = 'Выберите группу'

export function createContactFormPopover({
  groups = [],
  onClose,
  onSubmit,
  submitButtonText,
  title,
}: CreateContactFormPopoverOptions): ContactFormPopoverApi {
  const validator = new ContactFormValidator()
  const root = createElement('div', {
    className: styles['add-contact-popover-root'],
  })

  root.innerHTML = `
    <div class="${styles['add-contact-popover-root__backdrop']}"></div>
    <section class="${styles['add-contact-popover']}" aria-label="${title}">
      <div class="${styles['add-contact-popover__header']}">
        <h2 class="${styles['add-contact-popover__title']}">${title}</h2>
        <button
          type="button"
          class="${styles['add-contact-popover__close-button']}"
          aria-label="Закрыть форму контакта"
        >
          <img
            class="${styles['add-contact-popover__close-icon']}"
            src="/icons/close-popover-icon.svg"
            alt=""
          >
        </button>
      </div>
      <form class="${styles['add-contact-popover__form']}">
        <div
          class="${styles['add-contact-popover__field-group']}"
          data-field-group="name"
        >
          <input
            class="${styles['add-contact-popover__field']}"
            name="name"
            type="text"
            placeholder="Введите ФИО"
          >
          <p
            class="${styles['add-contact-popover__field-message']}"
            data-field-message="name"
            hidden
          ></p>
        </div>
        <div
          class="${styles['add-contact-popover__field-group']}"
          data-field-group="phone"
        >
          <input
            class="${styles['add-contact-popover__field']}"
            name="phone"
            type="tel"
            placeholder="Введите номер"
          >
          <p
            class="${styles['add-contact-popover__field-message']}"
            data-field-message="phone"
            hidden
          ></p>
        </div>
        <div class="${styles['add-contact-popover__group-field']}">
          <button
            type="button"
            class="${styles['add-contact-popover__field']} ${styles['add-contact-popover__group-trigger']}"
            aria-expanded="false"
          >
            <span class="${styles['add-contact-popover__group-trigger-text']}">${GROUP_PLACEHOLDER}</span>
            <img
                      class="${styles['contacts-list__arrow']}"
                      src="${checkIcon}"
                      alt=""
            >
          </button>
          <div class="${styles['add-contact-popover__picker']}" hidden>
            <div class="${styles['add-contact-popover__picker-menu']}"></div>
          </div>
        </div>
        <div class="${styles['add-contact-popover__form-actions']}">
          <button
            type="submit"
            class="${styles['add-contact-popover__submit-button']}"
          >
            ${submitButtonText}
          </button>
        </div>
      </form>
    </section>
  `

  const backdrop = root.querySelector<HTMLElement>(
    `.${styles['add-contact-popover-root__backdrop']}`,
  )
  const closeButton = root.querySelector<HTMLButtonElement>(
    `.${styles['add-contact-popover__close-button']}`,
  )
  const form = root.querySelector<HTMLFormElement>(
    `.${styles['add-contact-popover__form']}`,
  )
  const nameField = form?.elements.namedItem('name') as HTMLInputElement | null
  const phoneField = form?.elements.namedItem('phone') as HTMLInputElement | null
  const groupField = root.querySelector<HTMLElement>(
    `.${styles['add-contact-popover__group-field']}`,
  )
  const groupTrigger = root.querySelector<HTMLButtonElement>(
    `.${styles['add-contact-popover__group-trigger']}`,
  )
  const groupTriggerText = root.querySelector<HTMLElement>(
    `.${styles['add-contact-popover__group-trigger-text']}`,
  )
  const picker = root.querySelector<HTMLElement>(
    `.${styles['add-contact-popover__picker']}`,
  )
  const pickerMenu = root.querySelector<HTMLElement>(
    `.${styles['add-contact-popover__picker-menu']}`,
  )
  const phoneMask = phoneField
    ? IMask(phoneField, {
        mask: '+{7} (000) 000 - 00 - 00',
      })
    : null

  let selectedGroupId: string | null = null

  const setFieldError = (
    fieldName: 'name' | 'phone',
    message?: string,
  ): void => {
    const fieldGroup = root.querySelector<HTMLElement>(
      `[data-field-group="${fieldName}"]`,
    )
    const fieldMessage = root.querySelector<HTMLElement>(
      `[data-field-message="${fieldName}"]`,
    )

    fieldGroup?.classList.toggle(
      styles['add-contact-popover__field-group--error'],
      Boolean(message),
    )

    if (!fieldMessage) {
      return
    }

    fieldMessage.textContent = message ?? ''
    fieldMessage.hidden = !message
  }

  const clearFieldError = (fieldName: 'name' | 'phone'): void => {
    setFieldError(fieldName)
  }

  const closePicker = (): void => {
    picker?.setAttribute('hidden', '')
    groupField?.classList.remove(styles['add-contact-popover__group-field--open'])
    groupTrigger?.setAttribute('aria-expanded', 'false')
  }

  const openPicker = (): void => {
    picker?.removeAttribute('hidden')
    groupField?.classList.add(styles['add-contact-popover__group-field--open'])
    groupTrigger?.setAttribute('aria-expanded', 'true')
  }

  const syncSelectedGroup = (): void => {
    const selectedGroup = groups.find((group) => group.id === selectedGroupId)

    if (groupTriggerText) {
      groupTriggerText.textContent = selectedGroup?.name ?? GROUP_PLACEHOLDER
      groupTriggerText.classList.toggle(
        styles['add-contact-popover__group-trigger-text--selected'],
        Boolean(selectedGroup),
      )
    }

    if (!pickerMenu) {
      return
    }

    const items = pickerMenu.querySelectorAll<HTMLButtonElement>(
      `.${styles['add-contact-popover__group-option']}`,
    )

    items.forEach((item) => {
      const isActive = item.dataset.groupId === (selectedGroupId ?? '')

      item.classList.toggle(
        styles['add-contact-popover__group-option--active'],
        isActive,
      )
    })
  }

  const renderGroups = (nextGroups: Group[]): void => {
    groups = nextGroups

    if (!groups.some((group) => group.id === selectedGroupId)) {
      selectedGroupId = null
    }

    if (!pickerMenu) {
      return
    }

    pickerMenu.innerHTML = groups
      .map(
        (group) => `
          <button
            type="button"
            class="${styles['add-contact-popover__group-option']}"
            data-group-id="${group.id}"
          >
            ${group.name}
          </button>
        `,
      )
      .join('')

    syncSelectedGroup()
  }

  const applyValues = (values?: ContactFormPopoverValues): void => {
    if (nameField) {
      nameField.value = values?.name ?? ''
    }

    if (phoneMask) {
      phoneMask.value = values?.phone ?? ''
    } else if (phoneField) {
      phoneField.value = values?.phone ?? ''
    }

    selectedGroupId = values?.groupId ?? null
    clearFieldError('name')
    clearFieldError('phone')
    syncSelectedGroup()
    closePicker()
  }

  const close = (): void => {
    root.classList.remove(styles['add-contact-popover-root--open'])
    applyValues()
    onClose?.()
  }

  const open = (values?: ContactFormPopoverValues): void => {
    applyValues(values)
    root.classList.add(styles['add-contact-popover-root--open'])
  }

  const isOpen = (): boolean =>
    root.classList.contains(styles['add-contact-popover-root--open'])

  backdrop?.addEventListener('click', close)
  closeButton?.addEventListener('click', close)
  form?.addEventListener('click', (event) => {
    const target = event.target

    if (!(target instanceof HTMLElement)) {
      return
    }

    if (!target.closest(`.${styles['add-contact-popover__group-field']}`)) {
      closePicker()
    }
  })
  nameField?.addEventListener('input', () => {
    if (nameField.value.trim()) {
      clearFieldError('name')
    }
  })
  phoneField?.addEventListener('input', () => {
    if (phoneMask?.unmaskedValue.length === 11) {
      clearFieldError('phone')
    }
  })
  groupTrigger?.addEventListener('click', () => {
    if (picker?.hasAttribute('hidden')) {
      openPicker()
      return
    }

    closePicker()
  })
  pickerMenu?.addEventListener('click', (event) => {
    const target = event.target

    if (!(target instanceof HTMLElement)) {
      return
    }

    const option = target.closest<HTMLButtonElement>(
      `.${styles['add-contact-popover__group-option']}`,
    )

    if (!option) {
      return
    }

    selectedGroupId = option.dataset.groupId ?? null
    syncSelectedGroup()
    closePicker()
  })
  form?.addEventListener('submit', (event) => {
    event.preventDefault()

    const formData = new FormData(form)
    const name = String(formData.get('name') ?? '').trim()
    const phone = phoneMask?.value.trim() ?? String(formData.get('phone') ?? '').trim()
    const phoneDigits = phoneMask?.unmaskedValue ?? ''
    const errors = validator.validate({ name, phone, phoneDigits })

    setFieldError('name', errors.name)
    setFieldError('phone', errors.phone)

    if (errors.name || errors.phone) {
      return
    }

    const submitResult = onSubmit?.({
      groupId: selectedGroupId,
      name,
      phone,
    })

    if (submitResult === false) {
      return
    }

    close()
  })
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isOpen()) {
      close()
    }
  })

  renderGroups(groups)
  applyValues()

  return {
    close,
    element: root,
    isOpen,
    open,
    renderGroups,
  }
}
