import type {Link, LinkOptions, LinkSession, LinkStorage, LoginResult} from '@proton/link'
import type {BrowserTransportOptions} from '@proton/browser-transport'
import type {ProtonWebLink} from './links/protonWeb'
import type {UIRenderer, UIRendererOptions} from '@proton/web-renderer'

type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

export type UIOptions = UIRendererOptions

export interface SelectorOptions {
  walletType?: string
  enabledWalletTypes?: string[]
}

export type LocalLinkOptions = PartialBy<LinkOptions, 'transport' | 'chains' | 'scheme'> & {
  endpoints: string[]
  storage?: LinkStorage
  storagePrefix?: string
  restoreSession?: boolean
  testUrl?: string
}

export interface ConnectWalletArgs {
  linkOptions: LocalLinkOptions
  transportOptions?: BrowserTransportOptions
  selectorOptions?: SelectorOptions
  uiOptions?: UIOptions
}

export interface ConnectWalletRet {
  session?: LinkSession
  link?: ProtonWebLink | Link
  loginResult?: LoginResult
  error?: any
  renderer?: UIRenderer
}

export interface WalletItem {
  key: string
  value: string
}

export interface LoginOptions {
  selectorOptions: SelectorOptions
  linkOptions: LocalLinkOptions
  transportOptions: BrowserTransportOptions
  uiOptions: UIOptions
}
