import {mount, unmount} from 'svelte'
import type {
  UIErrorPayload,
  UIErrorRecoverPayload,
  UILoadingPayload,
  UILoginPayload,
  UIRenderer,
  UIRendererEmbedTo,
  UIRendererOptions,
  UIRequestPayload,
  UISelectWalletPayload,
  UISignManuallyPayload,
  UISignPayload,
} from './types'
import {createAppContext, theme, type UIAppContext} from './ui/store'
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

  private appContext: UIAppContext
  private offDOMContentLoaded: () => void = () => void 0
  private elementId: string = ''
  private app: any
  private cssRules: string[] = []
  private target: Element | null = null

  constructor(options: UIRendererOptions = defaultUIRendererOptions) {
    this.options = options
    this.appContext = createAppContext()

    if (typeof document !== 'undefined') {
      this.buildCssRules()

      if (this.options.embedTo) {
        this.embedTo(this.options.embedTo)
      }
    }
  }

  async selectWallet({
    enabledWallets: wallets,
    embedTo,
  }: UISelectWalletPayload = {}): Promise<string> {
    this.initialize()

    if (!wallets) {
      wallets = ENABLED_WALLETS
    }
    if (embedTo !== undefined) {
      this.embedTo(embedTo)
    }

    this.appContext.enabledWallets.set(new Set(wallets as UIWalletType[]))
    this.appContext.router.push(ROUTES.WEBAUTH_CONNECT)
    this.show()

    try {
      return await new Promise<string>((resolve, reject) => {
        this.appContext.walletSelect.set({
          resolve,
          reject,
        })
      })
    } finally {
      this.close()
    }
  }

  login(payload: UILoginPayload): void {
    if (payload.embedTo !== undefined) {
      this.embedTo(payload.embedTo)
    }

    let route = ROUTES.WEBAUTH_LOGIN_MOBILE
    if (payload.wallet_type === SUPPORTED_WALLETS.ANCHOR) {
      route = ROUTES.OTHER_ANCHOR_USE
    }
    this.request(route, payload)
  }

  sign(payload: UISignPayload): void {
    if (payload.embedTo !== undefined) {
      this.embedTo(payload.embedTo)
    }

    let route = ROUTES.WEBAUTH_SIGN
    if (payload.wallet_type === SUPPORTED_WALLETS.ANCHOR) {
      route = ROUTES.OTHER_ANCHOR_SIGN
    }
    this.sign_request(route, payload)
  }

  signManually(payload: UISignManuallyPayload): void {
    if (payload.embedTo !== undefined) {
      this.embedTo(payload.embedTo)
    }

    let route = ROUTES.WEBAUTH_SIGN_MANUAL
    if (payload.wallet_type === SUPPORTED_WALLETS.ANCHOR) {
      route = ROUTES.OTHER_ANCHOR_SIGN_MANUAL
    }
    this.request(route, payload)
  }

  showError(payload: UIErrorPayload): void {
    if (payload.embedTo !== undefined) {
      this.embedTo(payload.embedTo)
    }

    this.initialize()
    this.appContext.error.set(payload.data)
    this.show()
  }

  recoverError(payload: UIErrorRecoverPayload): void {
    if (payload.embedTo !== undefined) {
      this.embedTo(payload.embedTo)
    }

    this.initialize()

    let route = ROUTES.WEBAUTH_SIGN
    if (payload.wallet_type === SUPPORTED_WALLETS.ANCHOR) {
      route = ROUTES.OTHER_ANCHOR_SIGN
    }

    this.appContext.recoverError.set(payload.data)
    if (payload.onManual) {
      this.appContext.manualAction.set(payload.onManual)
    }

    this.appContext.router.push(route)
    this.show()
  }

  showLoading(payload?: UILoadingPayload): void {
    if (payload?.embedTo !== undefined) {
      this.embedTo(payload.embedTo)
    }

    this.initialize()

    this.appContext.router.push(ROUTES.PREPARING_REQUEST)
    this.appContext.loadingMessage.set(payload?.message)
    if (payload?.no_close) {
      this.appContext.noClose.set(true)
    }
    this.show()
  }

  show(): void {
    this.appContext.active.set(true)
  }

  close(): void {
    this.appContext.active.set(false)
  }

  async demo(): Promise<void> {
    this.initialize()

    const qrRequestData: UIQRData = {
      code: DEMO_IMG,
      link: 'proton-dev:example',
    }
    const signData: UISignData = {
      timeout: 60 * 1_000,
    }

    return await new Promise((resolve) => {
      this.appContext.demoMode.set({
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
        showLoading: (payload) => {
          this.showLoading(payload)
        },
      })
      this.appContext.enabledWallets.set(new Set(ENABLED_WALLETS))
      this.appContext.router.push(ROUTES.WEBAUTH_CONNECT)
      this.show()
    })
  }

  setTheme(value: UITheme): void {
    theme.set(value)
  }

  embedTo(target: UIRendererEmbedTo): void {
    if (!target) {
      this.target = null
    } else {
      if (target instanceof Element) {
        this.target = target
      } else {
        let resolveTarget: () => Element | null = () => null

        if (typeof target === 'string') {
          resolveTarget = () => document.querySelector(target)
        } else {
          resolveTarget = target
        }

        this.target = resolveTarget()
      }
    }

    if (this.target === null) {
      this.appContext.embeddedMode.set(false)
    } else {
      this.appContext.embeddedMode.set(true)
    }
  }

  unmount(): void {
    unmount(this.app)
    this.element?.remove()
    this.offDOMContentLoaded()
    this.initialized = false
    this.shadow = undefined
    this.app = undefined
  }

  destroy(): void {
    this.unmount()
  }

  private sign_request(route: UIRouteValue, payload: UISignPayload): void {
    this.initialize()

    if (payload.onBack) {
      this.appContext.backAction.set(payload.onBack)
    }

    if (payload.onClose) {
      this.appContext.closeAction.set(payload.onClose)
    }

    if (payload.onManual) {
      this.appContext.manualAction.set(payload.onManual)
    }

    this.appContext.signRequestData.set(payload.data)

    this.appContext.router.push(route)
    this.show()
  }

  private request(route: UIRouteValue, payload: UIRequestPayload): void {
    this.initialize()

    this.appContext.qrRequestData.set(payload.data)

    if (payload.onBack) {
      this.appContext.backAction.set(payload.onBack)
    }

    if (payload.onClose) {
      this.appContext.closeAction.set(payload.onClose)
    }

    this.appContext.router.push(route)
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
    if (options.elementClass) {
      this.element.classList.add(options.elementClass)
    }
    this.elementId = options.id || defaultUIRendererOptions.id
    this.element.id = this.elementId

    this.appContext.app_props.set(options)

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

  private appendDialogElement() {
    const existing = document.getElementById(this.elementId)
    if (!this.element || !this.shadow) {
      throw new Error('The WebRenderer is not initialized. Call the initialize method first.')
    }
    if (!existing) {
      const target = this.target ?? document.body
      target.append(this.element)

      this.offDOMContentLoaded()

      this.app = mount(App, {
        target: this.shadow,
        props: {
          onclose: () => {
            this.appContext.resetState()
            this.unmount()
          },
        },
        context: new Map<string, any>([['appContext', this.appContext]]),
      })

      this.appendStyles()
    }
  }

  private appendStyles() {
    if (this.shadow && this.cssRules.length > 0) {
      const sheet = new CSSStyleSheet()
      sheet.replaceSync(this.cssRules.join(' '))

      this.shadow.adoptedStyleSheets = [sheet]
    }
  }

  private buildCssRules() {
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

      this.cssRules = rules
    }
  }
}
