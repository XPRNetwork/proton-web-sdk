import math from './math'

export default class QRPolynomial {
    num: number[]
    constructor(num, shift) {
        if (num.length == undefined) {
            throw new Error(num.length + '/' + shift)
        }

        let offset = 0

        while (offset < num.length && num[offset] == 0) {
            offset++
        }

        this.num = new Array(num.length - offset + shift)
        for (let i = 0; i < num.length - offset; i++) {
            this.num[i] = num[i + offset]
        }
    }

    get(index: string | number) {
        return this.num[index]
    }

    getLength() {
        return this.num.length
    }

    multiply(e: {getLength: () => number; get: (arg0: number) => any}) {
        const num = new Array(this.getLength() + e.getLength() - 1)

        for (let i = 0; i < this.getLength(); i++) {
            for (let j = 0; j < e.getLength(); j++) {
                num[i + j] ^= math.gexp(math.glog(this.get(i)) + math.glog(e.get(j)))
            }
        }

        return new QRPolynomial(num, 0)
    }

    mod(e: {getLength: () => number; get: (arg0: number) => any}) {
        if (this.getLength() - e.getLength() < 0) {
            return this
        }

        const ratio = math.glog(this.get(0)) - math.glog(e.get(0))

        const num = new Array(this.getLength())

        for (let i = 0; i < this.getLength(); i++) {
            num[i] = this.get(i)
        }

        for (let i = 0; i < e.getLength(); i++) {
            num[i] ^= math.gexp(math.glog(e.get(i)) + ratio)
        }

        // recursive call
        return new QRPolynomial(num, 0).mod(e)
    }
}
