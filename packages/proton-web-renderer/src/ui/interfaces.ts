import type {Readable, Writable} from 'svelte/store'
import type {ROUTES, SUPPORTED_WALLETS} from './constants'
import type {UILoadingPayload} from '../types'

export type UITheme = 'light' | 'dark' | string

export type UIButtonAppearance = 'primary' | 'outlined' | 'secondary' | 'accent' | 'flat'

export type UIRouteValue = (typeof ROUTES)[keyof typeof ROUTES]

export type UIWalletType = (typeof SUPPORTED_WALLETS)[keyof typeof SUPPORTED_WALLETS]

export interface UIAppInfo {
  name?: string
  logo?: string
  logoRounded?: boolean
}

/** The router for the sections of the UI */
export interface UIRouterState {
  path?: UIRouteValue
  history: UIRouteValue[]
}

export interface UIRouter extends Writable<UIRouterState> {
  back: () => void
  push: (_: UIRouteValue) => void
  onchange: Readable<{has_history: boolean}>
}

export interface UIThemeOptions {
  base?: {
    textColorBase?: string
    textColorSecondary?: string
    textColorLink?: string
    textColorSecondaryLink?: string

    bodyBackground?: string

    scrollBackground?: string
    scrollThumbBackground?: string

    logoBackgroundColor?: string

    borderColor?: string
    windowBorderColor?: string

    countdownBackground?: string
  }

  tabs?: {
    background?: string
    backgroundActive?: string
    textColorActive?: string
  }

  list?: {
    background?: string
    borderColor?: string
  }

  button?: {
    icon?: {
      backgroundHover?: string
    }
    primary?: {
      borderColor?: string
      borderColorHover?: string
      backgroundHover?: string
    }
    outlined?: {
      borderColor?: string
      borderColorHover?: string
    }
    accent?: {
      background?: string
      backgroundHover?: string
      textColor?: string
    }
    flat?: {
      textColor?: string
      textColorHover?: string
    }
  }
}

/** The properties of the UI */
export interface UIProps {
  theme?: UITheme
  themes?: Record<UITheme, UIThemeOptions>
  appInfo?: UIAppInfo
}

export interface UIWalletConfig {
  name: string
  label?: string
}

export interface UIError {
  name: string
  description?: string
}

export type UIWalletSelectResponse = {
  reject: (_: Error) => void
  // eslint-disable-next-line no-unused-vars
  resolve: (walletType: string) => void
}

export type UIDemo = {
  // eslint-disable-next-line no-unused-vars
  selectWallet: (walletType: string) => void

  close: () => void
  // eslint-disable-next-line no-unused-vars
  sign: (walletType: string) => void
  // eslint-disable-next-line no-unused-vars
  signManually: (walletType: string) => void
  // eslint-disable-next-line no-unused-vars
  timeout: (walletType: string) => void

  // eslint-disable-next-line no-unused-vars
  showLoading: (payload?: UILoadingPayload) => void
}

export interface WritableWithReset<T> extends Writable<T | undefined> {
  reset: () => void
}

export interface UIQRData {
  code: string
  link: string
}

export interface UISignData {
  timeout?: number
  deviceName?: string
}
