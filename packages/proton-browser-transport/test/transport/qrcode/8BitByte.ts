import mode from './mode'

export default class QR8bitByte {
    data
    mode
    constructor(data: any) {
        this.mode = mode.MODE_8BIT_BYTE
        this.data = data
    }
    getLength() {
        return this.data.length
    }
    write(buffer: {put: (arg0: any, arg1: number) => void}) {
        for (let i = 0; i < this.data.length; i++) {
            // not JIS ...
            buffer.put(this.data.charCodeAt(i), 8)
        }
    }
}
