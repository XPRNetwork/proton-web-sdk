import type {UIError, UIProps, UIQRData, UISignData, UIWalletType} from './ui/interfaces'

export type UIPercentageString = `${number}%`
export type UIPixelsString = `${number}px`

export type UISpace =
  | 'var(--space-xs)'
  | 'var(--space-s)'
  | 'var(--space-m)'
  | 'var(--space-l)'
  | 'var(--space-xl)'
  | 'var(--space-2xl)'

export type UIRendererEmbedTo = Element | string | (() => Element | null) | null

export interface UIEmbedToPayload {
  embedTo?: UIRendererEmbedTo
}

export interface UIRendererOptions extends UIProps, UIEmbedToPayload {
  id?: string
  elementClass?: string
}

interface UIGenericPayload extends UIEmbedToPayload {
  wallet_type: UIWalletType | string
  onClose?: () => void
  onBack?: () => void
}

export interface UISelectWalletPayload extends UIEmbedToPayload {
  enabledWallets?: UIWalletType[] | string[]
}

export interface UIRequestPayload extends UIGenericPayload {
  data: UIQRData
}

export type UILoginPayload = UIRequestPayload
export type UISignManuallyPayload = UIRequestPayload

export interface UIErrorPayload extends UIEmbedToPayload {
  wallet_type: UIWalletType | string
  data: UIError
}

export interface UILoadingPayload extends UIEmbedToPayload {
  message?: string
  no_close?: boolean
}

export interface UISignPayload extends UIGenericPayload {
  onManual?: () => void
  data: UISignData
}

export interface UIErrorRecoverPayload extends UIErrorPayload, Pick<UISignPayload, 'onManual'> {}

export interface UIRenderer {
  selectWallet(): Promise<string>
  login(_: UILoginPayload): void
  sign(_: UISignPayload): void
  signManually(_: UISignManuallyPayload): void
  showError(_: UIErrorPayload): void
  recoverError(_: UIErrorRecoverPayload): void
  show(): void
  close(): void
  destroy(): void
  showLoading(_?: UILoadingPayload): void
  embedTo(_: UIRendererEmbedTo): void
}
