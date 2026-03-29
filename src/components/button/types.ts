export type CreateButtonOptions = {
  text: string
  className?: string
  disabled?: boolean
  onClick?: (event: MouseEvent) => void
  type?: 'button' | 'submit' | 'reset'
}
