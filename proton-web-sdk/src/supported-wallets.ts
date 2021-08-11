import getStyleText from './styles'
import { CustomStyleOptions } from './connect'

export default class SupportedWallets {
    constructor(public readonly name?: string, logo?: string, customStyleOptions?: CustomStyleOptions) {
        this.appLogo = logo
        this.appName = name || 'app'
        this.customStyleOptions = customStyleOptions;
    }

    private appLogo: string | undefined
    private appName: string
    private customStyleOptions: CustomStyleOptions | undefined

    /** Container and stylesheet for Wallet Selector */
    private selectorContainerEl!: HTMLElement
    private selectorEl!: HTMLElement
    private styleEl?: HTMLStyleElement
    private font?: HTMLLinkElement

    private hideSelector() {
        if (this.selectorContainerEl) {
            this.selectorContainerEl.classList.remove(`wallet-selector-active`)
        }
    }

    private showSelector() {
        if (this.selectorContainerEl) {
            this.selectorContainerEl.classList.add(`wallet-selector-active`)
        }
    }

    private setUpSelectorContainer(reject: any) {
        this.font = document.createElement('link')
        this.font.href = 'https://fonts.cdnfonts.com/css/circular-std-book'
        this.font.rel = 'stylesheet';
        this.styleEl = document.createElement('style')
        this.styleEl.type = 'text/css'

        const styleText = getStyleText(this.customStyleOptions)
        this.styleEl.appendChild(document.createTextNode(styleText))
        this.styleEl.appendChild(this.font)
        document.head.appendChild(this.styleEl)

        if (!this.selectorContainerEl) {
            this.clearDuplicateContainers()
            this.selectorContainerEl = this.createEl()
            this.selectorContainerEl.className = 'wallet-selector'
            this.selectorContainerEl.onclick = (event) => {
                if (event.target === this.selectorContainerEl) {
                    event.stopPropagation()
                    this.hideSelector()
                    reject('no wallet selected')
                }
            }
            document.body.appendChild(this.selectorContainerEl)
        }

        if (!this.selectorEl) {
            let wrapper = this.createEl({class: 'inner'})
            let closeButton = this.createEl({class: 'close'})
            closeButton.onclick = (event) => {
                event.stopPropagation()
                this.hideSelector()
                reject('no wallet selected')
            }
            this.selectorEl = this.createEl({class: 'connect'})
            wrapper.appendChild(this.selectorEl)
            wrapper.appendChild(closeButton)
            this.selectorContainerEl.appendChild(wrapper)
        }
    }

    private clearDuplicateContainers() {
        const elements = document.getElementsByClassName('wallet-selector')
        while(elements.length > 0) {
            elements[0].remove()
        }
    }

    private createEl(attrs?: {[key: string]: string}) {
        if (!attrs) attrs = {}
        const el = document.createElement(attrs.tag || 'div')
        if (attrs) {
            for (const attr of Object.keys(attrs)) {
                const value = attrs[attr]
                switch (attr) {
                    case 'src':
                        el.setAttribute(attr, value)
                        break
                    case 'tag':
                        break
                    case 'text':
                        el.appendChild(document.createTextNode(value))
                        break
                    case 'class':
                        el.className = `wallet-selector-${value}`
                        break
                    default:
                        el.setAttribute(attr, value)
                }
            }
        }
        return el
    }

    /**
     * Only Proton and Anchor are available
     */
    public displayWalletSelector(enabledWalletTypes: { key: string, value: string }[]): Promise<string> {
        return new Promise((resolve, reject) => {
            this.setUpSelectorContainer(reject)
            const header = this.createEl({class: 'connect-header'})
            const body = this.createEl({class: 'connect-body'})
            if (this.appLogo) {
                const logoEl = this.createEl({
                    class: 'logo',
                    tag: 'img',
                    src: this.appLogo,
                    alt: 'app-logo',
                })
                header.appendChild(logoEl)
            }
            const title = 'Connect Wallet'
            const subtitle = `To start using ${this.appName}`
            const titleEl = this.createEl({class: 'title', tag: 'span', text: title})
            const subtitleEl = this.createEl({class: 'subtitle', tag: 'span', text: subtitle})

            const walletList = this.createEl({class: 'wallet-list', tag: 'ul'})            

            const eventGenerator = (walletName: string) => (event: MouseEvent) => {
                event.stopPropagation()
                this.hideSelector()
                resolve(walletName)
            }

            for (const { key, value } of enabledWalletTypes) {
                const wallet = this.createEl({class: `${key}-wallet`, tag: 'li'})
                wallet.onclick = eventGenerator(key)
                const logo = this.createEl({class: `${key}-logo`})
                const name = this.createEl({class: 'wallet-name', tag: 'span', text: value})
                const rightArrow = this.createEl({class: 'right-arrow'})
                wallet.appendChild(logo)
                wallet.appendChild(name)
                wallet.appendChild(rightArrow)
                walletList.appendChild(wallet)
            }

            const tosLinkEl = this.createEl({
                class: 'tos-link',
                tag: 'a',
                text: `Terms of Service`,
                href: 'https://protonchain.com/terms',
                target: '_blank',
            })
            const tosAgreementEl = this.createEl({
                class: 'tos-agreement',
                tag: 'p',
                text: `By connecting, I accept Proton's `,
            })
            tosAgreementEl.appendChild(tosLinkEl)

            header.appendChild(titleEl)
            header.appendChild(subtitleEl)
            body.appendChild(walletList)
            body.appendChild(tosAgreementEl)

            const footnoteEl = this.createEl({class: 'footnote', text: `Don't have Proton Wallet? `})
            const footnoteLink = this.createEl({
                tag: 'a',
                target: '_blank',
                href: 'https://protonchain.com/wallet',
                text: 'Download it here',
            })
            footnoteEl.appendChild(footnoteLink)
            
            emptyElement(this.selectorEl)

            this.selectorEl.appendChild(header)
            this.selectorEl.appendChild(body)
            this.selectorContainerEl.appendChild(footnoteEl)
            this.showSelector()
        })
    }
}

function emptyElement(el: HTMLElement) {
    while (el.firstChild) {
        el.removeChild(el.firstChild)
    }
}
