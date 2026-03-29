export type ContactFormValues = {
  name: string
  phoneDigits: string
  phone: string
}

export type ContactFormErrors = Partial<Record<keyof ContactFormValues, string>>

export class ContactFormValidator {
  validate(values: ContactFormValues): ContactFormErrors {
    const errors: ContactFormErrors = {}

    if (!values.name.trim()) {
      errors.name = 'Поле обязательно для заполнения'
    }

    if (!values.phone.trim()) {
      errors.phone = 'Поле обязательно для заполнения'
    } else if (values.phoneDigits.length < 11) {
      errors.phone = 'Введите номер полностью'
    }

    return errors
  }
}
