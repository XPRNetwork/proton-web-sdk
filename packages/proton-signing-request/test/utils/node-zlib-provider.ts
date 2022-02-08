import {deflateRawSync, inflateRawSync} from 'zlib'
import {ZlibProvider} from '../../src'

export default {
    deflateRaw: (data) => {
        return new Uint8Array(deflateRawSync(Buffer.from(data)))
    },
    inflateRaw: (data) => {
        return new Uint8Array(inflateRawSync(Buffer.from(data)))
    },
} as ZlibProvider
