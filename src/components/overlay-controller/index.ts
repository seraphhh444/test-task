import { createElement } from '@/utils/create-element'

type OverlayControllerOptions = {
  backdropClassName: string
  closeOnBackdrop?: boolean
  closeOnEscape?: boolean
  openClassName: string
  panelClassName: string
  panelTagName?: keyof HTMLElementTagNameMap
  rootClassName: string
}

export class OverlayController {
  readonly backdrop: HTMLElement
  readonly element: HTMLElement
  onClose?: () => void
  readonly panel: HTMLElement

  private readonly closeOnEscape: boolean
  private readonly openClassName: string

  constructor({
    backdropClassName,
    closeOnBackdrop = true,
    closeOnEscape = true,
    openClassName,
    panelClassName,
    panelTagName = 'section',
    rootClassName,
  }: OverlayControllerOptions) {
    this.closeOnEscape = closeOnEscape
    this.openClassName = openClassName
    this.element = createElement('div', {
      className: rootClassName,
    })
    this.backdrop = createElement('div', {
      className: backdropClassName,
    })
    this.panel = createElement(panelTagName, {
      className: panelClassName,
    })

    this.element.append(this.backdrop, this.panel)

    if (closeOnBackdrop) {
      this.backdrop.addEventListener('click', () => {
        this.close()
      })
    }

    if (this.closeOnEscape) {
      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && this.isOpen()) {
          this.close()
        }
      })
    }
  }

  close(): void {
    this.element.classList.remove(this.openClassName)
    this.onClose?.()
  }

  isOpen(): boolean {
    return this.element.classList.contains(this.openClassName)
  }

  open(): void {
    this.element.classList.add(this.openClassName)
  }

  toggle(): void {
    if (this.isOpen()) {
      this.close()
      return
    }

    this.open()
  }
}
