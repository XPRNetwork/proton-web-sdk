import ErrorCorrectLevel from './ErrorCorrectLevel'
import QRCode from './QRCode'

interface Rect {
    x: number
    y: number
    width: number
    height: number
}

/**
 * Generate QR SVG
 * @author Johan Nordberg <code@johan-nordberg.com>
 */
export default function generate(text: string, level: 'L' | 'M' | 'Q' | 'H' = 'L', version = -1) {
    const qr = new QRCode(version, ErrorCorrectLevel[level])
    const rects: Rect[] = []

    qr.addData(text)
    qr.make()

    const rows = qr.modules
    const size = rows.length

    for (const [y, row] of rows.entries()) {
        let rect: Rect | undefined
        for (const [x, on] of row.entries()) {
            if (on) {
                if (!rect) rect = {x, y, width: 0, height: 1}
                rect.width++
            } else {
                if (rect && rect.width > 0) {
                    rects.push(rect)
                }
                rect = undefined
            }
        }
        if (rect && rect.width > 0) {
            rects.push(rect)
        }
    }

    const svg: string[] = [`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">`]
    for (const {x, y, width, height} of rects) {
        svg.push(`<rect x="${x}" y="${y}" width="${width}" height="${height}" />`)
    }
    svg.push('</svg>')

    return svg.join('')
}
