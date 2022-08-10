export const SkipToManual = Symbol()

export interface BrowserTransportOptions {
    /** CSS class prefix, defaults to `proton-link` */
    classPrefix?: string
    /** Whether to display request success and error messages, defaults to true */
    requestStatus?: boolean
    /** Requesting account of the dapp (optional) */
    requestAccount?: string
    /** Wallet name e.g. proton, anchor, etc */
    walletType?: string
    /** Local storage prefix, defaults to `proton-link`. */
    storagePrefix?: string
}

export interface footNoteDownloadLinks {
    [key: string]: string
}

export interface DialogArgs {
    title: string | HTMLElement
    manual?: HTMLElement
    subtitle?: string | HTMLElement
    type?: string
    content?: Record<string, any>
    action?: { text: string; callback: () => void }
    showFootnote?: boolean,
    hideLogo?: boolean,
    hideBackButton?: boolean
}
