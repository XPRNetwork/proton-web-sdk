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
