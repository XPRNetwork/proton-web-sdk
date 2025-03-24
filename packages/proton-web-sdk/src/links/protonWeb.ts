import type { LinkOptions, LinkStorage, LinkTransport, TransactArgs, TransactOptions } from "@proton/link"
import { JsonRpc } from '@proton/js'

const OPEN_SETTINGS = 'menubar=1,resizable=1,width=400,height=600'

interface Authorization {
  actor: string,
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

export class ProtonWebLink {
  deferredTransact: {
    deferral: Deferred
    transaction: any,
    params: any,
    waitingForOpen: boolean
  } | undefined
  deferredLogin: Deferred | undefined
  scheme: string
  storage: LinkStorage | null | undefined
  client: JsonRpc | undefined
  testUrl: string | undefined
  transport: LinkTransport
  chainId: string

  public get childWindow() {
    return _childWindow
  }

  public set childWindow(window: Window | null) {
    if(_childWindow !== window) {
      _childWindow = window
      if(!_childWindow && this.closeCheckInterval) {
        clearInterval(this.closeCheckInterval);
      }
      if(_childWindow) {
        this.closeCheckInterval = setInterval(() => this.checkChildWindowClosed(), 500)
      }
    }
  }

  private closeCheckInterval: NodeJS.Timer | null = null

  constructor(options: LinkOptions & { testUrl?: string }) {
    this.scheme = options.scheme
    this.client = typeof options.client === 'string' ? new JsonRpc(options.client) : options.client
    this.storage = options.storage
    this.testUrl = options.testUrl
    this.transport = options.transport
    this.chainId = options.chainId!.toString()

    window.addEventListener('message', (event) => this.onEvent(event), false)
  }

  childUrl(path: string) {
    const base = this.testUrl
      ? this.testUrl
      : this.scheme === 'proton'
        ? 'https://webauth.com'
        : 'https://testnet.webauth.com'
    return `${base}${path}`
  }

  closeChild() {
    if (this.childWindow) {
        if(this.closeCheckInterval) {
          clearInterval(this.closeCheckInterval);
        }
        if(!this.childWindow.closed) {
          this.childWindow.close()
        }
        this.childWindow = null
    }
  }

  createSession(auth: Authorization) {
    return {
      auth,
      chainId: this.chainId,
      transact: async (args: TransactArgs, options?: TransactOptions): Promise<any> => {
        if (this.deferredLogin) {
          this.closeChild()
          this.deferredLogin.reject('Trying to login')
          this.deferredLogin = undefined
        }

        this.deferredTransact = {
          deferral: new Deferred(),
          transaction: args.transaction || { actions: args.actions },
          params: options,
          waitingForOpen: true
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
        client: this.client
      }
    }
  }

  async login() {
    if (this.deferredTransact) {
      this.closeChild()
      this.deferredTransact.deferral.reject('Trying to login')
      this.deferredTransact = undefined
    }

    this.childWindow = window.open(this.childUrl('/login'), '_blank', OPEN_SETTINGS)
    this.deferredLogin = new Deferred()

    try {
      this.storage!.write('wallet-type', 'webauth')

      const auth: {
        actor: string,
        permission: string
      } = await this.deferredLogin.promise
      return {
        session: this.createSession(auth)
      }
    } catch (e) {
      console.error(e)
      throw e
    }
  }

  async restoreSession(/* requestAccount */ _: string, auth: any) {
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
      chainId
    }
  }

  async onEvent(e: MessageEvent) {
    if (
      e.origin.indexOf('https://webauth.com') !== -1 &&
      e.origin.indexOf('https://testnet.webauth.com') !== -1
    ) {
      return
    }

    let eventData
    try {
      eventData = JSON.parse(e.data)
    } catch (e) {
      return
    }

    try {
      const { type, data, error } = eventData
      if (!type) {
        return
      }

      // Ready to receive transaction
      if (type === 'isReady') {
        if (this.deferredTransact && this.deferredTransact.waitingForOpen) {
          this.deferredTransact.waitingForOpen = false

          this.childWindow!.postMessage(JSON.stringify({
            type: 'transaction',
            data: {
              transaction: this.deferredTransact.transaction,
              params: this.deferredTransact.params
            }
          }), '*')
        }
      }
      // Close child
      else if (type === 'close') {
        this.closeChild()

        if (this.deferredTransact) {
          this.deferredTransact.deferral.reject('Closed')
        } else if (this.deferredLogin) {
          this.deferredLogin.reject('Closed')
        }
      }
      // TX Success
      else if (type === 'transactionSuccess') {
        this.closeChild()

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
        this.closeChild()

        if (this.deferredLogin) {
          this.deferredLogin.resolve(data)
          this.deferredLogin = undefined
        }
      }
    } catch (e) {
      console.error(e)
    }
  }

  private checkChildWindowClosed() {
    if (this.childWindow && this.childWindow.closed) {
      
      window.postMessage(
				JSON.stringify({
					type: 'close',
				}),
				'*',
			)

    }
  }
}
