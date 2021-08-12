import { LinkOptions, LinkStorage } from "@bloks/link"

class Deferred {
  promise: Promise<any>
  reject: any
  resolve: any

  constructor () {
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

  constructor (options: LinkOptions) {
    this.scheme = options.scheme
    this.storage = options.storage
    setInterval(() => this.closeChild(), 500)
    window.addEventListener('message', (event) => this.onEvent(event), false)
  }

  childUrl (path: string) {
    const base = this.scheme === 'proton'
      ? 'https://cryptowebauth.com'
      : 'https://testnet.cryptowebauth.com'
    return `${base}${path}`
  }

  closeChild (force = false) {
    if (this.childWindow) {
      if (force) {
        this.childWindow.close()
      }

      if (force || this.childWindow.closed) {
        this.childWindow = null
      }
    }
  }

  async transact ({ transaction, ...params }: any) {
    if (this.deferredLogin) {
      this.closeChild(true)
      this.deferredLogin.reject('Trying to login')
      this.deferredLogin = undefined
    }

    this.deferredTransact = {
      deferral: new Deferred(),
      transaction: transaction,
      params,
      waitingForOpen: true
    }

    this.childWindow = window.open(this.childUrl('/auth'), '_blank', 'menubar=1,resizable=1,width=350,height=500')

    try {
      return await this.deferredTransact.deferral.promise
    } catch (e) {
      console.error(e)
      throw e
    }
  }

  async login () {
    if (this.deferredTransact) {
      this.closeChild(true)
      this.deferredTransact.deferral.reject('Trying to login')
      this.deferredTransact = undefined
    }
    
    this.childWindow = window.open(this.childUrl('/login'), '_blank', 'menubar=1,resizable=1,width=350,height=500')
    this.deferredLogin = new Deferred()

    try {
      this.storage!.write('wallet-type', 'protonweb')

      const auth: {
        actor: string,
        permission: string
      } = await this.deferredLogin.promise
      return {
        session: {
          auth,
          transact: (transaction: any) => this.transact(transaction)
        }
      }
    } catch (e) {
      console.error(e)
      throw e
    }
  }

  async restoreSession (/* requestAccount */ _: string, auth: any) {
    return {
      auth,
      transact: (transaction: any) => this.transact(transaction)
    }
  }

  async removeSession (appIdentifier: string, auth: any, chainId: any) {
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

  async onEvent (e: MessageEvent) {
    if (!e.origin.startsWith('https://cryptowebauth.com')) {
      return
    }

    try {
      const { type, data, error } = JSON.parse(e.data)
      if (!type) {
        return
      }

      console.log(type, data, error)

      // Ready to receive transaction
      if (type === 'isReady')
      {
        if (this.deferredTransact && this.deferredTransact.waitingForOpen) {
          this.deferredTransact.waitingForOpen = false
          
          this.childWindow!.postMessage(JSON.stringify({
            type: 'transaction',
            data: this.deferredTransact.transaction
          }), '*')
        }
      }
      // Close child
      else if (type === 'close')
      {
        this.closeChild(true)

        if (this.deferredTransact) {
          this.deferredTransact.deferral.reject('Closed')
        } else if (this.deferredLogin) {
          this.deferredLogin.reject('Closed')
        }
      }
      // TX Success
      else if (type === 'transactionSuccess') 
      {
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
      else if (type === 'loginSuccess')
      {
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