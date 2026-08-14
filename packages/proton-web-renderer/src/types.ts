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

export interface UIRendererOptions extends UIProps {
  id?: string
  renderTarget?: HTMLElement | string | null
}

interface UIGenericPayload {
  wallet_type: UIWalletType | string
  onClose?: () => void
  onBack?: () => void
  renderTarget?: HTMLElement | string | null
}

export interface UIRequestPayload extends UIGenericPayload {
  data: UIQRData
}

export type UILoginPayload = UIRequestPayload
export type UISignManuallyPayload = UIRequestPayload

export interface UIErrorPayload {
  wallet_type: UIWalletType | string
  data: UIError
  renderTarget?: HTMLElement | string | null
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
  showLoading(): void
  setRenderTarget(_: HTMLElement | string | null): void
}
