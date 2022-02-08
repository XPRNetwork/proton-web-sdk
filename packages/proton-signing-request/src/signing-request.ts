/**
 * EOSIO Signing Request (ESR).
 */

import {
    ABI,
    ABIDecoder,
    ABIDef,
    ABIEncoder,
    ABISerializable,
    ABISerializableConstructor,
    ABISerializableType,
    Action,
    AnyAction,
    AnyTransaction,
    Bytes,
    BytesType,
    Checksum256,
    Name,
    NameType,
    PermissionLevel,
    PermissionLevelType,
    Serializer,
    Signature,
    SignatureType,
    TimePointSec,
    TimePointType,
    Transaction,
    TransactionExtension,
    UInt16,
    UInt16Type,
    UInt32,
    UInt32Type,
    UInt8,
    VarUInt,
} from '@greymass/eosio'

import * as base64u from './base64u'
import {ChainAlias, ChainId, ChainIdType, ChainIdVariant, ChainName} from './chain-id'
import {
    IdentityV2,
    IdentityV3,
    InfoPair,
    RequestDataV2,
    RequestDataV3,
    RequestFlags,
    RequestSignature,
} from './abi'
import {IdentityProof} from './identity-proof'

/** Current supported protocol version, backwards compatible with version 2. */
export const ProtocolVersion = 2

/** Interface that should be implemented by abi providers. */
export interface AbiProvider {
    /**
     * Return a promise that resolves to an abi object for the given account name,
     * e.g. the result of a rpc call to chain/get_abi.
     */
    getAbi: (account: Name) => Promise<ABIDef>
}

/** Interface that should be implemented by zlib implementations. */
export interface ZlibProvider {
    /** Deflate data w/o adding zlib header. */
    deflateRaw: (data: Uint8Array) => Uint8Array
    /** Inflate data w/o requiring zlib header. */
    inflateRaw: (data: Uint8Array) => Uint8Array
}

/** Interface that should be implemented by signature providers. */
export interface SignatureProvider {
    /** Sign 32-byte message and return signer name and signature string. */
    sign: (message: Checksum256) => {signer: NameType; signature: SignatureType}
}

/**
 * The callback payload sent to background callbacks.
 */
export interface CallbackPayload {
    /** The first signature. */
    sig: string
    /** Transaction ID as HEX-encoded string. */
    tx: string
    /** Block number hint (only present if transaction was broadcast). */
    bn?: string
    /** Signer authority, aka account name. */
    sa: string
    /** Signer permission, e.g. "active". */
    sp: string
    /** Reference block num used when resolving request. */
    rbn: string
    /** Reference block id used when resolving request. */
    rid: string
    /** The originating signing request packed as a uri string. */
    req: string
    /** Expiration time used when resolving request. */
    ex: string
    /** The resolved chain id.  */
    cid?: string
    /** All signatures 0-indexed as `sig0`, `sig1`, etc. */
    [sig0: string]: string | undefined
}

/**
 * Context used to resolve a callback.
 * Compatible with the JSON response from a `push_transaction` call.
 */
export interface ResolvedCallback {
    /** The URL to hit. */
    url: string
    /**
     * Whether to run the request in the background. For a https url this
     * means POST in the background instead of a GET redirect.
     */
    background: boolean
    /**
     * The callback payload as a object that should be encoded to JSON
     * and POSTed to background callbacks.
     */
    payload: CallbackPayload
}

/**
 * Context used to resolve a transaction.
 * Compatible with the JSON response from a `get_block` call.
 */
export interface TransactionContext {
    /** Timestamp expiration will be derived from. */
    timestamp?: TimePointType
    /**
     * How many seconds in the future to set expiration when deriving from timestamp.
     * Defaults to 60 seconds if unset.
     */
    expire_seconds?: UInt32Type
    /** Block number ref_block_num will be derived from. */
    block_num?: UInt32Type
    /** Reference block number, takes precedence over block_num if both is set. */
    ref_block_num?: UInt16Type
    /** Reference block prefix. */
    ref_block_prefix?: UInt32Type
    /** Expiration timestamp, takes precedence over timestamp and expire_seconds if set. */
    expiration?: TimePointType
    /** Chain ID to resolve for, required for multi-chain requests. */
    chainId?: ChainIdType
}

export const DEFAULT_SCHEME = 'esr'

/**
 * The placeholder name: `............1` aka `uint64(1)`.
 * If used in action data will be resolved to current signer.
 * If used in as an authorization permission will be resolved to
 * the signers permission level.
 *
 * Example action:
 * ```
 * { account: "eosio.token",
 *   name: "transfer",
 *   authorization: [{actor: "............1", permission: "............1"}],
 *   data: {
 *     from: "............1",
 *     to: "bar",
 *     quantity: "42.0000 EOS",
 *     memo: "Don't panic" }}
 * ```
 * When signed by `foo@active` would resolve to:
 * ```
 * { account: "eosio.token",
 *   name: "transfer",
 *   authorization: [{actor: "foo", permission: "active"}],
 *   data: {
 *     from: "foo",
 *     to: "bar",
 *     quantity: "42.0000 EOS",
 *     memo: "Don't panic" }}
 * ```
 */
export const PlaceholderName = Name.from('............1') // aka uint64(1)

/** Placeholder that will resolve to signer permission name. */
export const PlaceholderPermission = Name.from('............2') // aka uint64(2)

export const PlaceholderAuth = PermissionLevel.from({
    actor: PlaceholderName,
    permission: PlaceholderPermission,
})

export interface ResolvedAction {
    /** The account (a.k.a. contract) to run action on. */
    account: Name
    /** The name of the action. */
    name: Name
    /** The permissions authorizing the action. */
    authorization: PermissionLevel[]
    /** The decoded action data. */
    data: Record<string, ABISerializable>
}

export interface ResolvedTransaction {
    /** The time at which a transaction expires. */
    expiration: TimePointSec
    /** *Specifies a block num in the last 2^16 blocks. */
    ref_block_num: UInt16
    /** Specifies the lower 32 bits of the block id. */
    ref_block_prefix: UInt32
    /** Upper limit on total network bandwidth (in 8 byte words) billed for this transaction. */
    max_net_usage_words: VarUInt
    /** Upper limit on the total CPU time billed for this transaction. */
    max_cpu_usage_ms: UInt8
    /** Number of seconds to delay this transaction for during which it may be canceled. */
    delay_sec: VarUInt
    /** The context free actions in the transaction. */
    context_free_actions: ResolvedAction[]
    /** The actions in the transaction. */
    actions: ResolvedAction[]
    /** Transaction extensions. */
    transaction_extensions: TransactionExtension[]
}

export type CallbackType = string | {url: string; background: boolean}

interface SigningRequestCommonArguments {
    /**
     * Chain ID to use, can be set to `null` for a multi-chain request.
     * Defaults to EOS if omitted.
     */
    chainId?: ChainIdType | null
    /**
     * Chain IDs to constrain a multi-chain request to.
     * Only considered if `chainId` is explicitly set to `null.
     */
    chainIds?: ChainIdType[]
    /** Optional metadata to pass along with the request. */
    info?: {[key: string]: Bytes | ABISerializable}
}

export interface SigningRequestCreateArguments extends SigningRequestCommonArguments {
    /** Single action to create request with. */
    action?: AnyAction
    /** Multiple actions to create request with. */
    actions?: AnyAction[]
    /**
     * Full or partial transaction to create request with.
     * If TAPoS info is omitted it will be filled in when resolving the request.
     */
    transaction?: Partial<AnyTransaction>
    /** Create an identity request. */
    identity?: {
        // scope?: NameType
        permission?: PermissionLevelType
    }
    /** Whether wallet should broadcast tx, defaults to true. */
    broadcast?: boolean
    /**
     * Optional callback URL the signer should hit after
     * broadcasting or signing. Passing a string means background = false.
     */
    callback?: CallbackType
}

export interface SigningRequestCreateIdentityArguments extends SigningRequestCommonArguments {
    /**
     * Callback where the identity should be delivered.
     */
    callback: CallbackType
    /**
     * Requested account name of identity.
     * Defaults to placeholder (any identity) if omitted.
     */
    account?: NameType
    /**
     * Requested account permission.
     * Defaults to placeholder (any permission) if omitted.
     */
    permission?: NameType
    /**
     * Scope for the request.
     */
    // scope?: NameType
}

export interface SigningRequestEncodingOptions {
    /** Optional zlib, if provided the request will be compressed when encoding. */
    zlib?: ZlibProvider
    /** Abi provider, required if the arguments contain un-encoded actions. */
    abiProvider?: AbiProvider
    /** Optional signature provider, will be used to create a request signature if provided. */
    signatureProvider?: SignatureProvider
    /** Custom Scheme . */
    scheme: 'esr' | 'proton' | 'proton-dev'
}

export type AbiMap = Map<string, ABI>

export class SigningRequest {
    /** Return the identity ABI for given version. */
    private static identityAbi(version: number) {
        const abi = Serializer.synthesize(this.identityType(version))
        abi.actions = [{name: 'identity', type: 'identity', ricardian_contract: ''}]
        return abi
    }

    /** Return the ABISerializableType identity type for given version. */
    private static identityType(version: number): typeof IdentityV2 | typeof IdentityV3 {
        return version === 2 ? IdentityV2 : IdentityV3
    }

    /** Return the ABISerializableType storage type for given version. */
    private static storageType(version: number): typeof RequestDataV3 | typeof RequestDataV2 {
        return version === 2 ? RequestDataV2 : RequestDataV3
    }

    /** Create a new signing request. */
    public static async create(
        args: SigningRequestCreateArguments,
        options: SigningRequestEncodingOptions = {scheme: DEFAULT_SCHEME}
    ) {
        let actions: AnyAction[]
        if (args.action) {
            actions = [args.action]
        } else if (args.actions) {
            actions = args.actions
        } else if (args.transaction) {
            actions = args.transaction.actions || []
        } else {
            actions = []
        }
        const requiredAbis = actions
            .filter(
                (action) =>
                    !Bytes.isBytes(action.data) &&
                    (action.data.constructor as any).abiName === undefined
            )
            .map((action) => Name.from(action.account))
        const abis: Record<string, ABIDef> = {}
        if (requiredAbis.length > 0) {
            const provider = options.abiProvider
            if (!provider) {
                throw new Error('Missing abi provider')
            }
            const accountAbis = await Promise.all(
                requiredAbis.map((account) => provider.getAbi(account))
            )
            for (const [idx, abi] of accountAbis.entries()) {
                abis[requiredAbis[idx].toString()] = abi
            }
        }
        return this.createSync(args, options, abis)
    }

    /**
     * Synchronously create a new signing request.
     * @throws If an un-encoded action with no abi def is encountered.
     */
    public static createSync(
        args: SigningRequestCreateArguments,
        options: SigningRequestEncodingOptions = {scheme: DEFAULT_SCHEME},
        abis: Record<string, ABIDef> = {}
    ) {
        let version = 2
        const data: any = {}
        const encode = (action: AnyAction) => encodeAction(action, abis)

        // multi-chain requests requires version 3
        // if (args.chainId === null) {
        //     version = 3
        // }

        // set the request data
        if (args.identity !== undefined) {
            // if (args.identity.scope) {
            //     version = 3
            // }
            data.req = ['identity', this.identityType(version).from(args.identity)]
        } else if (args.action && !args.actions && !args.transaction) {
            data.req = ['action', encode(args.action)]
        } else if (args.actions && !args.action && !args.transaction) {
            if (args.actions.length === 1) {
                data.req = ['action', encode(args.actions[0])]
            } else {
                data.req = ['action[]', args.actions.map(encode)]
            }
        } else if (args.transaction && !args.action && !args.actions) {
            const tx = args.transaction
            // set default values if missing
            if (tx.expiration === undefined) {
                tx.expiration = '1970-01-01T00:00:00.000'
            }
            if (tx.ref_block_num === undefined) {
                tx.ref_block_num = 0
            }
            if (tx.ref_block_prefix === undefined) {
                tx.ref_block_prefix = 0
            }
            if (tx.context_free_actions === undefined) {
                tx.context_free_actions = []
            }
            if (tx.transaction_extensions === undefined) {
                tx.transaction_extensions = []
            }
            if (tx.delay_sec === undefined) {
                tx.delay_sec = 0
            }
            if (tx.max_cpu_usage_ms === undefined) {
                tx.max_cpu_usage_ms = 0
            }
            if (tx.max_net_usage_words === undefined) {
                tx.max_net_usage_words = 0
            }
            if (tx.actions === undefined) {
                tx.actions = []
            }
            if (tx.context_free_actions === undefined) {
                tx.context_free_actions = []
            }
            // encode actions if needed
            tx.actions = tx.actions.map(encode)
            data.req = ['transaction', tx]
        } else {
            throw new TypeError(
                'Invalid arguments: Must have exactly one of action, actions or transaction'
            )
        }

        // set the chain id
        if (args.chainId === null) {
            data.chain_id = ChainIdVariant.from(['chain_alias', 0])
        } else {
            data.chain_id = ChainId.from(args.chainId || ChainName.EOS).chainVariant
        }

        // request flags and callback
        const flags = RequestFlags.from(0)
        let callback = ''
        flags.broadcast = args.broadcast !== undefined ? args.broadcast : data.req[0] !== 'identity'
        if (typeof args.callback === 'string') {
            callback = args.callback
        } else if (typeof args.callback === 'object') {
            callback = args.callback.url
            flags.background = args.callback.background || false
        }
        data.flags = flags
        data.callback = callback

        // info pairs
        data.info = []
        if (typeof args.info === 'object') {
            for (const key in args.info) {
                const isOwn = Object.prototype.hasOwnProperty.call(args.info, key)
                if (isOwn) {
                    let value = args.info[key]
                    if (typeof value === 'string') {
                        value = Bytes.from(value, 'utf8')
                    } else if (!(value instanceof Bytes)) {
                        value = Serializer.encode({object: value})
                    }
                    data.info.push({key, value})
                }
            }
        }
        if (args.chainIds && args.chainId === null) {
            const ids = args.chainIds.map((id) => ChainId.from(id).chainVariant)
            data.info.push({
                key: 'chain_ids',
                value: Serializer.encode({object: ids, type: {type: ChainIdVariant, array: true}}),
            })
        }

        const req = new SigningRequest(
            version,
            this.storageType(version).from(data),
            options.scheme,
            options.zlib,
            options.abiProvider,
        )

        // sign the request if given a signature provider
        if (options.signatureProvider) {
            req.sign(options.signatureProvider)
        }

        return req
    }

    /** Creates an identity request. */
    public static identity(
        args: SigningRequestCreateIdentityArguments,
        options: SigningRequestEncodingOptions = {scheme: DEFAULT_SCHEME}
    ) {
        let permission: PermissionLevelType | undefined = {
            actor: args.account || PlaceholderName,
            permission: args.permission || PlaceholderPermission,
        }
        if (
            permission.actor === PlaceholderName &&
            permission.permission === PlaceholderPermission
        ) {
            permission = undefined
        }
        return this.createSync(
            {
                ...args,
                identity: {
                    permission,
                    // scope: args.scope,
                },
                broadcast: false,
            },
            options
        )
    }

    /**
     * Create a request from a chain id and serialized transaction.
     * @param chainId The chain id where the transaction is valid.
     * @param serializedTransaction The serialized transaction.
     * @param options Creation options.
     */
    public static fromTransaction(
        chainId: ChainIdType,
        serializedTransaction: BytesType,
        options: SigningRequestEncodingOptions = {scheme: DEFAULT_SCHEME}
    ) {
        const id = ChainId.from(chainId)
        serializedTransaction = Bytes.from(serializedTransaction)

        const encoder = new ABIEncoder()
        encoder.writeByte(2) // header
        encoder.writeArray(Serializer.encode({object: id.chainVariant}).array)
        encoder.writeByte(2) // transaction variant
        encoder.writeArray(Bytes.from(serializedTransaction).array)
        encoder.writeByte(RequestFlags.broadcast)
        encoder.writeByte(0) // callback
        encoder.writeByte(0) // info

        return SigningRequest.fromData(encoder.getData(), options)
    }

    /** Creates a signing request from encoded `esr:` uri string. */
    public static from(uri: string, options: SigningRequestEncodingOptions = {scheme: DEFAULT_SCHEME}) {
        if (typeof uri !== 'string') {
            throw new Error('Invalid request uri')
        }
        const [scheme, path] = uri.split(':')
        if (
            scheme !== (options.scheme || DEFAULT_SCHEME) &&
            scheme !== `web+${options.scheme || DEFAULT_SCHEME}`
        ) {
            throw new Error('Invalid scheme')
        }
        const data = base64u.decode(path.startsWith('//') ? path.slice(2) : path)
        return SigningRequest.fromData(data, options)
    }

    public static fromData(data: BytesType, options: SigningRequestEncodingOptions = {scheme: DEFAULT_SCHEME}) {
        data = Bytes.from(data)
        const header = data.array[0]
        const version = header & ~(1 << 7)
        if (version !== 2 && version !== 3) {
            throw new Error(`Unsupported protocol version ${version}`)
        }
        let payload = data.droppingFirst(1)
        if ((header & (1 << 7)) !== 0) {
            if (!options.zlib) {
                throw new Error('Compressed URI needs zlib')
            }
            payload = Bytes.from(options.zlib.inflateRaw(payload.array))
        }
        const decoder = new ABIDecoder(payload.array)
        const req = Serializer.decode({data: decoder, type: this.storageType(version)})
        let sig: RequestSignature | undefined
        if (decoder.canRead()) {
            sig = Serializer.decode({data: decoder, type: RequestSignature}) as RequestSignature
        }
        return new SigningRequest(
            version,
            req,
            options.scheme,
            options.zlib,
            options.abiProvider,
            sig
        )
    }

    /** The signing request version. */
    public version: number

    /** The raw signing request data. */
    public data: RequestDataV2 | RequestDataV3

    /** The request signature. */
    public signature?: RequestSignature
    public scheme: SigningRequestEncodingOptions['scheme'] = DEFAULT_SCHEME

    private zlib?: ZlibProvider
    private abiProvider?: AbiProvider

    /**
     * Create a new signing request.
     * Normally not used directly, see the `create` and `from` class methods.
     */
    constructor(
        version: number,
        data: RequestDataV2 | RequestDataV3,
        scheme: SigningRequestEncodingOptions['scheme'],
        zlib?: ZlibProvider,
        abiProvider?: AbiProvider,
        signature?: RequestSignature,
    ) {
        if (data.flags.broadcast && data.req.variantName === 'identity') {
            throw new Error('Invalid request (identity request cannot be broadcast)')
        }

        this.version = version
        this.data = data
        this.zlib = zlib
        this.abiProvider = abiProvider
        this.signature = signature
        this.scheme = scheme || this.scheme
    }

    /**
     * Sign the request, mutating.
     * @param signatureProvider The signature provider that provides a signature for the signer.
     */
    public sign(signatureProvider: SignatureProvider) {
        const message = this.getSignatureDigest()
        this.signature = RequestSignature.from(signatureProvider.sign(message))
    }

    /**
     * Get the signature digest for this request.
     */
    public getSignatureDigest() {
        // protocol version + utf8 "request"
        const prefix = [this.version, 0x72, 0x65, 0x71, 0x75, 0x65, 0x73, 0x74]
        return Checksum256.hash(Bytes.from(prefix).appending(this.getData()))
    }

    /**
     * Set the signature data for this request, mutating.
     * @param signer Account name of signer.
     * @param signature The signature string.
     */
    public setSignature(signer: string, signature: string) {
        this.signature = RequestSignature.from({signer, signature})
    }

    /**
     * Set the request callback, mutating.
     * @param url Where the callback should be sent.
     * @param background Whether the callback should be sent in the background.
     */
    public setCallback(url: string, background: boolean) {
        this.data.callback = url
        this.data.flags.background = background
    }

    /**
     * Set broadcast flag.
     * @param broadcast Whether the transaction should be broadcast by receiver.
     */
    public setBroadcast(broadcast: boolean) {
        this.data.flags.broadcast = broadcast
    }

    /**
     * Encode this request into an `esr:` uri.
     * @argument compress Whether to compress the request data using zlib,
     *                    defaults to true if omitted and zlib is present;
     *                    otherwise false.
     * @argument slashes Whether add slashes after the protocol scheme, i.e. `esr://`.
     *                   Defaults to true.
     * @returns An esr uri string.
     */
    public encode(compress?: boolean, slashes?: boolean): string {
        const shouldCompress = compress !== undefined ? compress : this.zlib !== undefined
        if (shouldCompress && this.zlib === undefined) {
            throw new Error('Need zlib to compress')
        }
        let header = this.version
        const data = this.getData()
        const sigData = this.getSignatureData()
        let array = new Uint8Array(data.byteLength + sigData.byteLength)
        array.set(data, 0)
        array.set(sigData, data.byteLength)
        if (shouldCompress) {
            const deflated = this.zlib!.deflateRaw(array)
            if (array.byteLength > deflated.byteLength) {
                header |= 1 << 7
                array = deflated
            }
        }
        const out = new Uint8Array(1 + array.byteLength)
        out[0] = header
        out.set(array, 1)
        let scheme = `${this.scheme}:`
        if (slashes !== false) {
            scheme += '//'
        }
        return scheme + base64u.encode(out)
    }

    /** Get the request data without header or signature. */
    public getData(): Uint8Array {
        return Serializer.encode({object: this.data}).array
    }

    /** Get signature data, returns an empty array if request is not signed. */
    public getSignatureData(): Uint8Array {
        if (!this.signature) {
            return new Uint8Array(0)
        }
        return Serializer.encode({object: this.signature}).array
    }

    /** ABI definitions required to resolve request. */
    public getRequiredAbis() {
        return this.getRawActions()
            .filter((action) => !isIdentity(action))
            .map((action) => action.account)
            .filter((value, index, self) => self.indexOf(value) === index)
    }

    /** Whether TaPoS values are required to resolve request. */
    public requiresTapos() {
        const tx = this.getRawTransaction()
        return !this.isIdentity() && !hasTapos(tx)
    }

    /** Resolve required ABI definitions. */
    public async fetchAbis(abiProvider?: AbiProvider): Promise<AbiMap> {
        const required = this.getRequiredAbis()
        if (required.length > 0) {
            const provider = abiProvider || this.abiProvider
            if (!provider) {
                throw new Error('Missing ABI provider')
            }
            const abis = new Map<string, any>()
            await Promise.all(
                required.map(async (account) => {
                    abis.set(account.toString(), ABI.from(await provider.getAbi(account)))
                })
            )
            return abis
        } else {
            return new Map()
        }
    }

    /**
     * Decode raw actions actions to object representations.
     * @param abis ABI defenitions required to decode all actions.
     * @param signer Placeholders in actions will be resolved to signer if set.
     */
    public resolveActions(abis: AbiMap, signer?: PermissionLevelType): ResolvedAction[] {
        return this.getRawActions().map((rawAction) => {
            let abi: ABI
            if (isIdentity(rawAction)) {
                abi = (this.constructor as typeof SigningRequest).identityAbi(this.version)
            } else {
                const rawAbi = abis.get(rawAction.account.toString())
                if (!rawAbi) {
                    throw new Error(`Missing ABI definition for ${rawAction.account}`)
                }
                abi = ABI.from(rawAbi)
            }
            const type = abi.getActionType(rawAction.name)
            if (!type) {
                throw new Error(
                    `Missing type for action ${rawAction.account}:${rawAction.name} in ABI`
                )
            }
            let data = rawAction.decodeData(abi) as Record<string, ABISerializable>
            let authorization = rawAction.authorization
            if (signer) {
                const signerPerm = PermissionLevel.from(signer)
                const resolve = (value: any): any => {
                    if (value instanceof Name) {
                        if (value.equals(PlaceholderName)) {
                            return signerPerm.actor
                        } else if (value.equals(PlaceholderPermission)) {
                            return signerPerm.permission
                        } else {
                            return value
                        }
                    } else if (Array.isArray(value)) {
                        return value.map(resolve)
                    } else if (typeof value === 'object' && value !== null) {
                        for (const key of Object.keys(value)) {
                            value[key] = resolve(value[key])
                        }
                        return value
                    } else {
                        return value
                    }
                }
                data = resolve(data)
                authorization = authorization.map((auth) => {
                    let {actor, permission} = auth
                    if (actor.equals(PlaceholderName)) {
                        actor = signerPerm.actor
                    }
                    if (permission.equals(PlaceholderPermission)) {
                        permission = signerPerm.permission
                    }
                    // backwards compatibility, actor placeholder will also resolve to permission when used in auth
                    if (permission.equals(PlaceholderName)) {
                        permission = signerPerm.permission
                    }
                    return PermissionLevel.from({actor, permission})
                })
            }
            return {
                ...rawAction,
                authorization,
                data,
            }
        })
    }

    public resolveTransaction(
        abis: AbiMap,
        signer: PermissionLevelType,
        ctx: TransactionContext = {}
    ) {
        const tx = this.getRawTransaction()
        if (!this.isIdentity() && !hasTapos(tx)) {
            if (
                ctx.expiration !== undefined &&
                ctx.ref_block_num !== undefined &&
                ctx.ref_block_prefix !== undefined
            ) {
                tx.expiration = TimePointSec.from(ctx.expiration)
                tx.ref_block_num = UInt16.from(ctx.ref_block_num)
                tx.ref_block_prefix = UInt32.from(ctx.ref_block_prefix)
            } else if (
                ctx.block_num !== undefined &&
                ctx.ref_block_prefix !== undefined &&
                ctx.timestamp !== undefined
            ) {
                tx.expiration = expirationTime(ctx.timestamp, ctx.expire_seconds)
                tx.ref_block_num = UInt16.from(ctx.block_num)
                tx.ref_block_prefix = UInt32.from(ctx.ref_block_prefix)
            } else {
                throw new Error(
                    'Invalid transaction context, need either a reference block or explicit TaPoS values'
                )
            }
        } else if (this.isIdentity() && this.version > 2) {
            // From ESR version 3 all identity requests have expiration
            tx.expiration = ctx.expiration
                ? TimePointSec.from(ctx.expiration)
                : expirationTime(ctx.timestamp, ctx.expire_seconds)
        }
        const actions = this.resolveActions(abis, signer)
        // TODO: resolve context free actions
        const context_free_actions = (tx.context_free_actions as unknown) as ResolvedAction[]
        return {...tx, context_free_actions, actions} as ResolvedTransaction
    }

    public resolve(abis: AbiMap, signer: PermissionLevelType, ctx: TransactionContext = {}) {
        const tx = this.resolveTransaction(abis, signer, ctx)
        const actions = tx.actions.map((action) => {
            let abi: ABI | undefined
            if (isIdentity(action)) {
                abi = (this.constructor as typeof SigningRequest).identityAbi(this.version)
            } else {
                abi = abis.get(action.account.toString())
            }
            if (!abi) {
                throw new Error(`Missing ABI definition for ${action.account}`)
            }
            const type = abi.getActionType(action.name)!
            const data = Serializer.encode({object: action.data, type, abi})
            return Action.from({...action, data})
        })
        const transaction = Transaction.from({...tx, actions})
        let chainId: ChainId
        if (this.isMultiChain()) {
            if (!ctx.chainId) {
                throw new Error('Missing chosen chain ID for multi-chain request')
            }
            chainId = ChainId.from(ctx.chainId)
            const ids = this.getChainIds()
            if (ids && !ids.some((id) => chainId.equals(id))) {
                throw new Error('Trying to resolve for chain ID not defined in request')
            }
        } else {
            chainId = this.getChainId()
        }
        return new ResolvedSigningRequest(
            this,
            PermissionLevel.from(signer),
            transaction,
            tx,
            chainId
        )
    }

    /**
     * Get Scheme
     * @returns scheme
     */
    public getScheme(): SigningRequestEncodingOptions['scheme'] {
        return this.scheme
    }

    /**
     * Get the id of the chain where this request is valid.
     * @returns The 32-byte chain id as hex encoded string.
     */
    public getChainId(): ChainId {
        return this.data.chain_id.chainId
    }

    /**
     * Chain IDs this request is valid for, only valid for multi chain requests. Value of `null` when `isMultiChain` is true denotes any chain.
     */
    public getChainIds(): ChainId[] | null {
        if (!this.isMultiChain()) {
            return null
        }
        const ids = this.getInfoKey('chain_ids', {type: ChainIdVariant, array: true}) as
            | ChainIdVariant[]
            | undefined
        if (ids) {
            return ids.map((id) => id.chainId)
        }
        return null
    }

    /**
     * Set chain IDs this request is valid for, only considered for multi chain requests.
     */
    public setChainIds(ids: ChainIdType[]) {
        const value = ids.map((id) => ChainId.from(id).chainVariant)
        this.setInfoKey('chain_ids', value, {type: ChainIdVariant, array: true})
    }

    /**
     * True if chainId is set to chain alias `0` which indicates that the request is valid for any chain.
     */
    public isMultiChain(): boolean {
        return (
            this.data.chain_id.variantIdx === 0 &&
            (this.data.chain_id.value as ChainAlias).equals(ChainName.UNKNOWN)
        )
    }

    /** Return the actions in this request with action data encoded. */
    public getRawActions(): Action[] {
        const req = this.data.req
        switch (req.variantName) {
            case 'action':
                return [req.value as Action]
            case 'action[]':
                return req.value as Action[]
            case 'identity': {
                if (this.version === 2) {
                    const id = req.value as IdentityV2
                    let data: BytesType = '0101000000000000000200000000000000' // placeholder permission
                    let authorization: PermissionLevelType[] = [PlaceholderAuth]
                    if (id.permission) {
                        data = Serializer.encode({object: id})
                        authorization = [id.permission]
                    }
                    return [
                        Action.from({
                            account: '',
                            name: 'identity',
                            authorization,
                            data,
                        }),
                    ]
                } else {
                    // eslint-disable-next-line prefer-const
                    let {
                        // scope,
                        permission
                    } = req.value as IdentityV3
                    if (!permission) {
                        permission = PlaceholderAuth
                    }
                    const data = Serializer.encode({object: {
                        // scope,
                        permission
                    }, type: IdentityV3})
                    return [
                        Action.from({
                            account: '',
                            name: 'identity',
                            authorization: [permission],
                            data,
                        }),
                    ]
                }
            }
            case 'transaction':
                return (req.value as Transaction).actions
            default:
                throw new Error('Invalid signing request data')
        }
    }

    /** Unresolved transaction. */
    public getRawTransaction(): Transaction {
        const req = this.data.req
        switch (req.variantName) {
            case 'transaction':
                return Transaction.from({...(req.value as Transaction)})
            case 'action':
            case 'action[]':
            case 'identity':
                return Transaction.from({
                    actions: this.getRawActions(),
                    context_free_actions: [],
                    transaction_extensions: [],
                    expiration: '1970-01-01T00:00:00.000',
                    ref_block_num: 0,
                    ref_block_prefix: 0,
                    max_cpu_usage_ms: 0,
                    max_net_usage_words: 0,
                    delay_sec: 0,
                })
            default:
                throw new Error('Invalid signing request data')
        }
    }

    /** Whether the request is an identity request. */
    public isIdentity(): boolean {
        return this.data.req.variantName === 'identity'
    }

    /** Whether the request should be broadcast by signer. */
    public shouldBroadcast(): boolean {
        if (this.isIdentity()) {
            return false
        }
        return this.data.flags.broadcast
    }

    /**
     * Present if the request is an identity request and requests a specific account.
     * @note This returns `nil` unless a specific identity has been requested,
     *       use `isIdentity` to check id requests.
     */
    public getIdentity(): Name | null {
        if (!this.isIdentity()) {
            return null
        }
        const id = this.data.req.value as IdentityV2
        if (id.permission && !id.permission.actor.equals(PlaceholderName)) {
            return id.permission.actor
        }
        return null
    }

    /**
     * Present if the request is an identity request and requests a specific permission.
     * @note This returns `nil` unless a specific permission has been requested,
     *       use `isIdentity` to check id requests.
     */
    public getIdentityPermission(): Name | null {
        if (!this.isIdentity()) {
            return null
        }
        const id = this.data.req.value as IdentityV2
        if (id.permission && !id.permission.permission.equals(PlaceholderPermission)) {
            return id.permission.permission
        }
        return null
    }

    /**
     * Present if the request is an identity request and requests a specific permission.
     * @note This returns `nil` unless a specific permission has been requested,
     *       use `isIdentity` to check id requests.
     */
    // public getIdentityScope(): Name | null {
    //     if (!this.isIdentity() || this.version <= 2) {
    //         return null
    //     }
    //     const id = this.data.req.value as IdentityV3
    //     return id.scope
    // }

    /** Get raw info dict */
    public getRawInfo(): {[key: string]: Bytes} {
        const rv: {[key: string]: Bytes} = {}
        for (const {key, value} of this.data.info) {
            rv[key] = value
        }
        return rv
    }

    public getRawInfoKey(key: string) {
        const pair = this.data.info.find((pair) => pair.key === key)
        if (pair) {
            return pair.value
        }
    }

    public setRawInfoKey(key: string, value: BytesType) {
        let pair = this.data.info.find((pair) => pair.key === key)
        if (!pair) {
            pair = InfoPair.from({key, value})
            this.data.info.push(pair)
        } else {
            pair.value = Bytes.from(value)
        }
    }

    /** Set a metadata key. */
    public setInfoKey(key: string, object: ABISerializable, type?: ABISerializableType) {
        let data: Bytes
        if (typeof object === 'string' && !type) {
            // match old behavior where strings encode to raw utf8 as opposed to
            // eosio-abi encoded strings (varuint32 length prefix + utf8 bytes)
            data = Bytes.from(object, 'utf8')
        } else {
            data = Serializer.encode({object, type})
        }
        this.setRawInfoKey(key, data)
    }

    /** Get a metadata key. */
    public getInfoKey(key: string): string
    public getInfoKey<T extends ABISerializableConstructor>(key: string, type: T): InstanceType<T>
    public getInfoKey(key: string, type: ABISerializableType): any
    public getInfoKey(key: string, type?: ABISerializableType): any {
        const data = this.getRawInfoKey(key)
        if (data) {
            if (type) {
                return Serializer.decode({data, type})
            } else {
                // assume utf8 string if no type is given
                return data.utf8String
            }
        }
    }

    /** Return a deep copy of this request. */
    public clone(): SigningRequest {
        let signature: RequestSignature | undefined
        if (this.signature) {
            signature = RequestSignature.from(JSON.parse(JSON.stringify(this.signature)))
        }
        const RequestData = (this.constructor as typeof SigningRequest).storageType(this.version)
        const data = RequestData.from(JSON.parse(JSON.stringify(this.data)))
        return new SigningRequest(
            this.version,
            data,
            this.scheme,
            this.zlib,
            this.abiProvider,
            signature,
        )
    }

    // Convenience methods.

    public toString() {
        return this.encode()
    }

    public toJSON() {
        return this.encode()
    }
}

export class ResolvedSigningRequest {
    /** Recreate a resolved request from a callback payload. */
    static async fromPayload(
        payload: CallbackPayload,
        options: SigningRequestEncodingOptions = {scheme: DEFAULT_SCHEME}
    ): Promise<ResolvedSigningRequest> {
        const request = SigningRequest.from(payload.req, options)
        const abis = await request.fetchAbis()
        return request.resolve(
            abis,
            {actor: payload.sa, permission: payload.sp},
            {
                ref_block_num: payload.rbn,
                ref_block_prefix: payload.rid,
                expiration: payload.ex,
                chainId: payload.cid || request.getChainId(),
            }
        )
    }

    /** The request that created the transaction. */
    public readonly request: SigningRequest
    /** Expected signer of transaction. */
    public readonly signer: PermissionLevel
    /** Transaction object with action data encoded. */
    public readonly transaction: Transaction
    /** Transaction object with action data decoded. */
    public readonly resolvedTransaction: ResolvedTransaction
    /** Id of chain where the request was resolved. */
    public readonly chainId: ChainId

    constructor(
        request: SigningRequest,
        signer: PermissionLevel,
        transaction: Transaction,
        resolvedTransaction: ResolvedTransaction,
        chainId: ChainId
    ) {
        this.request = request
        this.signer = signer
        this.transaction = transaction
        this.resolvedTransaction = resolvedTransaction
        this.chainId = chainId
    }

    public get serializedTransaction(): Uint8Array {
        return Serializer.encode({object: this.transaction}).array
    }

    public get signingDigest(): Checksum256 {
        return this.transaction.signingDigest(this.chainId)
    }

    public getCallback(
        signatures: SignatureType[],
        blockNum?: UInt32Type
    ): ResolvedCallback | null {
        const {callback, flags} = this.request.data
        if (!callback || callback.length === 0) {
            return null
        }
        if (!signatures || signatures.length === 0) {
            throw new Error('Must have at least one signature to resolve callback')
        }
        const sigs = signatures.map((sig) => Signature.from(sig))
        const payload: CallbackPayload = {
            sig: String(sigs[0]),
            tx: String(this.transaction.id),
            rbn: String(this.transaction.ref_block_num),
            rid: String(this.transaction.ref_block_prefix),
            ex: String(this.transaction.expiration),
            req: this.request.encode(),
            sa: String(this.signer.actor),
            sp: String(this.signer.permission),
            cid: String(this.chainId),
        }
        for (const [n, sig] of sigs.slice(1).entries()) {
            payload[`sig${n}`] = String(sig)
        }
        if (blockNum) {
            payload.bn = String(UInt32.from(blockNum))
        }
        const url = callback.replace(/({{([a-z0-9]+)}})/g, (_1, _2, m) => {
            return payload[m] || ''
        })
        return {
            background: flags.background,
            payload,
            url,
        }
    }

    public getIdentityProof(signature: SignatureType) {
        if (!this.request.isIdentity()) {
            throw new Error('Not a identity request')
        }
        return IdentityProof.from({
            chainId: this.chainId,
            // scope: this.request.getIdentityScope()!,
            expiration: this.transaction.expiration,
            signer: this.signer,
            signature,
        })
    }
}

function encodeAction(action: AnyAction, abis: Record<string, ABIDef>): Action {
    if (Bytes.isBytes(action.data) || (action.data.constructor as any).abiName !== undefined) {
        return Action.from(action)
    }
    const abi = abis[String(Name.from(action.account))]
    if (!abi) {
        throw new Error(`Missing ABI for ${action.account}`)
    }
    return Action.from(action, abi)
}

function isIdentity(action: AnyAction) {
    const account = Name.from(action.account)
    const name = Name.from(action.name)
    return account.rawValue.equals(0) && name.equals('identity')
}

function hasTapos(tx: Transaction) {
    return !(tx.expiration.equals(0) && tx.ref_block_num.equals(0) && tx.ref_block_prefix.equals(0))
}

function expirationTime(timestamp?: TimePointType, expireSeconds: UInt32Type = 60) {
    const ts = TimePointSec.from(timestamp || new Date())
    const exp = UInt32.from(expireSeconds)
    return TimePointSec.fromInteger(ts.value.adding(exp))
}
