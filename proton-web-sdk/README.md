# Proton Web SDK

Installation
```
npm i @proton/web-sdk
yarn add @proton/web-sdk
```

Full Documentation:
https://docs.protonchain.com/sdk/proton-web-sdk

Usage
```javascript
import { ConnectWallet } from '@proton/web-sdk'

// Constants
const appIdentifier = 'taskly'

// Pop up modal
const link = await ConnectWallet({
    linkOptions: {
        endpoints: ['https://proton.greymass.com'],
        // rpc: rpc /* Optional: if you wish to provide rpc directly instead of endpoints */
    },
    transportOptions: {
        requestAccount: 'myprotonacc', /* Optional: Your proton account */
        requestStatus: true, /* Optional: Display request success and error messages, Default true */
    },
    selectorOptions: {
        appName: 'Taskly', /* Optional: Name to show in modal, Default 'app' */
        appLogo: 'https://protondemos.com/static/media/taskly-logo.ad0bfb0f.svg', /* Optional: Logo to show in modal */
        customStyleOptions: { /* Optional: Custom style options for modal */
            modalBackgroundColor: '#F4F7FA',
            logoBackgroundColor: 'white',
            isLogoRound: true,
            optionBackgroundColor: 'white',
            optionFontColor: 'black',
            primaryFontColor: 'black',
            secondaryFontColor: '#6B727F',
            linkColor: '#752EEB'
        }
        // walletType: 'proton' /* Optional: Connect to only specified wallet (e.g. 'proton', 'anchor') */
    }
})

//Login
  const { link, session } = await ConnectWallet({
    linkOptions: { chainId: this.chainId, endpoints: this.endpoints },
    transportOptions: { requestAccount: this.requestAccount, backButton: true },
    selectorOptions: { appName: this.appName, appLogo: appLogo}
  });
  this.link = link;
  this.session = session;
  return { auth: session.auth, accountData: session.accountData[0] };

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
                to: 'syed',
                quantity: '0.000001 XUSDT',
                memo: 'Tip!'
            },
            authorization: [session.auth]
        }]
    },
    broadcast: true
})
console.log('Transaction ID', result.processed.id)

// Restore session after refresh (must recreate link first with restoreSession as true)
const { link, session } = await ConnectWallet({
    linkOptions: { chainId: this.chainId, endpoints: this.endpoints, restoreSession: true},
    transportOptions: { requestAccount: this.requestAccount },
    selectorOptions: { appName: this.appName, appLogo: appLogo}
  });
  this.link = link;
  this.session = session;
      
// Logout
await link.removeSession(appIdentifier, session.auth)
session = undefined
```