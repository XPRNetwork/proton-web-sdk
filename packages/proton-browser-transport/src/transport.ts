import { APIError, Base64u, isInstanceOf, SessionError, SigningRequest } from '@proton/link'
import type { LinkTransport, LinkStorage, LinkChannelSession, LinkSession, Bytes } from '@proton/link'
import QRCode from 'qrcode'
import DialogWidget from './views/Dialog.svelte'
import { Storage } from './storage'
import { isMobile, generateReturnUrl } from './utils'
import { type footNoteDownloadLinks, type BrowserTransportOptions, type DialogArgs, SkipToManual } from './types'

const footnoteLinks: footNoteDownloadLinks = {
    proton: 'https://protonchain.com/wallet',
    anchor: 'https://greymass.com/en/anchor/',
}

export class BrowserTransport implements LinkTransport {
    /** Package version. */
    static version = '__ver' // replaced by build script

    public storage: LinkStorage
    private classPrefix: string
    private requestStatus: boolean
    private requestAccount: string
    private walletType: string
    private activeRequest?: SigningRequest
    private activeCancel?: (reason: string | Error) => void
    private countdownTimer?: NodeJS.Timeout
    private closeTimer?: NodeJS.Timeout
    private showingManual: boolean
    private Widget?: DialogWidget
    private fontAdded: boolean = false;

    constructor(public readonly options: BrowserTransportOptions = {}) {
        this.classPrefix = options.classPrefix || 'proton-link'
        this.requestStatus = !(options.requestStatus === false)
        this.requestAccount = options.requestAccount || ''
        this.walletType = options.walletType || 'proton'
        this.storage = new Storage(options.storagePrefix || 'proton-link')
        this.showingManual = false
    }

    private closeModal() {
        this.hide()
        if (this.activeCancel) {
            this.activeRequest = undefined
            this.activeCancel('Modal closed')
            this.activeCancel = undefined
        }
    }

    private setupWidget() {
        this.showingManual = false

        if (!this.fontAdded) {
            const font = document.createElement('link')
            font.href = 'https://fonts.cdnfonts.com/css/circular-std-book'
            font.rel = 'stylesheet'
            document.head.appendChild(font);
            this.fontAdded = true;
        }

        if (!this.Widget) {
            const widgetHolder = document.createElement('div')
            document.body.appendChild(widgetHolder);
            this.Widget = new DialogWidget({
                target: widgetHolder
            })
            this.Widget.$on('back', () => document.dispatchEvent(new CustomEvent('backToSelector')))
            this.Widget.$on('close', () => this.closeModal())
        }
    }

    private createEl(attrs?: { [key: string]: any }): HTMLElement {
        if (!attrs) attrs = {}
        const el = document.createElement(attrs.tag || 'div')
        for (const attr of Object.keys(attrs)) {
            const value = attrs[attr]
            switch (attr) {
                case 'src':
                    el.setAttribute(attr, value)
                    break
                case 'tag':
                    break
                case 'content':
                    if (typeof value === 'string') {
                        el.appendChild(document.createTextNode(value))
                    } else {
                        el.appendChild(value)
                    }
                    break
                case 'text':
                    el.appendChild(document.createTextNode(value))
                    break
                case 'class':
                    el.className = `${this.classPrefix}-${value}`
                    break
                default:
                    el.setAttribute(attr, value)
            }
        }
        return el
    }

    private hide() {
        this.Widget?.$set({
            show: false,
            title: '',
            subtitle: null,
            footnote: null,
            countDown: null,
            qrData: null,
            action: null,
        })
        this.clearTimers()
    }

    private show() {
        this.Widget?.$set({ show: true })
    }

    private showDialog(args: DialogArgs) {
        this.setupWidget()

        const props: Record<string, any> = {
            showBackButton: !args.hideBackButton,
            walletType: this.walletType,
            title: args.title || '',
            subtitle: args.subtitle || '',
            action: args.action || null,
            footnote: args.footnote
                ? (args.footnote instanceof HTMLElement)
                    ? args.footnote.outerHTML
                    : args.footnote
                : null
        };

        this.Widget?.$set({ ...props, ...(args.content || {}) })
        this.show()
    }

    private async displayRequest(
        request: SigningRequest,
        title: string,
        subtitle: string = '',
        hideBackButton: boolean = false
    ) {
        const sameDeviceRequest = request.clone()
        const returnUrl = generateReturnUrl()
        sameDeviceRequest.setInfoKey('same_device', true)
        sameDeviceRequest.setInfoKey('return_path', returnUrl)

        if (this.requestAccount.length > 0) {
            request.setInfoKey('req_account', this.requestAccount)
            sameDeviceRequest.setInfoKey('req_account', this.requestAccount)
        }

        const sameDeviceUri = sameDeviceRequest.encode(true, false)
        const crossDeviceUri = request.encode(true, false)

        const qrCode = await QRCode.toDataURL(crossDeviceUri)

        const qrData = {
            code: qrCode,
            link: sameDeviceUri
        }

        let footnote: HTMLElement = this.createEl({ class: 'footnote' })
        const isIdentity = request.isIdentity()
        if (isIdentity) {
            footnote = this.createEl({
                class: 'footnote',
                text: `Don't have a wallet? `,
            })
            const footnoteLink = this.createEl({
                tag: 'a',
                target: '_blank',
                href: footnoteLinks[this.walletType],
                text: 'Download it here',
            })
            footnote.appendChild(footnoteLink)
        }

        this.showDialog({
            title,
            footnote: footnote.innerHTML,
            subtitle,
            hideBackButton,
            content: { qrData },
        })
    }

    public async showLoading() {
        this.showDialog({
            title: 'Pending...',
            subtitle: 'Preparing request...',
            type: 'loading',
        })
    }

    public onRequest(request: SigningRequest, cancel: (reason: string | Error) => void) {
        this.clearTimers()
        this.activeRequest = request
        this.activeCancel = cancel
        this.displayRequest(request, 'Scan the QR-Code').catch(cancel)
    }

    public onSessionRequest(
        session: LinkSession,
        request: SigningRequest,
        cancel: (reason: string | Error) => void
    ) {
        if (session.metadata.sameDevice) {
            request.setInfoKey('return_path', generateReturnUrl())
        }

        if (session.type === 'fallback') {
            this.onRequest(request, cancel)
            if (session.metadata.sameDevice) {
                // trigger directly on a fallback same-device session
                window.location.href = request.encode()
            }
            return
        }

        this.clearTimers()
        this.activeRequest = request
        this.activeCancel = cancel

        const timeout = session.metadata.timeout || 60 * 1000 * 2
        const deviceName = session.metadata.name

        // Content timer
        const start = Date.now()

        const formatCountDown = (startTime: number) => {
            const secondsLeft = Math.floor((timeout + startTime - Date.now()) / 1000)
            const seconds = String(secondsLeft % 60).padStart(2, '0')
            const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, '0')
            return secondsLeft > 0 ? `${minutes}:${seconds}` : '00:00'
        }

        const updateCountdown = (startTime: number) => {
            this.Widget?.$set({ countDown: formatCountDown(startTime) })
        }

        this.countdownTimer = setInterval(() => {
            updateCountdown(start)
        }, 500)
        updateCountdown(start)

        // Content subtitle
        let subtitle: string
        if (deviceName && deviceName.length > 0) {
            subtitle = `Please open ${deviceName} to review the transaction`
        } else {
            subtitle = 'Please review and sign the transaction in the linked wallet.'
        }

        this.showDialog({
            title: 'Signing Request',
            subtitle,
            content: {
                countDown: formatCountDown(start)
            },
            hideBackButton: true,
            action: {
                text: 'Optional: Sign manually using QR code',
                callback: () => {
                    this.clearTimers()
                    const error = new SessionError('Manual', 'E_TIMEOUT', session)
                    error[SkipToManual] = true
                    cancel(error)
                },
            },
        })

        if (session.metadata.sameDevice) {
            if (isMobile()) {
                const scheme = request.getScheme()
                window.location.href = `${scheme}://link`
            }
        }
    }

    public sendSessionPayload(payload: Bytes, session: LinkSession): boolean {
        if (!session.metadata.triggerUrl || !session.metadata.sameDevice) {
            // not same device or no trigger url supported
            return false
        }
        if (payload.array.length > 700) {
            // url could be clipped by iOS
            return false
        }
        window.location.href = session.metadata.triggerUrl.replace(
            '%s',
            Base64u.encode(payload.array)
        )
        return true
    }

    private clearTimers() {
        if (this.closeTimer) {
            clearTimeout(this.closeTimer)
            this.closeTimer = undefined
        }
        if (this.countdownTimer) {
            this.Widget?.$set({ countDown: undefined })
            clearTimeout(this.countdownTimer)
            this.countdownTimer = undefined
        }
    }

    private showRecovery(request: SigningRequest, session: LinkSession) {
        request.data.info = request.data.info.filter((pair) => pair.key !== 'return_path')
        if (session.type === 'channel') {
            const channelSession = session as Partial<LinkChannelSession>
            if (channelSession.addLinkInfo) {
                channelSession.addLinkInfo(request)
            }
        }
        this.displayRequest(request, 'Sign manually', '', true)
        this.showingManual = true
    }

    public async prepare(request: SigningRequest, session?: LinkSession) {
        return request
    }

    public recoverError(error: Error, request: SigningRequest) {
        if (
            request === this.activeRequest &&
            (error['code'] === 'E_DELIVERY' || error['code'] === 'E_TIMEOUT') &&
            error['session']
        ) {
            // recover from session errors by displaying a manual sign dialog
            if (this.showingManual) {
                // already showing recovery sign
                return true
            }
            const session: LinkSession = error['session']
            if (error[SkipToManual]) {
                this.showRecovery(request, session)
                return true
            }
            const deviceName = session.metadata.name
            let subtitle: string
            if (deviceName && deviceName.length > 0) {
                subtitle = `Unable to deliver the request to ${deviceName}.`
            } else {
                subtitle = 'Unable to deliver the request to the linked wallet.'
            }
            subtitle += ` ${error.message}.`
            this.showDialog({
                title: 'Unable to reach device',
                subtitle,
                type: 'warning',
                action: {
                    text: 'Optional: Sign manually using QR code',
                    callback: () => {
                        this.showRecovery(request, session)
                    },
                },
            })
            return true
        }
        return false
    }

    public onSuccess(request: SigningRequest) {
        if (request === this.activeRequest) {
            this.clearTimers()
            if (this.requestStatus) {
                this.showDialog({
                    title: 'Success!',
                    subtitle: request.isIdentity() ? 'Login completed.' : 'Transaction signed.',
                    type: 'success',
                })
                this.closeTimer = setTimeout(() => {
                    this.hide()
                }, 1.5 * 1000)
            } else {
                this.hide()
            }
        }
    }

    public onFailure(request: SigningRequest, error: Error) {
        if (request === this.activeRequest && (error as any)['code'] !== 'E_CANCEL') {
            this.clearTimers()
            if (this.requestStatus) {
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
                this.showDialog({
                    title: 'Transaction Error',
                    subtitle: errorMessage,
                    type: 'error',
                })
            } else {
                this.hide()
            }
        } else {
            this.hide()
        }
    }

    public userAgent() {
        return `BrowserTransport/${BrowserTransport.version} ${navigator.userAgent}`
    }
}