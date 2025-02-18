import { Base64u, SessionError } from '@proton/link'
import type {
    Bytes,
    LinkChannelSession,
    LinkSession,
    LinkStorage,
    LinkTransport,
    SigningRequest,
} from '@proton/link'
import DialogWidget from './views/Dialog.svelte'
import { Storage } from './storage'
import { generateReturnUrl, isMobile, parseErrorMessage } from './utils'
import { type BrowserTransportOptions, type DialogArgs, SkipToManual } from './types'

import GenerateQrCode from './qrcode'

export class BrowserTransport implements LinkTransport {
    /** Package version. */
    static version = '__ver' // replaced by build script

    public storage: LinkStorage
    private requestStatus: boolean
    private requestAccount: string
    private walletType: string
    private activeRequest?: SigningRequest
    private activeCancel?: (reason: string | Error) => void
    private countdownTimer?: NodeJS.Timeout
    private closeTimer?: NodeJS.Timeout
    private showingManual: boolean
    private Widget?: DialogWidget

    constructor(public readonly options: BrowserTransportOptions = {}) {
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
            this.activeCancel('')
            this.activeCancel = undefined
        }
    }

    private setupWidget() {
        this.showingManual = false
        if (!this.Widget) {
            const widgetHolder = document.createElement('div')
            document.body.appendChild(widgetHolder)
            this.Widget = new DialogWidget({target: widgetHolder})
            this.Widget.$on('back', () => document.dispatchEvent(new CustomEvent('backToSelector')))
            this.Widget.$on('close', () => this.closeModal())
        }
    }

    private hide() {
        if (this.Widget) {
            this.Widget.$set({
                show: false,
                title: '',
                subtitle: null,
                showFootnote: false,
                countDown: null,
                qrData: null,
                action: null,
            })
        }
        this.clearTimers()
    }

    private show() {
        if (this.Widget) {
            this.Widget.$set({show: true})
        }
    }

    private showDialog(args: DialogArgs) {
        this.setupWidget()

        const props: Record<string, any> = {
            showBackButton: !args.hideBackButton,
            walletType: this.walletType,
            title: args.title || '',
            subtitle: args.subtitle || '',
            action: args.action || null,
            showFootnote: args.showFootnote,
            countDown: (args.content && args.content.countDown) || null,
            qrData: (args.content && args.content.qrData) || null,
        }

        if (this.Widget) {
            this.Widget.$set({...props})
        }
        this.show()
    }

    private displayRequest(
        request: SigningRequest,
        title: string,
        subtitle = '',
        hideBackButton = false
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

        const qrCode = GenerateQrCode(crossDeviceUri)
        const qrData = {
            code: qrCode,
            link: sameDeviceUri,
        }

        this.showDialog({
            title,
            showFootnote: request.isIdentity(),
            subtitle,
            hideBackButton,
            content: {qrData},
        })
    }

    public async showLoading() {
        this.showDialog({
            title: 'Pending...',
            subtitle: 'Preparing request...',
            hideBackButton: true,
            type: 'loading',
        })
    }

    public onRequest(request: SigningRequest, cancel: (reason: string | Error) => void) {
        this.clearTimers()
        this.activeRequest = request
        this.activeCancel = cancel
        try {
            this.displayRequest(request, 'Scan the QR-Code')
        } catch (e) {
            cancel(e as string | Error)
        }
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

        this.activeRequest = request
        this.activeCancel = cancel

        const deviceName = session.metadata.name

        // Countdown timer
        this.clearTimers()
        const timeout = session.metadata.timeout || 60 * 1000 * 2
        const start = Date.now()
        const formatCountDown = (startTime: number) => {
            const secondsLeft = Math.floor((timeout + startTime - Date.now()) / 1000)
            const seconds = String(secondsLeft % 60).padStart(2, '0')
            const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, '0')
            return secondsLeft > 0 ? `${minutes}:${seconds}` : '00:00'
        }
        const updateCountdown = (startTime: number) =>
            this.Widget && this.Widget.$set({countDown: formatCountDown(startTime)})
        this.countdownTimer = setInterval(() => updateCountdown(start), 1000)
        updateCountdown(start)

        // Content subtitle
        this.showDialog({
            title: 'Signing Request',
            subtitle: `Please open ${deviceName || 'linked wallet'} to review the transaction`,
            content: {
                countDown: formatCountDown(start),
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

        if (session.metadata.sameDevice && isMobile()) {
            window.location.href = `${request.getScheme()}://link`
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
        this.clearCountdown()
    }

    private clearCountdown() {
        if (this.countdownTimer) {
            if (this.Widget) {
                this.Widget.$set({countDown: undefined})
            }
            clearInterval(this.countdownTimer)
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
            !(
                request === this.activeRequest &&
                (error['code'] === 'E_DELIVERY' || error['code'] === 'E_TIMEOUT') &&
                error['session']
            )
        ) {
            return false
        }

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

        this.clearCountdown()

        this.showDialog({
            title: 'Unable to reach device',
            subtitle:
                error.message ||
                `Unable to deliver the request to ${session.metadata.name || 'the linked wallet'}.`,
            type: 'warning',
            action: {
                text: 'Optional: Sign manually using QR code',
                callback: () => this.showRecovery(request, session),
            },
        })
        return true
    }

    public onSuccess(request: SigningRequest) {
        if (request === this.activeRequest) {
            this.clearTimers()
            this.hide()
        }
    }

    public onFailure(request: SigningRequest, error: Error) {
        if (request !== this.activeRequest || (error as any)['code'] === 'E_CANCEL') {
            this.hide()
            return
        }

        this.clearTimers()

        if (this.requestStatus) {
            this.showDialog({
                title: 'Transaction Error',
                subtitle: parseErrorMessage(error),
                hideBackButton: true,
                type: 'error',
            })
        } else {
            this.hide()
        }
    }

    public userAgent() {
        return `BrowserTransport/${BrowserTransport.version} ${navigator.userAgent}`
    }
}
