import {
    Checksum256,
    Checksum256Type,
    isInstanceOf,
    TypeAlias,
    UInt8,
    Variant,
} from '@greymass/eosio'

/** Chain ID aliases. */
export enum ChainName {
    UNKNOWN = 0,
    EOS = 1,
    TELOS = 2,
    JUNGLE = 3,
    KYLIN = 4,
    WORBLI = 5,
    BOS = 6,
    MEETONE = 7,
    INSIGHTS = 8,
    BEOS = 9,
    WAX = 10,
    PROTON = 11,
    FIO = 12,
    PROTON_TEST = 13,
}

export type ChainIdType = ChainId | ChainName | Checksum256Type

@TypeAlias('chain_id')
export class ChainId extends Checksum256 {
    static from(value: ChainIdType): ChainId {
        if (isInstanceOf(value, this)) {
            return value
        }
        if (typeof value === 'number') {
            value = ChainIdLookup.get(value) as Checksum256Type
            if (!value) {
                throw new Error('Unknown chain id alias')
            }
        }
        return super.from(value) as ChainId
    }

    get chainVariant(): ChainIdVariant {
        const name = this.chainName
        // if (name !== ChainName.UNKNOWN) {
        //     return ChainIdVariant.from(['chain_alias', name])
        // }
        return ChainIdVariant.from(this)
    }

    get chainName(): ChainName {
        const cid = this.hexString
        for (const [n, id] of ChainIdLookup) {
            if (id === cid) {
                return n
            }
        }
        return ChainName.UNKNOWN
    }
}

@TypeAlias('chain_alias')
export class ChainAlias extends UInt8 {}

@Variant.type('variant_id', [ChainAlias, ChainId])
export class ChainIdVariant extends Variant {
    value!: ChainId | ChainAlias

    get chainId(): ChainId {
        if (isInstanceOf(this.value, ChainId)) {
            return this.value
        }
        return ChainId.from(Number(this.value.value))
    }
}

const ChainIdLookup = new Map<ChainName, Checksum256Type>([
    [ChainName.EOS, 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906'],
    [ChainName.TELOS, '4667b205c6838ef70ff7988f6e8257e8be0e1284a2f59699054a018f743b1d11'],
    [ChainName.JUNGLE, 'e70aaab8997e1dfce58fbfac80cbbb8fecec7b99cf982a9444273cbc64c41473'],
    [ChainName.KYLIN, '5fff1dae8dc8e2fc4d5b23b2c7665c97f9e9d8edf2b6485a86ba311c25639191'],
    [ChainName.WORBLI, '73647cde120091e0a4b85bced2f3cfdb3041e266cbbe95cee59b73235a1b3b6f'],
    [ChainName.BOS, 'd5a3d18fbb3c084e3b1f3fa98c21014b5f3db536cc15d08f9f6479517c6a3d86'],
    [ChainName.MEETONE, 'cfe6486a83bad4962f232d48003b1824ab5665c36778141034d75e57b956e422'],
    [ChainName.INSIGHTS, 'b042025541e25a472bffde2d62edd457b7e70cee943412b1ea0f044f88591664'],
    [ChainName.BEOS, 'b912d19a6abd2b1b05611ae5be473355d64d95aeff0c09bedc8c166cd6468fe4'],
    [ChainName.WAX, '1064487b3cd1a897ce03ae5b6a865651747e2e152090f99c1d19d44e01aea5a4'],
    [ChainName.PROTON, '384da888112027f0321850a169f737c33e53b388aad48b5adace4bab97f437e0'],
    [ChainName.FIO, '21dcae42c0182200e93f954a074011f9048a7624c6fe81d3c9541a614a88bd1c'],
    [ChainName.PROTON_TEST, '71ee83bcf52142d61019d95f9cc5427ba6a0d7ff8accd9e2088ae2abeaf3d3dd'],
])
