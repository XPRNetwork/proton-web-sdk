import {
    Action,
    Authority,
    AuthorityType,
    isInstanceOf,
    Name,
    NameType,
    PermissionLevel,
    PermissionLevelType,
    PublicKey,
    Serializer,
    Signature,
    SignatureType,
    Struct,
    TimePointSec,
    TimePointType,
    Transaction,
} from '@greymass/eosio'

import {IdentityV3} from './abi'
import {ChainId, ChainIdType} from './chain-id'
import {CallbackPayload, DEFAULT_SCHEME, SigningRequest, SigningRequestEncodingOptions} from './signing-request'
import * as Base64u from './base64u'

export type IdentityProofType =
    | IdentityProof
    | string
    | {
          chainId: ChainIdType
        //   scope: NameType
          expiration: TimePointType
          signer: PermissionLevelType
          signature: SignatureType
      }

@Struct.type('identity_proof')
export class IdentityProof extends Struct {
    @Struct.field(ChainId) chainId!: ChainId
    // @Struct.field(Name) scope!: Name
    @Struct.field(TimePointSec) expiration!: TimePointSec
    @Struct.field(PermissionLevel) signer!: PermissionLevel
    @Struct.field(Signature) signature!: Signature

    static from(value: IdentityProofType): IdentityProof {
        if (isInstanceOf(value, IdentityProof)) {
            return value
        } else if (typeof value === 'string') {
            return IdentityProof.fromString(value)
        } else {
            return super.from(value) as IdentityProof
        }
    }

    /**
     * Create a new instance from an EOSIO authorization header string.
     * "EOSIO <base64payload>"
     */
    static fromString(string: string) {
        const parts = string.split(' ')
        if (parts.length !== 2 || parts[0] !== 'EOSIO') {
            throw new Error('Invalid IdentityProof string')
        }
        const data = Base64u.decode(parts[1])
        return Serializer.decode({data, type: IdentityProof})
    }

    /** Create a new instance from a callback payload. */
    static fromPayload(payload: CallbackPayload, options: SigningRequestEncodingOptions = {scheme: DEFAULT_SCHEME}) {
        const request = SigningRequest.from(payload.req, options)
        if (!(request.version >= 3 && request.isIdentity())) {
            throw new Error('Not an identity request')
        }
        return this.from({
            chainId: payload.cid || request.getChainId(),
            // scope: request.getIdentityScope()!,
            expiration: payload.ex,
            signer: {actor: payload.sa, permission: payload.sp},
            signature: payload.sig,
        })
    }

    /**
     * Transaction this proof resolves to.
     * @internal
     */
    get transaction(): Transaction {
        const action = Action.from({
            account: '',
            name: 'identity',
            authorization: [this.signer],
            data: IdentityV3.from({
                // scope: this.scope,
                permission: this.signer
            }),
        })
        return Transaction.from({
            ref_block_num: 0,
            ref_block_prefix: 0,
            expiration: this.expiration,
            actions: [action],
        })
    }

    /**
     * Recover the public key that signed this proof.
     */
    recover(): PublicKey {
        return this.signature.recoverDigest(this.transaction.signingDigest(this.chainId))
    }

    /**
     * Verify that given authority signed this proof.
     * @param auth The accounts signing authority.
     * @param currentTime Time to verify expiry against, if unset will use system time.
     */
    verify(auth: AuthorityType, currentTime?: TimePointType) {
        const now = TimePointSec.from(currentTime || new Date()).toMilliseconds()
        return (
            now < this.expiration.toMilliseconds() &&
            Authority.from(auth).hasPermission(this.recover())
        )
    }

    /**
     * Encode the proof to an `EOSIO` auth header string.
     */
    toString() {
        const data = Serializer.encode({object: this})
        return `EOSIO ${Base64u.encode(data.array, false)}`
    }
}
