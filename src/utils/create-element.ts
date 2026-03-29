type CreateElementOptions = {
  className?: string;
  textContent?: string;
};

export function createElement<TagName extends keyof HTMLElementTagNameMap>(
  tagName: TagName,
  options: CreateElementOptions = {},
): HTMLElementTagNameMap[TagName] {
  const { className, textContent } = options;
  const element = document.createElement(tagName);

  if (className) {
    element.className = className;
  }

  if (textContent) {
    element.textContent = textContent;
  }

  return element;
}
