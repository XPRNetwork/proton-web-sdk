# Proton Web SDK
## Overview
**Proton** is a cryptocurrency public blockchain designed for consumer applications and seamless P2P payments which aims at maximizing payment acceptance speed by using identity verification mechanism.  
  
**Proton Web SDK** – is one of the packages that gives developers the ability to create web applications to interact with Proton wallets. This SDK will facilitate the process of communication between the web application and the Proton wallet. This package allows to send requests to the wallet for user authentication and signatures.
​
## Installation
​​
**npm** 
```
npm i @proton/web-sdk
``` 
**yarn** 
```
yarn add @proton/web-sdk
``` 
## Usage
### Import:

ES6

```js
import ProtonWebSDK from '@proton/web-sdk'
```  

CommonJS

```js
const ProtonWebSDK = require('@proton/web-sdk')
```

### Initialization:

```js 
import ProtonWebSDK from '@proton/web-sdk';

const login = async (restoreSession) => {
    const { link: localLink, session: localSession } = await ProtonWebSDK({
      linkOptions: {
        endpoints,
        chainId,
        restoreSession,
      },
      transportOptions: {
        requestAccount: appIdentifier
      },
      selectorOptions: {
        appName: "Tasklyy",
        appLogo: "https://taskly.protonchain.com/static/media/taskly-logo.ad0bfb0f.svg",
        customStyleOptions: {
            modalBackgroundColor: "#F4F7FA",
            logoBackgroundColor: "white",
            isLogoRound: true,
            optionBackgroundColor: "white",
            optionFontColor: "black",
            primaryFontColor: "black",
            secondaryFontColor: "#6B727F",
            linkColor: "#752EEB"
        }
      }
    })
​
    link = localLink
    session = localSession
}
​
const logout = async () => {
    if (link && session) {
      await link.removeSession(appIdentifier, session.auth, chainId);
    }
    session = undefined;
    link = undefined;
}
​
const transfer = async ({ to, amount }) => {
    if (!session) {
      throw new Error('No Session');
    }
​
    return await session.transact({
      actions: [{
        /**
         * The token contract, precision and symbol for tokens can be seen at protonscan.io/tokens
         */
​
        // Token contract
        account: "eosio.token",
​
        // Action name
        name: "transfer",
        
        // Action parameters
        data: {
          // Sender
          from: session.auth.actor,
​
          // Receiver
          to: to,
​
          // 4 is precision, XPR is symbol
          quantity: `${(+amount).toFixed(4)} XPR`,
​
          // Optional memo
          memo: ""
        },
        authorization: [session.auth]
      }]
    }, {
      broadcast: true
    })
}
​
// Restore on refresh
login(true)
```
## Options
​
The ```ProtonWebSDK``` Class takes three main types of option objects:
 - ```linkOptions```
 - ```transportOptions```  
 - ```selectorOptions```
​
### Link Options
A required object which includes all options for communication customization.

**linkOptions:**
 - **endpoints** – type array – required – an array of endpoints that an SDK will address to.
​
    > Only one endpoint is required. If more are provided, the SDK will use them as failover targets.

    > The SDK is able to automatically differentiate Mainnet and Testnet from the url


 - **chainId** – type string – optional – an Id or a PSR chain name to which the SDK being connected to. If not specified – it is automatically fetched by the JsonRpc from the endpoint provided.
​
 - **storage** – type LinkStorage – optional – if not specified, the new Storage is automatically created. In order to customize Storage, you should provide a custom LinkStorage interface with type specifications inside.
​
 - **storagePrefix** – type string – optional – a custom SDK storage prefix which is prepended to the name of localStorage keys. If not specified, automatically prepends ‘proton-storage’ string.
​
 - **restoreSession** – type Boolean – optional – if contains ```true``` value, prevents modal from popping up and makes SDK look for saved session value in the Storage. If not specified, automatically contains ```false``` value.
​
##### Example
If you add [https://api-dev.protonchain.com/v1/chain/info](https://api-dev.protonchain.com/v1/chain/info) as an endpoint, SDK will switch the scheme variable to the test mode, and all requests will be handled via Testnet.
​
### Transport Options
An object which contains all needed data for the client communication. If not specified an empty object will be provided for the SDK.

**transportOptions:**
 - **requestAccount** – type string – optional – this field is used for identifying which account is requesting the client transaction. If no value provided, it will be replaced with the “Unknown Requestor” in the transaction request.
​

    > Typically same as appName
​
 - **backButton** – type Boolean – optional – this field specifies the need of displaying the “back” button in the wallet type selection screen of the modal window. By default - set to ```true```, if set to ```false``` no “back” button will be displayed.
​
### Selector Options
An object which includes style options for the wallet selection. If not specified the basic styling for the modal window will be provided.
**selectorOptions:**
 - **appName** – type string – optional – text which is displayed in the modal window and the name of the app displayed in transaction
​
 - **appLogo** – type string – optional – image is displayed in the modal window.

  - **dialogRootNode** - type string | HTMLElement - optional - The Webauth modal parent html node. Can be a valid css selector or a HTMLElement. If not provided the default parent is the ``document.body``
​
 - **customStyleOptions** – type Object – optional – object which can include all styles needed for the wallet selection modal window.  
The ```CustomStyleOptions``` interface located in the ```proton-web-sdk``` directory should be changed in order to customize it.  
​
#### Styling Options Definition of basic styling
​
Basic interface contains several fields which can be overridden by the styles provided by the developer. All  color  types  are  acceptable. 

##### customStyleOptions:
```
modalBackgroundColor: _string_,
logoBackgroundColor: _string_,
isLogoRound: _boolean_,
optionBackgroundColor: _string_,
optionFontColor: _string_,
primaryFontColor: _string_,
secondaryFontColor: _string_,
linkColor: _string_,
```


## Contributors
​
In order to install the **Proton Web SDK** and use it on your local environment for contribution or SDK source code improvement purposes, you should follow a few steps listed below:
​
 - Open the [Proton Web SDK github page](https://github.com/ProtonProtocol/ProtonWeb.git) and clone the repository by using 
``` 
git clone [https://github.com/ProtonProtocol/ProtonWeb.git]
``` 
## Select proper Node version
For now the project uses Node v18.19.1 for development. You can use NVM to switch to this version. The version is set in `.nvmrc` file. Run command `nvm use` in the root folder to activate it.

## Install
```
pnpm i
```
​
## Build

To build all apps and packages, run the following command:
```
pnpm run build
```
## Publish packages
```
pnpm run publish-packages
```