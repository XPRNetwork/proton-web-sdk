import { isInstanceOf, APIError } from "@proton/link"

export function isAppleHandheld() {
    return /iP(ad|od|hone)/i.test(navigator.userAgent)
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

export function isAndroidWebView() {
    return /wv/.test(navigator.userAgent) || /Android.*AppleWebKit/.test(navigator.userAgent);
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
        return 'android-intent://org.mozilla.firefox'
    }

    if (isAndroid() && isEdge()) {
        return 'android-intent://com.microsoft.emmx'
    }

    if (isAndroid() && isOpera()) {
        return 'android-intent://com.opera.browser'
    }

    if (isAndroid() && isBrave()) {
        return 'android-intent://com.brave.browser'
    }

    if (isAndroid() && isAndroidWebView()) {
        return 'android-intent://webview'
    }

    if (isAndroid() && isChromeMobile()) {
        return 'android-intent://com.android.chrome'
    }

    return window.location.href
}

export function parseErrorMessage (error: Error) {
    let errorMessage: string
    if (isInstanceOf(error, APIError)) {
        if (error.name === 'eosio_assert_message_exception') {
            errorMessage = error.details[0].message
        } else if (error.details.length > 0) {
            errorMessage = error.details.map((d) => d.message).join('\n')
        } else {
            errorMessage = error.message
        }
    } else {
        errorMessage = (error as any).message || String(error)
    }
    return errorMessage
}