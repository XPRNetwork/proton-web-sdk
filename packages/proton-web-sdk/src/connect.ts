import ProtonLinkBrowserTransport from '@proton/browser-transport'
import ProtonLink from '@proton/link'
import type {LinkOptions, PermissionLevel} from '@proton/link'
import {ProtonWebLink} from './links/protonWeb'
import {Storage} from './storage'
import type {ConnectWalletArgs, ConnectWalletRet, LoginOptions, UIOptions} from './types'
import {JsonRpc, JsonRpcPulseVM} from '@proton/js'
import {WebRenderer} from '@proton/web-renderer'

let renderer: WebRenderer | undefined
let uiTheme: UIOptions['theme'] = undefined

const PULSE_VM_DEFAULT_ENDPOINTS = [
  'https://pulsevm-devnet-01.metalblockchain.org/ext/bc/2T6FphmDo8szR3UERGsDsXaQPb52xUn2djnAt7S6LECbHDhc5L/rpc',
]
const PULSE_VM_DEFAULT_CHAIN_ID =
  'bef02258ee702d2d8df016ce2f2cbcf6bfa986dcd8c8641acd9068b8f9c4c7ef'

export const setUITheme = (value: UIOptions['theme']) => {
  if (value) {
    uiTheme = value
    renderer?.setTheme(value)
  }
}

export const runUIDemo = async ({uiOptions}: Pick<ConnectWalletArgs, 'uiOptions'> = {}) => {
  const demoRenderer = new WebRenderer({id: 'demo-widget', ...uiOptions})
  try {
    await demoRenderer.demo()
  } finally {
    demoRenderer?.destroy()
  }
}

export const ConnectWallet = async ({
  linkOptions,
  transportOptions = {},
  selectorOptions = {},
  uiOptions = {},
}: ConnectWalletArgs): Promise<ConnectWalletRet> => {
  if (linkOptions.usePulseVM) {
    linkOptions.endpoints = PULSE_VM_DEFAULT_ENDPOINTS
  }

  // Add RPC
  const rpcClass = linkOptions.usePulseVM ? JsonRpcPulseVM : JsonRpc
  const rpc = new rpcClass(linkOptions.endpoints)
  linkOptions.client = rpc

  // Add Chain ID
  if (!linkOptions.chainId) {
    if (linkOptions.usePulseVM) {
      linkOptions.chainId = PULSE_VM_DEFAULT_CHAIN_ID
    } else {
      const info = await rpc.get_info()
      linkOptions.chainId = info.chain_id
    }
  }

  // Add storage
  if (!linkOptions.storage) {
    linkOptions.storage = new Storage(linkOptions.storagePrefix || 'proton-storage')
  }

  if (uiTheme) {
    uiOptions.theme = uiTheme
  }

  if (!renderer) {
    renderer = new WebRenderer(uiOptions)
  }

  return await login({selectorOptions, linkOptions, transportOptions})
}

const login = async (
  loginOptions: LoginOptions
): Promise<
  | {
      link: any
      session: any
      loginResult: any
    }
  | {
      error: any
    }
> => {
  const doLogin = async (loginOptions: LoginOptions) => {
    // Initialize link and session
    let session: any
    let link
    let loginResult

    // Determine wallet type from storage or selector modal
    let walletType: string | null | undefined = loginOptions.selectorOptions
      ? loginOptions.selectorOptions.walletType
      : undefined

    if (!walletType) {
      if (loginOptions.linkOptions.restoreSession) {
        walletType = await loginOptions.linkOptions.storage!.read('wallet-type')
      } else {
        try {
          walletType = await renderer?.selectWallet({
            enabledWallets: loginOptions.selectorOptions.enabledWalletTypes,
          })
        } catch (e) {
          return {
            error: e,
          }
        }
      }
    }

    if (!walletType) {
      return {
        error: new Error('Wallet Type Unavailable: No wallet provided'),
      }
    }

    // Determine chain
    let chain = 'proton'
    if (
      loginOptions.linkOptions.chainId ===
      '71ee83bcf52142d61019d95f9cc5427ba6a0d7ff8accd9e2088ae2abeaf3d3dd'
    ) {
      chain = 'proton-test'
    }

    // Set scheme
    let scheme: string | undefined = undefined

    if (loginOptions.linkOptions.scheme) {
      scheme = loginOptions.linkOptions.scheme
    } else if (loginOptions.linkOptions.usePulseVM) {
      scheme = 'achain'
    }

    if (!scheme) {
      if (walletType === 'anchor') {
        scheme = 'esr'
      } else if (chain === 'proton-test') {
        scheme = 'proton-dev'
      } else {
        scheme = 'proton'
      }
    }

    const options = {
      ...loginOptions.linkOptions,
      scheme,
      transport: new ProtonLinkBrowserTransport({
        ...loginOptions.transportOptions,
        walletType,
        ui: renderer,
      }) as any,
      walletType,
      chains: [],
    }

    // Create link
    if (walletType === 'webauth') {
      link = new ProtonWebLink(options as LinkOptions)
    } else {
      link = new ProtonLink(options as LinkOptions)
    }

    // Session from login
    if (!loginOptions.linkOptions.restoreSession) {
      try {
        loginResult = await link.login(loginOptions.transportOptions?.requestAccount || '')
        session = loginResult.session as any
        const stringAuth = JSON.stringify({
          actor: loginResult.session.auth.actor.toString(),
          permission: loginResult.session.auth.permission.toString(),
        })
        loginOptions.linkOptions.storage!.write('user-auth', stringAuth)
      } catch (e) {
        if ((e as Error)['code'] === 'E_WALLET_TYPE') {
          return null
        } else {
          console.error('restoreSession Error:')
          console.error(e)
          return {
            error: e,
          }
        }
      }
      // Session from restore
    } else {
      const stringifiedUserAuth = await loginOptions.linkOptions.storage!.read('user-auth')
      const parsedUserAuth = stringifiedUserAuth ? JSON.parse(stringifiedUserAuth) : {}
      const savedUserAuth: PermissionLevel =
        Object.keys(parsedUserAuth).length > 0 ? parsedUserAuth : null
      if (savedUserAuth) {
        session = (await link.restoreSession(
          loginOptions.transportOptions.requestAccount || '',
          savedUserAuth
        )) as any

        // Could not restore
        if (!session) {
          // clean storage to remove unexpected side effects if session restore fails
          loginOptions.linkOptions.storage!.remove('wallet-type')
          loginOptions.linkOptions.storage!.remove('user-auth')

          return {
            link: undefined,
            session: undefined,
            loginResult: undefined,
          }
        }
      }
    }

    if (session! && session.auth) {
      session.auth = {
        actor: session.auth.actor.toString(),
        permission: session.auth.permission.toString(),
      } as any
      session.publicKey = session.publicKey ? session.publicKey.toString() : (undefined as any)
    }

    return {
      session,
      link,
      loginResult,
    } as any
  }

  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve) => {
    let res = null
    while (res === null) {
      res = await doLogin({...loginOptions})
    }
    resolve(res)
  })
}
