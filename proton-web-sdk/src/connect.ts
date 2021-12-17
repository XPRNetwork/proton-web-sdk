import ProtonLinkBrowserTransport, { BrowserTransportOptions } from '@proton/browser-transport'
import ProtonLink, { Link, LinkOptions, LinkSession, LinkStorage, LoginResult, PermissionLevel } from '@proton/link'
import { AxiosProvider } from '@proton/provider-axios'
import { APIClient } from '@greymass/eosio'
import SupportedWallets from './supported-wallets'
import { ProtonWebLink } from './protonWeb'

class Storage implements LinkStorage {
  constructor(readonly keyPrefix: string) {}

  async write(key: string, data: string): Promise<void> {
      localStorage.setItem(this.storageKey(key), data)
  }

  async read(key: string): Promise<string | null> {
      return localStorage.getItem(this.storageKey(key))
  }

  async remove(key: string): Promise<void> {
      localStorage.removeItem(this.storageKey(key))
  }

  storageKey(key: string) {
      return `${this.keyPrefix}-${key}`
  }
}

type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

export interface CustomStyleOptions {
  modalBackgroundColor?: string,
  logoBackgroundColor?: string,
  isLogoRound?: boolean,
  optionBackgroundColor?: string,
  optionFontColor?: string,
  primaryFontColor?: string,
  secondaryFontColor?: string,
  linkColor?: string,
}

interface ConnectWalletArgs {
  linkOptions: PartialBy<LinkOptions, 'transport'|'chains'|'scheme'> & {
    endpoints: string[],
    storage?: LinkStorage,
    storagePrefix?: string,
    restoreSession?: boolean,
    testUrl?: string
  },
  transportOptions?: BrowserTransportOptions;
  selectorOptions?: {
    appName?: string,
    appLogo?: string,
    walletType?: string,
    enabledWalletTypes?: string[],
    customStyleOptions?: CustomStyleOptions
  }
}

interface ConnectWalletRet {
  session?: LinkSession;
  link?: ProtonWebLink | Link;
  loginResult?: LoginResult;
  error?: any
}

const ALL_WALLETS = [
  { key: 'proton', value: 'Mobile Wallet' },
  { key: 'webauth', value: 'Web Wallet' },
  { key: 'anchor', value: 'Anchor' },
]

export const ConnectWallet = async ({
    linkOptions,
    transportOptions = {},
    selectorOptions = {}
}: ConnectWalletArgs): Promise<ConnectWalletRet> => {
  // Add RPC
  linkOptions.client = new APIClient({
    provider: new AxiosProvider(linkOptions.endpoints)
  })

  // Add chain ID if not present
  if (!linkOptions.chainId) {
    const info = await linkOptions.client.v1.chain.get_info();;
    linkOptions.chainId = info.chain_id
  }
    
  // Add storage if not present
  if (!linkOptions.storage) {
    linkOptions.storage = new Storage(linkOptions.storagePrefix || 'proton-storage')
  }

  let session: any, link, loginResult: any

  try {
    const res: ConnectWalletRet = await new Promise((resolve) => {
      const login = async (): Promise<void> => {
        // Create Modal Class
        const wallets = new SupportedWallets(selectorOptions.appName, selectorOptions.appLogo, selectorOptions.customStyleOptions)
  
        // Determine wallet type from storage or selector modal
        let walletType: string | null | undefined = selectorOptions.walletType

        if (!walletType) {
          if (linkOptions.restoreSession) {
            walletType = await linkOptions.storage!.read('wallet-type')
          } else {
            const enabledWalletTypes = selectorOptions.enabledWalletTypes
              ? ALL_WALLETS.filter(wallet => selectorOptions.enabledWalletTypes?.includes(wallet.key))
              : ALL_WALLETS

            try {
              walletType = await wallets.displayWalletSelector(enabledWalletTypes)
            } catch (e) {
              resolve({ error: e })
            }
          }
        }
  
        if (!walletType) {
          resolve({ error: new Error('Wallet Type Unavailable: No walletType provided') })
          return
        }
  
        // Set scheme
        let scheme
        switch (walletType) {
          case 'anchor':
            scheme = 'esr'
            break
          case 'proton':
          case 'webauth': {
            // Proton Testnet
            if (linkOptions.chainId === '71ee83bcf52142d61019d95f9cc5427ba6a0d7ff8accd9e2088ae2abeaf3d3dd') {
              scheme = 'proton-dev'
            } else {
              scheme = 'proton'
            }
            break;
          }
          default:
            scheme = 'proton'
            break
        }
  
        console.log('SCHEME', scheme)
  
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
            session = loginResult.session
            console.log('loginResult', loginResult)
            const stringAuth = JSON.stringify({
              actor: loginResult.session.auth.actor.toString(),
              permission: loginResult.session.auth.permission.toString(),
            })
            linkOptions.storage!.write('user-auth', stringAuth)
          } catch(e) {
            console.log('restoreSession Error:')
            console.error(e)
            console.log('backToSelector', backToSelector)
            if (backToSelector) {
              document.removeEventListener('backToSelector', () => {backToSelector = true})
              return login()
            } else {
              resolve({ error: e })
              return
            }
          }
        // Session from restore
        } else {
          const stringifiedUserAuth = await linkOptions.storage!.read('user-auth')
          const parsedUserAuth = stringifiedUserAuth ? JSON.parse(stringifiedUserAuth) : {}
          const savedUserAuth : PermissionLevel = Object.keys(parsedUserAuth).length > 0 ? parsedUserAuth : null
          if (savedUserAuth) {
            session = await link.restoreSession(transportOptions.requestAccount || '', savedUserAuth)
  
            // Could not restore
            if (!session) {
              // clean storage to remove unexpected side effects if session restore fails
              linkOptions.storage!.remove('wallet-type')
              linkOptions.storage!.remove('user-auth')
              resolve({ link: undefined, session: undefined })
              return
            }
          }
        }
  
        resolve({
          session: {
            ...session,
            auth: {
              actor: session.auth.actor.toString(),
              permission: session.auth.permission.toString(),
            },
            publicKey: session.publicKey ? session.publicKey.toString() : undefined,
          },
          link,
          loginResult
        })
        return
      }
  
      login()
    })

    return res
  } catch (e) {
    return {
      error: e
    }
  }
}
