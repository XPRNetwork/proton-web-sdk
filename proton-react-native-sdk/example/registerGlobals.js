import { TextDecoder, TextEncoder } from 'text-encoding-shim'

global.TextDecoder = TextDecoder;
global.TextEncoder = TextEncoder
