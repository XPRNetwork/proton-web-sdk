import {mount, unmount} from 'svelte'
import type {
  UIErrorPayload,
  UIErrorRecoverPayload,
  UILoginPayload,
  UIRenderer,
  UIRendererOptions,
  UIRequestPayload,
  UISignManuallyPayload,
  UISignPayload,
} from './types'
import {
  active,
  app_props,
  backAction,
  closeAction,
  demoMode,
  embeddedMode,
  enabledWallets,
  error,
  manualAction,
  qrRequestData,
  recoverError,
  router,
  signRequestData,
  theme,
  walletSelect,
} from './ui/store'
import {addListener, flattenObject, toCssVars} from './utils'
import App from './ui/App.svelte'
import {DEMO_IMG, ENABLED_WALLETS, ROUTES, SUPPORTED_WALLETS} from './ui/constants'
import type {
  UIQRData,
  UIRouteValue,
  UISignData,
  UITheme,
  UIThemeOptions,
  UIWalletType,
} from './ui/interfaces'

export const defaultUIRendererOptions = {
  id: 'proton-web-ui',
}

export type {UIRenderer, UIRendererOptions}

export class WebRenderer implements UIRenderer {
  public element: Element | undefined
  public shadow: ShadowRoot | undefined
  public initialized = false
  readonly options: UIRendererOptions

  private offDOMContentLoaded: () => void = () => void 0
  private elementId: string = ''
  private app: any

  constructor(options: UIRendererOptions = defaultUIRendererOptions) {
    this.options = options
    if (typeof document !== 'undefined') {
      this.initialize()
    }
  }

  async selectWallet({
    enabledWallets: wallets,
    renderTarget,
  }: {
    enabledWallets?: UIWalletType[] | string[]
    renderTarget?: HTMLElement | string | null
  } = {}): Promise<string> {
    if (!wallets) {
      wallets = ENABLED_WALLETS
    }

    if (renderTarget) {
      this.setRenderTarget(renderTarget)
    }

    enabledWallets.set(new Set(wallets as UIWalletType[]))

    router.push(ROUTES.WEBAUTH_CONNECT)
    this.show()

    try {
      return await new Promise<string>((resolve, reject) => {
        walletSelect.set({
          resolve,
          reject,
        })
      })
    } finally {
      this.close()
    }
  }

  login(payload: UILoginPayload): void {
    let route = ROUTES.WEBAUTH_LOGIN_MOBILE
    if (payload.wallet_type === SUPPORTED_WALLETS.ANCHOR) {
      route = ROUTES.OTHER_ANCHOR_USE
    }
    if (payload.renderTarget) {
      this.setRenderTarget(payload.renderTarget)
    }
    this.request(route, payload)
  }

  sign(payload: UISignPayload): void {
    let route = ROUTES.WEBAUTH_SIGN
    if (payload.wallet_type === SUPPORTED_WALLETS.ANCHOR) {
      route = ROUTES.OTHER_ANCHOR_SIGN
    }
    if (payload.renderTarget) {
      this.setRenderTarget(payload.renderTarget)
    }
    this.sign_request(route, payload)
  }

  signManually(payload: UISignManuallyPayload): void {
    let route = ROUTES.WEBAUTH_SIGN_MANUAL
    if (payload.wallet_type === SUPPORTED_WALLETS.ANCHOR) {
      route = ROUTES.OTHER_ANCHOR_SIGN_MANUAL
    }
    if (payload.renderTarget) {
      this.setRenderTarget(payload.renderTarget)
    }
    this.request(route, payload)
  }

  showError(payload: UIErrorPayload): void {
    if (payload.renderTarget) {
      this.setRenderTarget(payload.renderTarget)
    }
    error.set(payload.data)
    this.show()
  }

  recoverError(payload: UIErrorRecoverPayload): void {
    let route = ROUTES.WEBAUTH_SIGN
    if (payload.wallet_type === SUPPORTED_WALLETS.ANCHOR) {
      route = ROUTES.OTHER_ANCHOR_SIGN
    }

    if (payload.renderTarget) {
      this.setRenderTarget(payload.renderTarget)
    }

    recoverError.set(payload.data)
    if (payload.onManual) {
      manualAction.set(payload.onManual)
    }

    router.push(route)
    this.show()
  }

  showLoading(): void {
    router.push(ROUTES.PREPARING_REQUEST)
    this.show()
  }

  show(): void {
    active.set(true)
  }

  close(): void {
    active.set(false)
  }

  async demo(): Promise<void> {
    const qrRequestData: UIQRData = {
      code: DEMO_IMG,
      link: 'proton-dev:example',
    }
    const signData: UISignData = {
      timeout: 60 * 1_000,
    }

    return await new Promise((resolve) => {
      demoMode.set({
        selectWallet: (wallet_type) => {
          this.login({
            data: qrRequestData,
            wallet_type,
          })
        },
        close: () => {
          resolve()
        },
        sign: (wallet_type) => {
          this.sign({
            data: signData,
            wallet_type,
          })
        },
        signManually: (wallet_type) => {
          this.signManually({
            data: qrRequestData,
            wallet_type,
          })
        },
        timeout: (wallet_type) => {
          this.recoverError({
            data: {
              name: 'Unable to reach device',
              description: 'Unable to deliver the request to the linked wallet',
            },
            onManual: () => {
              this.signManually({
                data: qrRequestData,
                wallet_type,
              })
            },
            wallet_type,
          })
        },
      })
      enabledWallets.set(new Set(ENABLED_WALLETS))
      router.push(ROUTES.WEBAUTH_CONNECT)
      this.show()
    })
  }

  setTheme(value: UITheme): void {
    theme.set(value)
  }

  destroy(): void {
    unmount(this.app)
    this.element?.remove()
    this.offDOMContentLoaded()
  }

  private sign_request(route: UIRouteValue, payload: UISignPayload): void {
    if (payload.onBack) {
      backAction.set(payload.onBack)
    }

    if (payload.onClose) {
      closeAction.set(payload.onClose)
    }

    if (payload.onManual) {
      manualAction.set(payload.onManual)
    }

    signRequestData.set(payload.data)

    router.push(route)
    this.show()
  }

  private request(route: UIRouteValue, payload: UIRequestPayload): void {
    qrRequestData.set(payload.data)

    if (payload.onBack) {
      backAction.set(payload.onBack)
    }

    if (payload.onClose) {
      closeAction.set(payload.onClose)
    }

    router.push(route)
    this.show()
  }

  private initialize() {
    // Prevent multiple initializations
    if (this.initialized) {
      return
    }
    const {options} = this
    // Create the dialog element and its shadow root
    this.element = document.createElement('div')
    this.elementId = options.id || defaultUIRendererOptions.id
    this.element.id = this.elementId

    app_props.set(options)

    this.shadow = this.element.attachShadow({mode: 'closed'})

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      // Document is ready, append element
      this.appendDialogElement()
    } else {
      // Add listener to append to body
      this.offDOMContentLoaded = addListener(document, 'DOMContentLoaded', () => {
        this.appendDialogElement()
      })
    }
    this.initialized = true
  }

  private resolveRenderTarget(
    target: HTMLElement | string | null | undefined
  ): HTMLElement {
    if (target instanceof HTMLElement) {
      return target
    }
    if (typeof target === 'string') {
      const found = document.querySelector<HTMLElement>(target)
      if (found) {
        return found
      }
    }
    return document.body
  }

  setRenderTarget(target: HTMLElement | string | null): void {
    this.options.renderTarget = target
    if (!this.initialized || !this.element) {
      return
    }
    const parent = this.resolveRenderTarget(target)
    if (this.element.parentNode !== parent) {
      parent.append(this.element)
    }
    embeddedMode.set(parent !== document.body)
  }

  private appendDialogElement() {
    const existing = document.getElementById(this.elementId)
    if (!this.element || !this.shadow) {
      throw new Error('The WebRenderer is not initialized. Call the initialize method first.')
    }
    if (!existing) {
      const target = this.resolveRenderTarget(this.options.renderTarget)
      target.append(this.element)
      embeddedMode.set(target !== document.body)
      this.offDOMContentLoaded()

      this.app = mount(App, {
        target: this.shadow,
      })

      this.appendStyles()
    }
  }

  private appendStyles() {
    if (this.shadow) {
      const {options} = this
      if (options.themes && Object.keys(options.themes).length) {
        const themes = options.themes

        const rules: string[] = []

        Object.keys(themes).forEach((key) => {
          const data: UIThemeOptions = themes[key]

          const source = Object.keys(data).reduce((acc, chapter) => {
            let prefix = chapter
            if (chapter === 'base') {
              prefix = ''
            }

            return Object.assign(acc, flattenObject(data[chapter], prefix))
          }, {})

          rules.push(`:host dialog[data-theme='${key}'] {
              ${toCssVars(source, 'pw').join('\n')}
            }`)
        })

        if (rules.length > 0) {
          const sheet = new CSSStyleSheet()
          sheet.replaceSync(rules.join(' '))

          this.shadow.adoptedStyleSheets = [sheet]
        }
      }
    }
  }
}
