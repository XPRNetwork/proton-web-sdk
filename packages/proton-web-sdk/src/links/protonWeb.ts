import type {
  LinkOptions,
  LinkStorage,
  LinkTransport,
  TransactArgs,
  TransactOptions,
} from '@proton/link'
import {JsonRpc, type JsonRpcApi, JsonRpcPulseVM} from '@proton/js'

const OPEN_SETTINGS = 'menubar=1,resizable=1,width=400,height=600'

interface Authorization {
  actor: string
  permission: string
}
class Deferred {
  promise: Promise<any>
  reject: any
  resolve: any

  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this.reject = reject
      this.resolve = resolve
    })
  }
}

// Need to keep outside class since it messes with reactivity like Vuex
let _childWindow: Window | null = null
// The last popup opened. closeChild() clears _childWindow as soon as the popup closes, which can be just before its
// final message is handled; replies are matched against this instead.
let _lastChildWindow: Window | null = null

export class ProtonWebLink {
  deferredTransact:
    | {
        deferral: Deferred
        transaction: any
        params: any
        waitingForOpen: boolean
      }
    | undefined
  deferredLogin: Deferred | undefined
  scheme: string
  storage: LinkStorage | null | undefined
  client: JsonRpcApi | undefined
  testUrl: string | undefined
  transport: LinkTransport
  chainId: string
  // The dApp's own account (transportOptions.requestAccount). The ESR flow carries it as `req_account`, which is how
  // the mobile wallet names the requester; the web wallet gets nothing but document.referrer, which browsers may
  // strip, and then shows "Unknown Requestor". Passing it lets webauth.com name the requester the same way.
  requestAccount = ''

  public get childWindow() {
    return _childWindow
  }

  public set childWindow(window: Window | null) {
    _childWindow = window
    if (window) _lastChildWindow = window
  }

  constructor(options: LinkOptions & {testUrl?: string}) {
    const rpcClass = options.usePulseVM ? JsonRpcPulseVM : JsonRpc
    this.scheme = options.scheme
    this.client = typeof options.client === 'string' ? new rpcClass(options.client) : options.client
    this.storage = options.storage
    this.testUrl = options.testUrl
    this.transport = options.transport
    this.chainId = options.chainId!.toString()

    setInterval(() => this.closeChild(), 500)
    window.addEventListener('message', (event) => this.onEvent(event), false)
  }

  childUrl(path: string) {
    const base = this.testUrl
      ? this.testUrl
      : this.scheme === 'proton'
        ? 'https://webauth.com'
        : 'https://testnet.webauth.com'
    const query = this.requestAccount
      ? `?requestAccount=${encodeURIComponent(this.requestAccount)}`
      : ''
    return `${base}${path}${query}`
  }

  closeChild(force = false) {
    if (this.childWindow) {
      if (force) {
        this.childWindow.close()
      }

      if (force || this.childWindow.closed) {
        this.childWindow = null
      }
    }
  }

  createSession(auth: Authorization) {
    return {
      auth,
      chainId: this.chainId,
      transact: async (args: TransactArgs, options?: TransactOptions): Promise<any> => {
        if (this.deferredLogin) {
          this.closeChild(true)
          this.deferredLogin.reject('Trying to login')
          this.deferredLogin = undefined
        }

        this.deferredTransact = {
          deferral: new Deferred(),
          transaction: args.transaction || {actions: args.actions},
          params: options,
          waitingForOpen: true,
        }

        this.childWindow = window.open(this.childUrl('/auth'), '_blank', OPEN_SETTINGS)

        try {
          const res = await this.deferredTransact.deferral.promise
          return res
        } catch (error) {
          if (this.transport.onFailure) {
            this.transport.onFailure(undefined as any, error as any)
          }
          throw error
        }
      },
      link: {
        walletType: 'webauth',
        client: this.client,
      },
    }
  }

  async login(requestAccount = '') {
    this.requestAccount = requestAccount
    if (this.deferredTransact) {
      this.closeChild(true)
      this.deferredTransact.deferral.reject('Trying to login')
      this.deferredTransact = undefined
    }

    this.childWindow = window.open(this.childUrl('/login'), '_blank', OPEN_SETTINGS)
    this.deferredLogin = new Deferred()

    try {
      this.storage!.write('wallet-type', 'webauth')

      const auth: {
        actor: string
        permission: string
      } = await this.deferredLogin.promise
      return {
        session: this.createSession(auth),
      }
    } catch (e) {
      console.error(e)
      throw e
    }
  }

  async restoreSession(requestAccount: string, auth: any) {
    this.requestAccount = requestAccount || ''
    return this.createSession(auth)
  }

  async removeSession(appIdentifier: string, auth: any, chainId: any) {
    if (!this.storage) {
      throw new Error('Unable to remove session: No storage adapter configured')
    }

    if (await this.storage.read('wallet-type')) {
      this.storage.remove('wallet-type')
    }

    if (await this.storage.read('user-auth')) {
      this.storage.remove('user-auth')
    }

    return {
      appIdentifier,
      auth,
      chainId,
    }
  }

  async onEvent(e: MessageEvent) {
    // Only our own popup, on the exact wallet origin. `indexOf` also accepted e.g. https://webauth.com.example.org,
    // and any window could post, so another page could deliver a forged "loginSuccess" / "transactionSuccess".
    const expectedOrigin = new URL(this.childUrl('/')).origin
    if (e.origin !== expectedOrigin || !_lastChildWindow || e.source !== _lastChildWindow) {
      return
    }

    let eventData
    try {
      eventData = JSON.parse(e.data)
    } catch (e) {
      return
    }

    try {
      const {type, data, error} = eventData
      if (!type) {
        return
      }

      // Ready to receive transaction
      if (type === 'isReady') {
        if (this.deferredTransact && this.deferredTransact.waitingForOpen) {
          this.deferredTransact.waitingForOpen = false

          this.childWindow!.postMessage(
            JSON.stringify({
              type: 'transaction',
              data: {
                transaction: this.deferredTransact.transaction,
                params: this.deferredTransact.params,
                requestAccount: this.requestAccount || undefined,
              },
            }),
            '*'
          )
        }
      }
      // Close child
      else if (type === 'close') {
        this.closeChild(true)

        if (this.deferredTransact) {
          this.deferredTransact.deferral.reject('Closed')
        } else if (this.deferredLogin) {
          this.deferredLogin.reject('Closed')
        }
      }
      // TX Success
      else if (type === 'transactionSuccess') {
        this.closeChild(true)

        if (this.deferredTransact) {
          if (error) {
            this.deferredTransact.deferral.reject(error && error.json ? error.json : error)
          } else {
            this.deferredTransact.deferral.resolve(data)
          }

          this.deferredTransact = undefined
        }
      }
      // Login success
      else if (type === 'loginSuccess') {
        this.closeChild(true)

        if (this.deferredLogin) {
          this.deferredLogin.resolve(data)
          this.deferredLogin = undefined
        }
      }
    } catch (e) {
      console.error(e)
    }
  }
}
