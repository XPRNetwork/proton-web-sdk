import type { LinkOptions, LinkStorage, TransactArgs, TransactOptions } from "@proton/link"

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

export class ProtonWebLink {
  childWindow: Window | null = null
  deferredTransact: {
    deferral: Deferred
    transaction: any,
    params: any,
    waitingForOpen: boolean
  } | undefined
  deferredLogin: Deferred | undefined
  scheme: string
  storage: LinkStorage | null | undefined
  testUrl: string | undefined

  constructor(options: LinkOptions & { testUrl?: string }) {
    this.scheme = options.scheme
    this.storage = options.storage
    this.testUrl = options.testUrl

    setInterval(() => this.closeChild(), 500)
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
      transact: (args: TransactArgs, options?: TransactOptions): Promise<any> => {
        if (this.deferredLogin) {
          this.closeChild(true)
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
          return this.deferredTransact.deferral.promise
        } catch (e) {
          console.error(e)
          throw e
        }
      },
      link: {
        walletType: 'webauth'
      }
    }
  }

  async login() {
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

      console.log(type, data, error)

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
