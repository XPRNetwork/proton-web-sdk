import 'react-native-get-random-values'
import { Buffer } from 'buffer'
import { TextDecoder, TextEncoder } from 'text-encoding-shim'

global.Buffer = Buffer
global.TextDecoder = TextDecoder;
(global as any).TextEncoder = TextEncoder

if (typeof global.crypto !== 'object') {
    (global as any).crypto = {}
}