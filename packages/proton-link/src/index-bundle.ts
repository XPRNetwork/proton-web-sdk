import * as pkg from './index'
const ProtonLink = pkg.default
for (const key of Object.keys(pkg)) {
    if (key === 'default') continue
    ProtonLink[key] = pkg[key]
}
export default ProtonLink
