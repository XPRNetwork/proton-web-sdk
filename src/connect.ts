import ProtonLinkBrowserTransport, { BrowserTransportOptions } from '@proton/browser-transport'
import ProtonLink, { LinkOptions, PermissionLevel } from '@proton/link'
import { AxiosProvider } from '@proton/provider-axios'
import { APIClient } from '@greymass/eosio'
import WalletTypeSelector from './walletTypeSelector'
import { ProtonWebLink } from './links/protonWeb'
import { Storage } from './storage'
import { WALLET_TYPES } from './constants'

export const ConnectWallet = async ({
  linkOptions,
  transportOptions = {},
  selectorOptions = {}
}: ConnectWalletArgs): Promise<ConnectWalletRet> => {
  // Add RPC
  linkOptions.client = new APIClient({
    provider: new AxiosProvider(linkOptions.endpoints)
  })

  // Add Chain ID
  if (!linkOptions.chainId) {
    const info = await linkOptions.client.v1.chain.get_info();;
    linkOptions.chainId = info.chain_id
  }
    
  // Add storage
  if (!linkOptions.storage) {
    linkOptions.storage = new Storage(linkOptions.storagePrefix || 'proton-storage')
  }

  return login(selectorOptions, linkOptions, transportOptions)
}

const login = async (selectorOptions: SelectorOptions, linkOptions: LocalLinkOptions, transportOptions: BrowserTransportOptions): Promise<{
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

  // Create Modal Class
  const wallets = new WalletTypeSelector(selectorOptions.appName, selectorOptions.appLogo, selectorOptions.customStyleOptions)

  // Determine wallet type from storage or selector modal
  let walletType: string | null | undefined = selectorOptions.walletType

  if (!walletType) {
    if (linkOptions.restoreSession) {
      walletType = await linkOptions.storage!.read('wallet-type')
    } else {
      const enabledWalletTypes = selectorOptions.enabledWalletTypes
        ? WALLET_TYPES.filter(wallet => selectorOptions.enabledWalletTypes?.includes(wallet.key))
        : WALLET_TYPES

      try {
        walletType = await wallets.displayWalletSelector(enabledWalletTypes)
      } catch (e) {
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
  if (linkOptions.chainId === '71ee83bcf52142d61019d95f9cc5427ba6a0d7ff8accd9e2088ae2abeaf3d3dd') {
    chain = 'proton-test'
  }

  // Set scheme
  let scheme = 'proton'
  if (chain === 'proton-test') {
    scheme = 'proton-dev'
  } else if (walletType === 'anchor') {
    scheme = 'esr'
  }

  const options = {
    ...linkOptions,
    scheme,
    transport: new ProtonLinkBrowserTransport({
      ...transportOptions,
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
  if (!linkOptions.restoreSession) {
    let backToSelector = false
    document.addEventListener('backToSelector', () => {backToSelector = true})
    try {
      loginResult = await link.login(transportOptions.requestAccount || '')
      session = loginResult.session as any
      const stringAuth = JSON.stringify({
        actor: loginResult.session.auth.actor.toString(),
        permission: loginResult.session.auth.permission.toString(),
      })
      linkOptions.storage!.write('user-auth', stringAuth)
    } catch(e) {
      console.error('restoreSession Error:')
      console.error(e)

      if (backToSelector) {
        document.removeEventListener('backToSelector', () => {backToSelector = true})
        return login(selectorOptions, linkOptions, transportOptions)
      } else {
        return {
          error: e
        }
      }
    }
  // Session from restore
  } else {
    const stringifiedUserAuth = await linkOptions.storage!.read('user-auth')
    const parsedUserAuth = stringifiedUserAuth ? JSON.parse(stringifiedUserAuth) : {}
    const savedUserAuth : PermissionLevel = Object.keys(parsedUserAuth).length > 0 ? parsedUserAuth : null
    if (savedUserAuth) {
      session = await link.restoreSession(transportOptions.requestAccount || '', savedUserAuth) as any

      // Could not restore
      if (!session) {
        // clean storage to remove unexpected side effects if session restore fails
        linkOptions.storage!.remove('wallet-type')
        linkOptions.storage!.remove('user-auth')

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