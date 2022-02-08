# Proton Web SDK

Installation
```
npm i @proton/web-sdk
yarn add @proton/web-sdk
```

Usage
```javascript
import ProtonWebSDK from '@proton/web-sdk'

// Constants
const appIdentifier = 'taskly'

// Login
const { link, session } = await ProtonWebSDK({
    linkOptions: {
        /* RPC endpoints */
        endpoints: ['https://proton.greymass.com'],

        /* Recommended: false if first time connecting, true if trying to reconnect */
        restoreSession: false
    },
    transportOptions: {
        /* Recommended: Your proton account */
        requestAccount: appIdentifier,

        /* Optional: Display request success and error messages, Default true */
        requestStatus: true,
    },
    selectorOptions: {
        /* Optional: Name to show in modal, Default 'app' */
        appName: 'Taskly',

        /* Optional: Logo to show in modal */
        appLogo: 'https://protondemos.com/static/media/taskly-logo.ad0bfb0f.svg', 

        /* Optional: Custom style options for modal */
        customStyleOptions: {
            modalBackgroundColor: '#F4F7FA',
            logoBackgroundColor: 'white',
            isLogoRound: true,
            optionBackgroundColor: 'white',
            optionFontColor: 'black',
            primaryFontColor: 'black',
            secondaryFontColor: '#6B727F',
            linkColor: '#752EEB'
        }
    }
})

// Actor and permission
console.log(session.auth.actor) // e.g. "metal"
console.log(session.auth.permission) // e.g. "active"

// Send Transaction
const result = await session.transact({
    transaction: {
        actions: [{
            // Token contract for XUSDT
            account: 'xtokens',

            // Action name
            name: 'transfer',

            // Action parameters
            data: {
                from: session.auth.actor,
                to: 'token.burn',
                quantity: '0.000001 XUSDT',
                memo: 'Tip!'
            },
            authorization: [session.auth]
        }]
    },
}, { broadcast: true })
console.log('Transaction ID', result.processed.id)
      
// Logout
await link.removeSession(appIdentifier, session.auth)
link = undefined
session = undefined
```
