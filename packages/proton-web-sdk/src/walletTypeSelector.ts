import { CustomStyleOptionsToVarsMap } from './styles'
import type { CustomStyleOptions, WalletItem } from './types'
import DialogWidget from './views/Dialog.svelte'

export default class WalletTypeSelector {
  private appLogo: string | undefined
  private hasRoundedLogo: boolean = false
  private appName: string
  private customStyleOptions: CustomStyleOptions | undefined
  private dialogRootNode: HTMLElement;

  constructor(name?: string, logo?: string, customStyleOptions?: CustomStyleOptions, dialogRootNode?: HTMLElement | string) {
    this.appLogo = logo
    this.appName = name || 'app'
    this.customStyleOptions = customStyleOptions;
    this.dialogRootNode = this.setDialogRootNode(dialogRootNode);
  }

  /** Container and stylesheet for Wallet Selector */
  private Widget?: DialogWidget
  private widgetHolder?: HTMLElement

  private fontAdded: boolean = false;

  /**
   * Only Proton and Anchor are available
   */
  public displayWalletSelector(enabledWalletTypes: WalletItem[]): Promise<string> {
    return new Promise((resolve, reject) => {
      this.setUpSelectorContainer()

      const props: Record<string, any> = {
        title: 'Connect Wallet',
        subtitle: `To start using ${this.appName}`,
        hasRoundedLogo: this.hasRoundedLogo,
        wallets: enabledWalletTypes,
        appLogo: this.appLogo || null,
      }

      if (this.Widget) {
        const hide = () => {
          this.hideSelector()
          offSelect();
          offClose();
        }
        
        const offSelect = this.Widget.$on('select-wallet', (event) => {
          if (event.detail.walletName) {
            hide()
            resolve(event.detail.walletName)
          }
        })
        
        const offClose = this.Widget.$on('close', () => {
          hide()
          reject('no wallet selected')
        })

        this.Widget.$set(props)
      }

      this.showSelector()
    })
  }

  public destroy() {
    this.hideSelector()
    if (this.Widget) {
      this.Widget.$destroy()
    }
    if (this.widgetHolder) {
      this.widgetHolder.remove()
    }
  }

  private hideSelector() {
    if (this.Widget) {
      this.Widget.$set({
        show: false,
        appLogo: '',
        hasRoundedLogo: false,
        title: '',
        subtitle: '',
        wallets: []
      })
    }
  }

  private showSelector() {
    if (this.Widget) {
      this.Widget.$set({ show: true })
    }
  }


  private setUpSelectorContainer() {
    this.addFont()

    if (!this.Widget) {
      this.widgetHolder = document.createElement('div')
      this.dialogRootNode.appendChild(this.widgetHolder);
      this.Widget = new DialogWidget({
        target: this.widgetHolder
      })

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
    const fontToAdd = 'https://fonts.cdnfonts.com/css/circular-std-book';
    if (!this.fontAdded) {
      const alreadyExists = Array.from(document.styleSheets).some((item) => item.href === fontToAdd)
      if (!alreadyExists) {
        const font = document.createElement('link')
        font.href = fontToAdd
        font.rel = 'stylesheet'
        document.head.appendChild(font);
      }
      this.fontAdded = true;
    }
  }

  private setDialogRootNode(rootNode?: string | HTMLElement): HTMLElement {
    
    if (!rootNode) return document.body
    if (typeof rootNode == 'string') { 
      const node = document.body.querySelector(rootNode);
      if (!node) throw new Error('dialogRootNode is not a valid selector');
      return node as HTMLElement;
    }
    return rootNode;
   }

}
