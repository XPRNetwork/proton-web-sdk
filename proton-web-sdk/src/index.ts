import ProtonLinkBrowserTransport, { BrowserTransportOptions } from '@bloks/browser-transport'
import ProtonLink, { LinkOptions, LinkStorage, PermissionLevel } from '@bloks/link'
import { AxiosProvider } from '@bloks/provider-axios'
import { APIClient } from '@greymass/eosio'
import SupportedWallets from './supported-wallets'
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
    linkOptions: PartialBy<LinkOptions, 'transport'|'chains'> & {
        endpoints: string[],
        storage?: LinkStorage,
        storagePrefix?: string,
        restoreSession?: boolean,
    },
    transportOptions?: BrowserTransportOptions;
    selectorOptions?: {
        appName?: string,
        appLogo?: string,
        walletType?: string
        customStyleOptions?: CustomStyleOptions
    }
}

export const ConnectWallet = async ({
    linkOptions,
    transportOptions = {},
    selectorOptions = {}
}: ConnectWalletArgs) => {
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

    // Stop restore session if no saved data
    if (linkOptions.restoreSession) {
        const savedUserAuth = await linkOptions.storage.read('user-auth')
        const walletType = await linkOptions.storage.read('wallet-type')
        if (!savedUserAuth || !walletType) {
            // clean storage to remove unexpected side effects if session restore fails
            linkOptions.storage.remove('wallet-type')
            linkOptions.storage.remove('user-auth')
            return { link: null, session: null }
        }
    }

    let session, link, loginResult

    while(!session) {
        // Create Modal Class
        const wallets = new SupportedWallets(selectorOptions.appName, selectorOptions.appLogo, selectorOptions.customStyleOptions)

        // Determine wallet type from storage or selector modal
        let walletType = selectorOptions.walletType
        if (!walletType) {
            const storedWalletType = await linkOptions.storage.read('wallet-type')
            if (storedWalletType) {
                walletType = storedWalletType
            } else if (!linkOptions.restoreSession) {
                try {
                    walletType = await wallets.displayWalletSelector()
                } catch(e) {
                    throw new Error(e)
                }
            } else {
                try {
                    throw new Error('Wallet Type Unavailable: No walletType provided')
                } catch (e) {
                    console.error(e)
                }
            }
        }

        // Set scheme (proton default)
        switch (walletType) {
            case 'anchor':
                linkOptions.scheme = 'esr'
                break
            case 'proton': {
                // Proton Testnet
                if (linkOptions.chainId === '71ee83bcf52142d61019d95f9cc5427ba6a0d7ff8accd9e2088ae2abeaf3d3dd') {
                    linkOptions.scheme = 'proton-dev'
                } else {
                    linkOptions.scheme = 'proton'
                }
                break;
            }
            default:
                linkOptions.scheme = 'proton'
                break
        }

        // Create transport
        const transport = new ProtonLinkBrowserTransport({
            ...transportOptions,
            walletType
        })

        // Create link
        link = new ProtonLink({
            ...linkOptions,
            transport: transport as any,
            walletType,
            chains: []
        })

        // Get session based on login or restore session
        if (!linkOptions.restoreSession) {
            let backToSelector = false
            document.addEventListener('backToSelector', () => {backToSelector = true})
            try {
                loginResult = await link.login(transportOptions.requestAccount || '')
                session = loginResult.session
                linkOptions.storage.write('user-auth', JSON.stringify(loginResult.session.auth))
            } catch(e) {
                if (backToSelector) {
                    document.removeEventListener('backToSelector', () => {backToSelector = true})
                    continue
                } else {
                    throw e;
                }
            }
        } else {
            const stringifiedUserAuth = await linkOptions.storage.read('user-auth')
            const parsedUserAuth = stringifiedUserAuth ? JSON.parse(stringifiedUserAuth) : {}
            const savedUserAuth : PermissionLevel = Object.keys(parsedUserAuth).length > 0 ? parsedUserAuth : null
            if (savedUserAuth) {
                session = await link.restoreSession(transportOptions.requestAccount || '', savedUserAuth)

                // Could not restore
                if (!session) {
                    // clean storage to remove unexpected side effects if session restore fails
                    linkOptions.storage.remove('wallet-type')
                    linkOptions.storage.remove('user-auth')
                    return { link: null, session: null }
                }
            }
        }
    }

    // Return link, loginResult
    return { link, session, loginResult }
}
