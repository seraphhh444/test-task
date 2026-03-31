import IMask from 'imask'
import { GroupDropdown } from '@/components/group-dropdown'
import { OverlayController } from '@/components/overlay-controller'
import type { Group } from '@/entities/group'
import { ContactFormValidator } from '@/services/contact-form-validator'
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
  const overlay = new OverlayController({
    backdropClassName: styles['add-contact-popover-root__backdrop'],
    openClassName: styles['add-contact-popover-root--open'],
    panelClassName: styles['add-contact-popover'],
    rootClassName: styles['add-contact-popover-root'],
  })

  overlay.panel.setAttribute('aria-label', title)
  overlay.panel.innerHTML = `
    <div class="${styles['add-contact-popover__header']}">
      <h2 class="${styles['add-contact-popover__title']}">${title}</h2>
      <button
        type="button"
        class="${styles['add-contact-popover__close-button']}"
        aria-label="Закрыть форму контакта"
      >
        <span class="${styles['add-contact-popover__close-icon']}"></span>
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
      <div
        class="${styles['add-contact-popover__group-field']}"
        data-role="group-dropdown"
      ></div>
      <div class="${styles['add-contact-popover__form-actions']}">
        <button
          type="submit"
          class="${styles['add-contact-popover__submit-button']}"
        >
          ${submitButtonText}
        </button>
      </div>
    </form>
  `

  const closeButton = overlay.panel.querySelector<HTMLButtonElement>(
    `.${styles['add-contact-popover__close-button']}`,
  )
  const form = overlay.panel.querySelector<HTMLFormElement>(
    `.${styles['add-contact-popover__form']}`,
  )
  const nameField = form?.elements.namedItem('name') as HTMLInputElement | null
  const phoneField = form?.elements.namedItem('phone') as HTMLInputElement | null
  const groupField = overlay.panel.querySelector<HTMLElement>('[data-role="group-dropdown"]')
  const phoneMask = phoneField
    ? IMask(phoneField, {
        mask: '+{7} (000) 000 - 00 - 00',
      })
    : null

  if (!groupField) {
    throw new Error('group dropdown mount not found')
  }

  const groupDropdown = new GroupDropdown({
    placeholder: GROUP_PLACEHOLDER,
  })

  groupField.append(groupDropdown.element)

  let selectedGroupId: string | null = null

  groupDropdown.bind('change', ({ value }) => {
    selectedGroupId = value
  })

  const setFieldError = (
    fieldName: 'name' | 'phone',
    message?: string,
  ): void => {
    const fieldGroupElement = overlay.panel.querySelector<HTMLElement>(
      `[data-field-group="${fieldName}"]`,
    )
    const fieldMessage = overlay.panel.querySelector<HTMLElement>(
      `[data-field-message="${fieldName}"]`,
    )

    fieldGroupElement?.classList.toggle(
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

  const renderGroups = (nextGroups: Group[]): void => {
    groups = nextGroups

    groupDropdown.dataItems = groups.map((group) => ({
      id: group.id,
      label: group.name,
    }))

    if (!groups.some((group) => group.id === selectedGroupId)) {
      selectedGroupId = null
      groupDropdown.setValue(null)
    }
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
    groupDropdown.setValue(selectedGroupId)
    clearFieldError('name')
    clearFieldError('phone')
    groupDropdown.close()
  }

  const close = (): void => {
    overlay.close()
  }

  const open = (values?: ContactFormPopoverValues): void => {
    applyValues(values)
    overlay.open()
  }

  overlay.onClose = () => {
    applyValues()
    onClose?.()
  }

  closeButton?.addEventListener('click', close)
  form?.addEventListener('click', (event) => {
    const target = event.target

    if (!(target instanceof Node)) {
      return
    }

    if (!groupDropdown.contains(target)) {
      groupDropdown.close()
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
    if (event.key === 'Escape' && groupDropdown.isOpen()) {
      groupDropdown.close()
    }
  })

  renderGroups(groups)
  applyValues()

  return {
    close,
    element: overlay.element,
    isOpen: () => overlay.isOpen(),
    open,
    renderGroups,
  }
}
