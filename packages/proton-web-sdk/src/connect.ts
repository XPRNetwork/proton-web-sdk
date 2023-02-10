import ProtonLinkBrowserTransport from '@proton/browser-transport'
import ProtonLink from '@proton/link'
import type { LinkOptions, PermissionLevel } from '@proton/link'
import WalletTypeSelector from './walletTypeSelector'
import { ProtonWebLink } from './links/protonWeb'
import { Storage } from './storage'
import { WALLET_TYPES } from './constants'
import type { ConnectWalletArgs, ConnectWalletRet, LoginOptions } from './types'
import { JsonRpc } from '@proton/js'

let walletSelector: WalletTypeSelector | undefined;

export const ConnectWallet = async ({
  linkOptions,
  transportOptions = {},
  selectorOptions = {}
}: ConnectWalletArgs): Promise<ConnectWalletRet> => {
  // Add RPC
  const rpc = new JsonRpc(linkOptions.endpoints)
  linkOptions.client = rpc
  
  // Add Chain ID
  if (!linkOptions.chainId) {
    const info = await rpc.get_info();;
    linkOptions.chainId = info.chain_id
  }

  // Add storage
  if (!linkOptions.storage) {
    linkOptions.storage = new Storage(linkOptions.storagePrefix || 'proton-storage')
  }

  return login({ selectorOptions, linkOptions, transportOptions }).finally(() => {
    if (walletSelector) {
      walletSelector.destroy()
      walletSelector = undefined
    }
  })
}

const login = async (loginOptions: LoginOptions): Promise<{
  link: any;
  session: any;
  loginResult: any
} | {
  error: any
}> => {
  // Initialize link and session
  let session: any
  let link
  let loginResult

  if (!walletSelector) {
    walletSelector = new WalletTypeSelector(loginOptions.selectorOptions.appName, loginOptions.selectorOptions.appLogo, loginOptions.selectorOptions.customStyleOptions,loginOptions.selectorOptions.dialogRootNode);
  }

  // Determine wallet type from storage or selector modal
  let walletType: string | null | undefined = loginOptions.selectorOptions ? loginOptions.selectorOptions.walletType : undefined;

  if (!walletType) {
    if (loginOptions.linkOptions.restoreSession) {
      walletType = await loginOptions.linkOptions.storage!.read('wallet-type')
    } else {
      const enabledWalletTypes = loginOptions.selectorOptions.enabledWalletTypes
        ? WALLET_TYPES.filter(wallet => loginOptions.selectorOptions.enabledWalletTypes && loginOptions.selectorOptions.enabledWalletTypes.includes(wallet.key))
        : WALLET_TYPES

      try {
        walletType = await walletSelector.displayWalletSelector(enabledWalletTypes)
      } catch (e) {
        console.log('CANCEL', e)
        return {
          error: e
        }
      }
    }
  }

  if (!walletType) {
    return {
      error: new Error('Wallet Type Unavailable: No wallet provided')
    }
  }

  // Determine chain
  let chain = 'proton'
  if (loginOptions.linkOptions.chainId === '71ee83bcf52142d61019d95f9cc5427ba6a0d7ff8accd9e2088ae2abeaf3d3dd') {
    chain = 'proton-test'
  }

  // Set scheme
  let scheme = 'proton'
  if (walletType === 'anchor') {
    scheme = 'esr'
  } else if (chain === 'proton-test') {
    scheme = 'proton-dev'
  }

  const options = {
    ...loginOptions.linkOptions,
    scheme,
    transport: new ProtonLinkBrowserTransport({
      ...loginOptions.transportOptions,
      walletType
    }) as any,
    walletType,
    chains: []
  }

  // Create link
  if (walletType === 'webauth') {
    link = new ProtonWebLink(options as LinkOptions)
  } else {
    link = new ProtonLink(options as LinkOptions)
  }

  // Session from login
  if (!loginOptions.linkOptions.restoreSession) {
    let backToSelector = false
    document.addEventListener('backToSelector', () => { backToSelector = true })
    try {
      loginResult = await link.login(loginOptions.transportOptions?.requestAccount || '')
      session = loginResult.session as any
      const stringAuth = JSON.stringify({
        actor: loginResult.session.auth.actor.toString(),
        permission: loginResult.session.auth.permission.toString(),
      })
      loginOptions.linkOptions.storage!.write('user-auth', stringAuth)
    } catch (e) {
      console.error('restoreSession Error:')
      console.error(e)

      if (backToSelector) {
        document.removeEventListener('backToSelector', () => { backToSelector = true })
        return login({ ...loginOptions, repeat: true })
      } else {
        return {
          error: e
        }
      }
    }
    // Session from restore
  } else {
    const stringifiedUserAuth = await loginOptions.linkOptions.storage!.read('user-auth')
    const parsedUserAuth = stringifiedUserAuth ? JSON.parse(stringifiedUserAuth) : {}
    const savedUserAuth: PermissionLevel = Object.keys(parsedUserAuth).length > 0 ? parsedUserAuth : null
    if (savedUserAuth) {
      session = await link.restoreSession(loginOptions.transportOptions.requestAccount || '', savedUserAuth) as any

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
    session.publicKey = session.publicKey ? session.publicKey.toString() : undefined as any
  }

  return {
    session,
    link,
    loginResult
  } as any
}
