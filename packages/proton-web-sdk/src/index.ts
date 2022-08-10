
import { ConnectWallet } from './connect'

export type { ProtonWebLink } from './links/protonWeb'
export type { Link, LinkSession, TransactResult } from '@proton/link'

//Allowing Type Definitions to be used by other modules
export * from "./types"

export default ConnectWallet
