/**
 * Base64u - URL-Safe Base64 variant no padding.
 * Based on https://gist.github.com/jonleighton/958841
 */

const baseCharset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
const lookup = new Uint8Array(256)
for (let i = 0; i < 62; i++) {
    lookup[baseCharset.charCodeAt(i)] = i
}
// support both urlsafe and standard base64
lookup[43] = lookup[45] = 62
lookup[47] = lookup[95] = 63

export function encode(data: Uint8Array, urlSafe = true): string {
    const byteLength = data.byteLength
    const byteRemainder = byteLength % 3
    const mainLength = byteLength - byteRemainder
    const charset = baseCharset + (urlSafe ? '-_' : '+/')
    const parts: string[] = []

    let a: number
    let b: number
    let c: number
    let d: number
    let chunk: number

    // Main loop deals with bytes in chunks of 3
    for (let i = 0; i < mainLength; i += 3) {
        // Combine the three bytes into a single integer
        chunk = (data[i] << 16) | (data[i + 1] << 8) | data[i + 2]

        // Use bitmasks to extract 6-bit segments from the triplet
        a = (chunk & 16515072) >> 18 // 16515072 = (2^6 - 1) << 18
        b = (chunk & 258048) >> 12 // 258048   = (2^6 - 1) << 12
        c = (chunk & 4032) >> 6 // 4032     = (2^6 - 1) << 6
        d = chunk & 63 // 63       =  2^6 - 1

        // Convert the raw binary segments to the appropriate ASCII encoding
        parts.push(charset[a] + charset[b] + charset[c] + charset[d])
    }

    // Deal with the remaining bytes
    if (byteRemainder === 1) {
        chunk = data[mainLength]

        a = (chunk & 252) >> 2 // 252 = (2^6 - 1) << 2

        // Set the 4 least significant bits to zero
        b = (chunk & 3) << 4 // 3   = 2^2 - 1

        parts.push(charset[a] + charset[b])
    } else if (byteRemainder === 2) {
        chunk = (data[mainLength] << 8) | data[mainLength + 1]

        a = (chunk & 64512) >> 10 // 64512 = (2^6 - 1) << 10
        b = (chunk & 1008) >> 4 // 1008  = (2^6 - 1) << 4

        // Set the 2 least significant bits to zero
        c = (chunk & 15) << 2 // 15    = 2^4 - 1

        parts.push(charset[a] + charset[b] + charset[c])
    }

    return parts.join('')
}

export function decode(input: string): Uint8Array {
    const byteLength = input.length * 0.75
    const data = new Uint8Array(byteLength)

    let a: number
    let b: number
    let c: number
    let d: number
    let p = 0

    for (let i = 0; i < input.length; i += 4) {
        a = lookup[input.charCodeAt(i)]
        b = lookup[input.charCodeAt(i + 1)]
        c = lookup[input.charCodeAt(i + 2)]
        d = lookup[input.charCodeAt(i + 3)]

        data[p++] = (a << 2) | (b >> 4)
        data[p++] = ((b & 15) << 4) | (c >> 2)
        data[p++] = ((c & 3) << 6) | (d & 63)
    }

    return data
}
