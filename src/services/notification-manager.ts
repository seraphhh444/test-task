import { createToast } from '@/components/toast'

type NotificationVariant = 'error' | 'success'

export class NotificationManager {
  private readonly toast = createToast()

  get element(): HTMLElement {
    return this.toast.element
  }

  show(message: string, variant: NotificationVariant = 'error'): void {
    this.toast.show(message, variant)
  }

  success(message: string): void {
    this.show(message, 'success')
  }

  error(message: string): void {
    this.show(message, 'error')
  }
}
