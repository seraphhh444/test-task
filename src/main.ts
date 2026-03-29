import '@/styles/main.scss'
import { createMainPage } from '@/pages/main'

const appElement = document.querySelector<HTMLDivElement>('#app')

if (!appElement) {
  throw new Error('App root element was not found')
}

appElement.append(createMainPage())
