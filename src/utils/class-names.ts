type ClassNameValue = false | null | string | undefined

export function classNames(...values: ClassNameValue[]): string {
  return values.filter(Boolean).join(' ')
}
