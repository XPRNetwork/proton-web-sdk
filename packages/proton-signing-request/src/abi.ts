/** SigningRequest ABI and typedefs. */

import {
    Action,
    Bytes,
    Name,
    PermissionLevel,
    Signature,
    Struct,
    Transaction,
    TypeAlias,
    UInt8,
    Variant,
} from '@greymass/eosio'

import {ChainIdVariant} from './chain-id'

@TypeAlias('account_name')
export class AccountName extends Name {}

@TypeAlias('permission_name')
export class PermissionName extends Name {}

@Struct.type('identity')
export class IdentityV2 extends Struct {
    @Struct.field(PermissionLevel, {optional: true}) permission?: PermissionLevel
}

@Struct.type('identity')
export class IdentityV3 extends Struct {
    // @Struct.field('name') scope!: Name
    @Struct.field(PermissionLevel, {optional: true}) permission?: PermissionLevel
}

@Variant.type('variant_req', [Action, {type: Action, array: true}, Transaction, IdentityV2])
export class RequestVariantV2 extends Variant {
    value!: Action | Action[] | Transaction | IdentityV2
}

@Variant.type('variant_req', [Action, {type: Action, array: true}, Transaction, IdentityV3])
export class RequestVariantV3 extends Variant {
    value!: Action | Action[] | Transaction | IdentityV3
}

@TypeAlias('request_flags')
export class RequestFlags extends UInt8 {
    static broadcast = 1 << 0
    static background = 1 << 1

    get broadcast() {
        return (Number(this) & RequestFlags.broadcast) !== 0
    }
    set broadcast(enabled: boolean) {
        this.setFlag(RequestFlags.broadcast, enabled)
    }

    get background() {
        return (Number(this) & RequestFlags.background) !== 0
    }
    set background(enabled: boolean) {
        this.setFlag(RequestFlags.background, enabled)
    }

    private setFlag(flag: number, enabled: boolean) {
        if (enabled) {
            // TODO: implement bitwise operators in core, bn.js setbit does not work
            this.value = UInt8.from(Number(this) | flag).value
        } else {
            this.value = UInt8.from(Number(this) & ~flag).value
        }
    }
}

@Struct.type('info_pair')
export class InfoPair extends Struct {
    @Struct.field('string') key!: string
    @Struct.field('bytes') value!: Bytes
}

@Struct.type('signing_request')
export class RequestDataV2 extends Struct {
    @Struct.field(ChainIdVariant) chain_id!: ChainIdVariant
    @Struct.field(RequestVariantV2) req!: RequestVariantV2
    @Struct.field(RequestFlags) flags!: RequestFlags
    @Struct.field('string') callback!: string
    @Struct.field(InfoPair, {array: true}) info!: InfoPair[]
}

@Struct.type('signing_request')
export class RequestDataV3 extends Struct {
    @Struct.field(ChainIdVariant) chain_id!: ChainIdVariant
    @Struct.field(RequestVariantV3) req!: RequestVariantV3
    @Struct.field(RequestFlags) flags!: RequestFlags
    @Struct.field('string') callback!: string
    @Struct.field(InfoPair, {array: true}) info!: InfoPair[]
}

@Struct.type('request_signature')
export class RequestSignature extends Struct {
    @Struct.field('name') signer!: Name
    @Struct.field('signature') signature!: Signature
}
