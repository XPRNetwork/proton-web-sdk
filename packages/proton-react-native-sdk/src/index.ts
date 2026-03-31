import './registerGlobals'
import ReactNativeTransport, {ReactNativeTransportOptions} from './transport'

import ProtonLink, {LinkOptions, LinkSession, LinkStorage, PermissionLevel} from '@proton/link'
import {JsonRpc, type JsonRpcApi, JsonRpcPulseVM} from '@proton/js'

import Storage from './storage'

type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

interface ConnectWalletArgs {
  linkOptions: PartialBy<LinkOptions, 'transport' | 'chains' | 'scheme'> & {
    endpoints: string[]
    rpc?: JsonRpcApi
    storage?: LinkStorage
    storagePrefix?: string
    restoreSession?: boolean
  }
  transportOptions: ReactNativeTransportOptions
}

const PULSE_VM_DEFAULT_ENDPOINTS = [
  'https://pulsevm-devnet-01.metalblockchain.org/ext/bc/2T6FphmDo8szR3UERGsDsXaQPb52xUn2djnAt7S6LECbHDhc5L/rpc',
]
const PULSE_VM_DEFAULT_CHAIN_ID =
  'bef02258ee702d2d8df016ce2f2cbcf6bfa986dcd8c8641acd9068b8f9c4c7ef'

const ConnectWallet = async ({linkOptions, transportOptions}: ConnectWalletArgs) => {
  if (linkOptions.usePulseVM) {
    linkOptions.endpoints = PULSE_VM_DEFAULT_ENDPOINTS
  }

  // Add RPC
  const rpcClass = linkOptions.usePulseVM ? JsonRpcPulseVM : JsonRpc

  linkOptions.client = linkOptions.rpc || new rpcClass(linkOptions.endpoints)

  // Add chain ID if not present
  if (!linkOptions.chainId) {
    if (linkOptions.usePulseVM) {
      linkOptions.chainId = PULSE_VM_DEFAULT_CHAIN_ID
    } else {
      const info = await linkOptions.client!.get_info()
      linkOptions.chainId = info.chain_id
    }
  }

  // Add storage if not present
  if (!linkOptions.storage) {
    linkOptions.storage = new Storage(linkOptions.storagePrefix || 'proton-storage')
  }

  // Stop restore session if no saved data
  if (linkOptions.restoreSession) {
    const savedUserAuth = await linkOptions.storage.read('user-auth')
    if (!savedUserAuth) {
      // clean storage to remove unexpected side effects if session restore fails
      linkOptions.storage.remove('user-auth')
      return {link: null, session: null}
    }
  }

  let session, loginResult

  // Set scheme
  if (!linkOptions.scheme) {
    if (linkOptions.usePulseVM) {
      linkOptions.scheme = 'achain'
    } else {
      if (
        linkOptions.chainId === '71ee83bcf52142d61019d95f9cc5427ba6a0d7ff8accd9e2088ae2abeaf3d3dd'
      ) {
        linkOptions.scheme = 'proton-dev'
      } else {
        linkOptions.scheme = 'proton'
      }
    }
  }

  const transport = new ReactNativeTransport({
    ...transportOptions,
  })

  // Create link
  const options: LinkOptions = {
    ...(linkOptions as LinkOptions),
    transport,
    walletType: 'proton',
    chains: [],
  }

  const link = new ProtonLink(options)

  // Get session based on login or restore session
  if (!linkOptions.restoreSession) {
    loginResult = await link.login(transportOptions.requestAccount || '')
    session = loginResult.session
    linkOptions.storage.write('user-auth', JSON.stringify(loginResult.session.auth))
  } else {
    const stringifiedUserAuth = await linkOptions.storage.read('user-auth')
    const parsedUserAuth = stringifiedUserAuth ? JSON.parse(stringifiedUserAuth) : {}
    const savedUserAuth: PermissionLevel =
      Object.keys(parsedUserAuth).length > 0 ? parsedUserAuth : null
    if (savedUserAuth) {
      session = await link.restoreSession(transportOptions.requestAccount || '', savedUserAuth)
    }
  }

  return {link, session, loginResult}
}

export {ProtonLink, LinkSession}
export default ConnectWallet
