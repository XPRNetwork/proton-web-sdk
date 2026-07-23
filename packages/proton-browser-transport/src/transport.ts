import {Base64u, SessionError, WalletTypeError} from '@proton/link'
import type {
  Bytes,
  LinkChannelSession,
  LinkSession,
  LinkStorage,
  LinkTransport,
  SigningRequest,
} from '@proton/link'
import {Storage} from './storage'
import {generateReturnUrl, isMobile, parseErrorMessage} from './utils'
import {type BrowserTransportOptions, SkipToManual} from './types'
import GenerateQrCode from './qrcode'
import {WebRenderer} from '@proton/web-renderer'
import type {UIRenderer} from '@proton/web-renderer'

export class BrowserTransport implements LinkTransport {
  /** Package version. */
  static version = '__ver' // replaced by build script

  public storage: LinkStorage
  private requestStatus: boolean
  private requestAccount: string
  private walletType: string
  private returnUrl?: string | (() => string)
  private activeRequest?: SigningRequest
  // eslint-disable-next-line no-unused-vars
  private activeCancel?: (reason: string | Error) => void
  private showingManual: boolean
  private ui?: UIRenderer

  constructor(options: BrowserTransportOptions = {}) {
    this.requestStatus = !(options.requestStatus === false)
    this.requestAccount = options.requestAccount || ''
    this.walletType = options.walletType || 'proton'
    this.storage = new Storage(options.storagePrefix || 'proton-link')
    this.returnUrl = options.returnUrl
    this.showingManual = false

    if (options.ui) {
      this.ui = options.ui
    } else {
      this.ui = new WebRenderer()
    }
  }

  public async showLoading() {
    this.ui?.showLoading()
  }

  private getReturnUrl(): string {
    if (typeof this.returnUrl === 'function') {
      return this.returnUrl()
    }
    return this.returnUrl || generateReturnUrl()
  }

  public onSessionRequest(
    session: LinkSession,
    request: SigningRequest,
    cancel: (_reason: string | Error) => void
  ) {
    if (session.metadata.sameDevice) {
      request.setInfoKey('return_path', this.getReturnUrl())
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

    const timeout = session.metadata.timeout || 60 * 1000 * 2

    this.ui?.sign({
      wallet_type: this.walletType,
      ...this.getCommonCallbacks({
        noBack: true,
      }),
      data: {
        timeout,
        deviceName,
      },
      onManual: () => {
        const error = new SessionError('Manual', 'E_TIMEOUT', session)
        error[SkipToManual] = true
        cancel(error)
      },
    })

    if (session.metadata.sameDevice && isMobile()) {
      window.location.href = `${request.getScheme()}://link`
    }
  }

  public onRequest(request: SigningRequest, cancel: (_reason: string | Error) => void) {
    this.activeRequest = request
    this.activeCancel = cancel
    try {
      this.displayRequest(request)
    } catch (e) {
      cancel(e as string | Error)
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
    window.location.href = session.metadata.triggerUrl.replace('%s', Base64u.encode(payload.array))
    return true
  }

  public async prepare(request: SigningRequest, _?: LinkSession) {
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

    // this.clearCountdown()

    this.ui?.recoverError({
      wallet_type: this.walletType,
      data: {
        name: 'Unable to reach device',
        description:
          error.message ||
          `Unable to deliver the request to ${session.metadata.name || 'the linked wallet'}.`,
      },
      onManual: () => {
        this.showRecovery(request, session)
      },
    })
    return true
  }

  public onSuccess(request: SigningRequest) {
    if (request === this.activeRequest) {
      this.hide()
    }
  }

  public onFailure(request: SigningRequest, error: Error) {
    if (request !== this.activeRequest || (error as any)['code'] === 'E_CANCEL') {
      this.hide()
      return
    }

    if (this.requestStatus) {
      this.ui?.showError({
        wallet_type: this.walletType,
        data: {
          name: 'Transaction Error',
          description: parseErrorMessage(error),
        },
      })
    } else {
      this.hide()
    }
  }

  public userAgent() {
    return `BrowserTransport/${BrowserTransport.version} ${navigator.userAgent}`
  }

  private closeModal(error?: string | Error) {
    if (this.activeCancel) {
      this.activeRequest = undefined
      this.activeCancel(error ?? '')
      this.activeCancel = undefined
    }

    this.hide()
  }

  private getCommonCallbacks({noBack}: {noBack?: boolean} = {}) {
    return {
      onClose: () => {
        this.closeModal()
      },
      onBack: !noBack
        ? () => {
            this.closeModal(new WalletTypeError('Back to selector'))
          }
        : undefined,
    }
  }

  private hide() {
    if (this.ui) {
      this.ui.close()
    }
    this.showingManual = false
  }

  private displayRequest(
    request: SigningRequest,
    {
      hideBackButton,
      isSignRequest,
    }: {
      hideBackButton?: boolean
      isSignRequest?: boolean
    } = {
      hideBackButton: false,
    }
  ) {
    const sameDeviceRequest = request.clone()
    const returnUrl = this.getReturnUrl()
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

    const data = {
      data: qrData,
      wallet_type: this.walletType,
      ...this.getCommonCallbacks({noBack: hideBackButton}),
    }

    if (isSignRequest) {
      this.ui?.signManually(data)
    } else {
      this.ui?.login(data)
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
    this.displayRequest(request, {
      hideBackButton: true,
      isSignRequest: true,
    })
    this.showingManual = true
  }
}
