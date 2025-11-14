import {mount, unmount} from 'svelte'
import {DIALOG_STATE} from './state.svelte'
import {CustomStyleOptionsToVarsMap} from './styles'
import type {CustomStyleOptions, WalletItem} from './types'
import DialogWidget from './views/Dialog.svelte'

export default class WalletTypeSelector {
  private appLogo: string | undefined
  private hasRoundedLogo: boolean = false
  private appName: string
  private customStyleOptions: CustomStyleOptions | undefined
  private dialogRootNode: HTMLElement
  private dialogProps = DIALOG_STATE

  constructor(
    name?: string,
    logo?: string,
    customStyleOptions?: CustomStyleOptions,
    dialogRootNode?: HTMLElement | string
  ) {
    this.appLogo = logo
    this.appName = name || 'app'
    this.customStyleOptions = customStyleOptions
    this.dialogRootNode = this.setDialogRootNode(dialogRootNode)
  }

  /** Container and stylesheet for Wallet Selector */
  private Widget?: any
  private widgetHolder?: HTMLElement

  private fontAdded: boolean = false

  /**
   * Only Proton and Anchor are available
   */
  public displayWalletSelector(enabledWalletTypes: WalletItem[]): Promise<string> {
    return new Promise((resolve, reject) => {
      this.setUpSelectorContainer()

      if (this.Widget) {
        this.dialogProps.title = 'Connect Wallet'
        this.dialogProps.subtitle = `To start using ${this.appName}`
        this.dialogProps.hasRoundedLogo = this.hasRoundedLogo
        this.dialogProps.wallets = enabledWalletTypes
        this.dialogProps.appLogo = this.appLogo || null

        this.dialogProps.select_wallet = (walletName) => {
          if (walletName) {
            this.hideSelector()
            resolve(walletName)
          }
        }

        this.dialogProps.close = () => {
          this.hideSelector()
          reject('no wallet selected')
        }

        this.dialogProps.show = true
      }
    })
  }

  public destroy() {
    this.hideSelector()
    if (this.Widget) {
      unmount(this.Widget)
    }
    if (this.widgetHolder) {
      this.widgetHolder.remove()
    }
  }

  private hideSelector() {
    if (this.Widget) {
      this.dialogProps.show = false
      this.dialogProps.appLogo = ''
      this.dialogProps.hasRoundedLogo = false
      this.dialogProps.title = ''
      this.dialogProps.subtitle = ''
      this.dialogProps.wallets = []
    }
  }

  private setUpSelectorContainer() {
    this.addFont()

    if (!this.Widget) {
      this.widgetHolder = document.createElement('div')
      this.dialogRootNode.appendChild(this.widgetHolder)

      this.Widget = mount(DialogWidget, {props: this.dialogProps, target: this.widgetHolder})

      if (this.customStyleOptions) {
        const options = this.customStyleOptions
        Object.keys(options).forEach((key) => {
          if (key === 'isLogoRound') {
            this.hasRoundedLogo = !!options.isLogoRound
          } else {
            const cssVar = CustomStyleOptionsToVarsMap.get(key as keyof CustomStyleOptions)
            if (cssVar && options[key] && this.widgetHolder) {
              this.widgetHolder.style.setProperty(`--${cssVar}`, options[key])
            }
          }
        })
      }
    }
  }

  private addFont() {
    const fontToAdd = 'https://fonts.cdnfonts.com/css/circular-std-book'
    if (!this.fontAdded) {
      const alreadyExists = Array.from(document.styleSheets).some((item) => item.href === fontToAdd)
      if (!alreadyExists) {
        const font = document.createElement('link')
        font.href = fontToAdd
        font.rel = 'stylesheet'
        document.head.appendChild(font)
      }
      this.fontAdded = true
    }
  }

  private setDialogRootNode(rootNode?: string | HTMLElement): HTMLElement {
    if (!rootNode) return document.body
    if (typeof rootNode == 'string') {
      const node = document.body.querySelector(rootNode)
      if (!node) throw new Error('dialogRootNode is not a valid selector')
      return node as HTMLElement
    }
    return rootNode
  }
}
