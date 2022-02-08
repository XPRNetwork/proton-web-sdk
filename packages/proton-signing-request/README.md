# proton-signing-request (PSR - Revision 3)
![version](https://badgen.net/npm/v/@proton/signing-request?style=for-the-badge)
![license](https://badgen.net/npm/license/@proton/signing-request?style=for-the-badge)
![downloads](https://badgen.net/npm/dw/@proton/signing-request?style=for-the-badge)

A library to assist with the Proton Signing Request (PSR) protocol.

The PSR protocol allows for an application (dapp) to generate signature requests (transactions) which can then be passed to signers (wallets) for signature creation. These signature requests can be used within URI links, QR Codes, or other transports between applications and signers.

---

## Installation

To install via the package manager of your choice:

#### NPM

```npm install @proton/signing-request```

#### Yarn

```yarn add @proton/signing-request```

---

## Signing Request Flow

In an environment where an ***application/dapp*** is requesting that an end user perform a transaction within their preferred ***signer/wallet***, each of these applications will utilize the `@proton/signing-request` library to fulfill different roles.

- The ***application/dapp*** will be creating and encoding the signing request.
- The ***signer/wallet*** will be decoding and resolving the signing request.

The specification itself then allows either the ***signer/wallet*** itself to broadcast the finalized transaction, or the transaction/signature themselves can be passed back to the ***application/dapp*** to broadcast.

The `@proton/signing-request` library is not responsible for transporting this information between the ***application/dapp***
and ***signer/wallet***, and so this topic will not be covered in this README.

---

#### Sample Transaction/Actions

To create a signing request, the first piece of data we need is either an EOSIO transaction or action(s). For all examples in this README we will use the `eosio:voteproducer` action to set a proxy of `greymassvote`.

The actions are as follows:

```js
const actions = [{
    account: 'eosio',
    name: 'voteproducer',
    authorization: [{
      actor: 'taskly',
      permission: 'active'
    }],
    data: {
        voter: 'taskle',
        proxy: 'cafe',
        producers: [],
    }
}]
```

Two things to note:

1. The `actor` and `voter` fields contain a placeholder which resolves to the signers account name (`............1`).
2. The `permission` fields contain a placeholder which resolves to the signers account permission (`............2`).

These are optional parameters that can be passed anywhere within the `authorization` or `data` fields. If the application already knows who the end user is, the application can bypass the use of placeholders and specify that data directly.

#### Signing Request Options

Many of the `SigningRequest` method calls below will reference an `opts` parameter, which is a set of options that tell the signing request how to perform various tasks. For these examples, we will be using the following `opts` value.

```js
const opts = {
    // string encoder
    textEncoder,
    // string decoder
    textDecoder,
    // zlib string compression (optional, recommended)
    zlib: {
        deflateRaw: (data) => new Uint8Array(zlib.deflateRawSync(Buffer.from(data))),
        inflateRaw: (data) => new Uint8Array(zlib.inflateRawSync(Buffer.from(data))),
    },
    // Customizable ABI Provider used to retrieve contract data
    abiProvider: {
        getAbi: async (account) => (await eos.getAbi(account))
    }
}
```

### Creating a Signing Request

With the above actions established, to create the signing request itself we use the @proton/signing-request library and its `create` method. 

(ES8 or TypeScript)
```js
const request = await SigningRequest.create({ actions }, opts)
console.log(request)
```

(ES6)
```js
SigningRequest.create({ actions }, opts).then((request) => {
  console.log(request)
})
```

This call will return an instance of a `SigningRequest`

```js
SigningRequest {
  version: 2,
  data: {
    req: [
      'action',
      {
        account: 'eosio',
        name: 'voteproducer',
        authorization: [ { actor: '............1', permission: '............2' } ],
        data: '0100000000000000A032DD181BE9D56500'
      }
    ],
    chain_id: [ 'chain_alias', 1 ],
    flags: 1,
    callback: '',
    info: []
  }
}
```

### Encoding a Signing Request

With an instance of a `SigningRequest` available, we can now call the `encode` method on it in order to generate a compressed payload to transport to a signing application.

```js
const encoded = request.encode()
```

This `encoded` variable will now contain a string we can either pass directly to the signer via URI, QRCode or any other method.  The string itself is:

```
esr://gmNgZGRkAIFXBqEFopc6760yugsVYWBggtKCMIEFRnclpF9eTWUACgAA
```

These encoded strings can be shared and viewed by a number of applications, including:

**EOSIO.to**

This website is a utility which allows the viewing of a signing request as well as the opportunity to create a signature for it.  The above encoded request can be passed to the eosio.to domain:

https://eosio.to/gmNgZGRkAIFXBqEFopc6760yugsVYWBggtKCMIEFRnclpF9eTWUACgAA

**EOSIO URI Builder**

This web application allows for the viewing, editing, and customization of signing requests. The above encoded request can be passed to the builder via a URL parameter:

https://greymass.github.io/eosio-uri-builder/gmNgZGRkAIFXBqEFopc6760yugsVYWBggtKCMIEFRnclpF9eTWUACgAA

### Decoding a Signing Request

Using the encoded signing request generated in the example above:

```js
const uri = 'esr://gmNgZGRkAIFXBqEFopc6760yugsVYWBggtKCMIEFRnclpF9eTWUACgAA'
```

Another application can now decode this request into an instance of a `SigningRequest` with the `from` method. 
```js
const decoded = SigningRequest.from(uri, opts)
```

Decoding the signing request will return the same instance as when it was originally created, as follows:

```js
SigningRequest {
  version: 2,
  data: {
    chain_id: [ 'chain_alias', 1 ],
    req: [
      'action[]',
      [
        {
          account: 'eosio',
          name: 'voteproducer',
          authorization: [ { actor: '............1', permission: '............2' } ],
          data: '0100000000000000A032DD181BE9D56500'
        }
      ]
    ],
    flags: 1,
    callback: '',
    info: []
  },
  textEncoder: TextEncoder { encoding: 'utf-8' },
  textDecoder: TextDecoder { encoding: 'utf-8', fatal: false, ignoreBOM: false },
  zlib: {
    deflateRaw: [Function: deflateRaw],
    inflateRaw: [Function: inflateRaw]
  },
  abiProvider: { getAbi: [AsyncFunction: getAbi] },
  signature: undefined
}
```

This `SigningRequest` can then be used within signing applications to start interacting with the request itself.

### Resolving a Signing Request

With an instance of a `SigningRequest` available, a signing application can now resolve the specific request into a transaction. The resolving step does a few things:

- Generates a transaction with valid TAPOS values.
- Templates the transaction, removing any placeholders and resolving it to be used by a specific end user.
- Serializes the transaction for use within the signer.

This step now requires that the application understand who the user is, and have access to the blockchain itself to retrieve TAPOS values. 

```js
// An encoded eosio:voteproducer transaction
const uri = 'esr://gmNgZGRkAIFXBqEFopc6760yugsVYWBggtKCMIEFRnclpF9eTWUACgAA'

// Decode the URI
const decoded = SigningRequest.from(uri, opts)

// In order to resolve the transaction, we need a recent block
const head = (await rpc.get_info(true)).head_block_num;
const block = await rpc.get_block(head);

// Fetch the ABIs needed for decoding
const abis = await decoded.fetchAbis();

// An authorization to resolve the transaction to
const authorization = {
    actor: 'teamgreymass',
    permission: 'active',
}

// Resolve the transaction as a specific user
const resolved = await decoded.resolve(abis, authorization, block);
```

The `resolve` method will return an instance of a `ResolvedSigningRequest`, which contains:

- The original `SigningRequest` as `request`.
- The `signer` that was used to template the transaction.
- The `transaction` which has been templated and is ready to use.
- The transaction already serialized as `serializedTransaction`.

Below is the representation of an instance of this object.

```js
ResolvedSigningRequest {
  request: SigningRequest {
    version: 2,
    data: {
      chain_id: [ 'chain_alias', 1 ],
      req: [
        'action[]',
        [
          {
            account: 'eosio',
            name: 'voteproducer',
            authorization: [ { actor: '............1', permission: '............2' } ],
            data: '0100000000000000A032DD181BE9D56500'
          }
        ]
      ],
      flags: 1,
      callback: '',
      info: []
    },
    textEncoder: TextEncoder { encoding: 'utf-8' },
    textDecoder: TextDecoder { encoding: 'utf-8', fatal: false, ignoreBOM: false },
    zlib: {
      deflateRaw: [Function: deflateRaw],
      inflateRaw: [Function: inflateRaw]
    },
    abiProvider: { getAbi: [AsyncFunction: getAbi] },
    signature: undefined
  },
  signer: { actor: 'teamgreymass', permission: 'active' },
  transaction: {
    actions: [
      {
        account: 'eosio',
        name: 'voteproducer',
        authorization: [ { actor: 'teamgreymass', permission: 'active' } ],
        data: { voter: 'teamgreymass', proxy: 'greymassvote', producers: [] }
      }
    ],
    context_free_actions: [],
    transaction_extensions: [],
    expiration: '2020-01-08T18:44:57.000',
    ref_block_num: 1423,
    ref_block_prefix: 4278398322,
    max_cpu_usage_ms: 0,
    max_net_usage_words: 0,
    delay_sec: 0
  },
  serializedTransaction: Uint8Array [
    41,  35,  22,  94, 143,  5, 114,  45,   3, 255,   0,   0,
     0,   0,   1,   0,   0,  0,   0,   0, 234,  48,  85, 112,
    21, 210, 137, 222, 170, 50, 221,   1, 128, 177, 145,  94,
    93,  38, 141, 202,   0,  0,   0,   0, 168, 237,  50,  50,
    17, 128, 177, 145,  94, 93,  38, 141, 202, 160,  50, 221,
    24,  27, 233, 213, 101,  0,   0
  ]
}
```

The `transaction` or `serializedTransaction` can now be used within any signature provider to generate a signature for this transaction, and ultimately broadcast the signed transaction to the blockchain.

### Further Usage

This README will be updated further to provide more usage as time progresses. The library itself already supports sessions, identities, callbacks, signature generation, and more. It will just take time to properly document every use case.

### Developer Chat

We have a telegram channel dedicated to the development of this protocol which you can find here:

https://t.me/eosio_signing_request
