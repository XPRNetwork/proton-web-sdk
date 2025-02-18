import type { footNoteDownloadLinks } from './types'

/**
 * The UserAgent for IPad has changed since IOS 13.
 * Now it looks the same as for MacOS, so there is no `IPad` keyword anymore.
 * So we need to check **maxTouchPoints** to know if it is an IPad
 * */
export function isAppleHandheld() {
    return (
        /iP(ad|od|hone)/i.test(navigator.userAgent) ||
        (navigator.userAgent.toLowerCase().indexOf('macintosh') > -1 &&
            navigator.maxTouchPoints &&
            navigator.maxTouchPoints > 2)
    )
}

export function isChromeiOS() {
    return /CriOS/.test(navigator.userAgent)
}

export function isChromeMobile() {
    return /Chrome\/[.0-9]* Mobile/i.test(navigator.userAgent)
}

export function isFirefox() {
    return /Firefox/i.test(navigator.userAgent)
}

export function isFirefoxiOS() {
    return /FxiOS/.test(navigator.userAgent)
}

export function isOpera() {
    return /OPR/.test(navigator.userAgent) || /Opera/.test(navigator.userAgent)
}

export function isEdge() {
    return /Edg/.test(navigator.userAgent)
}

export function isBrave() {
    return navigator['brave'] && typeof navigator['brave'].isBrave === 'function'
}

export function isAndroid() {
    return /Android/.test(navigator.userAgent)
}

// @ts-ignore
export const isNativeApp = () => !!window.ReactNativeWebView

export function isAndroidWebView() {
    return /wv/.test(navigator.userAgent) || (/Android/.test(navigator.userAgent) && isNativeApp())
}

export function isMobile() {
    return (
        typeof window.orientation !== 'undefined' || navigator.userAgent.indexOf('IEMobile') !== -1
    )
}

/** Generate a return url that Proton will redirect back to w/o reload. */
export function generateReturnUrl() {
    if (isChromeiOS()) {
        // google chrome on iOS will always open new tab so we just ask it to open again as a workaround
        return 'googlechrome://'
    }
    if (isFirefoxiOS()) {
        // same for firefox
        return 'firefox:://'
    }
    if (isAppleHandheld() && isBrave()) {
        // and brave ios
        return 'brave://'
    }
    if (isAppleHandheld()) {
        // return url with unique fragment required for iOS safari to trigger the return url
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
        let rv = window.location.href.split('#')[0] + '#'
        for (let i = 0; i < 8; i++) {
            rv += alphabet.charAt(Math.floor(Math.random() * alphabet.length))
        }
        return rv
    }

    if (isAndroid() && isFirefox()) {
        return 'android-app://org.mozilla.firefox'
    }

    if (isAndroid() && isEdge()) {
        return 'android-app://com.microsoft.emmx'
    }

    if (isAndroid() && isOpera()) {
        return 'android-app://com.opera.browser'
    }

    if (isAndroid() && isBrave()) {
        return 'android-app://com.brave.browser'
    }

    if (isAndroid() && isAndroidWebView()) {
        return 'android-app://webview'
    }

    if (isAndroid() && isChromeMobile()) {
        return 'android-app://com.android.chrome'
    }

    return window.location.href
}

export function parseErrorMessage(error: any) {
    let errorMessage: string

    if (error.json && error.json.error) {
        error = error.json.error
    }

    if (error.error) {
        error = error.error
    }

    if (error.details) {
        const {code, details, name, what} = error
        if (name === 'eosio_assert_message_exception') {
            errorMessage = details[0].message.replace('assertion failure with message: ', '')
        } else if (details.length > 0) {
            errorMessage = details.map((d) => d.message).join('\n')
        } else {
            errorMessage = what || String(error)
        }
    } else {
        errorMessage = error.message || String(error)
    }

    return errorMessage
}

const footnoteLinks: footNoteDownloadLinks = {
    proton: 'https://xprnetwork.org/wallet',
    anchor: 'https://greymass.com/en/anchor/',
}

export function getFootnoteLink(walletType: string): string {
    return footnoteLinks[walletType] || ''
}
