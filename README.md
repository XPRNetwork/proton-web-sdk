# Proton installation guide
​
## Overview
**Proton** is a cryptocurrency public blockchain designed for consumer applications and seamless P2P payments which aims at maximizing payment acceptance speed by using identity verification mechanism.  
  
**Proton Web SDK** – is one of the packages that gives developers the ability to create web applications to interact with Proton wallets. This SDK will facilitate the process of communication between the web application and the Proton wallet. This package allows to send requests to the wallet for user authentication and signatures.
​
## Installation
​
In order to use **Proton Web SDK** in your personal projects you should install it using one of the commands listed below:
​
**Install by executing npm command** 
```
npm i @proton/web-sdk
``` 
**or Install by executing yarn command** 
```
yarn add @proton/web-sdk
``` 
​​
## Usage
​
In order to use **Proton Web SDK,** you should import it into your project by using following command:
```
import ProtonWebSDK from '@proton/web-sdk'
```  
​
A basic SDK initialization looks like:
​
```js 
import ProtonWebSDK from '@proton/web-sdk';
​
const getAvatarImage = () => {
    const avatar = accountData && accountData.avatar
​
    if (avatar) {
      if (avatar.indexOf('/9j/') !== -1) {
        return `data:image/jpeg;base64,${avatar}`
      } else if (avatar.indexOf('iVBORw0KGgo') !== -1) {
        return `data:image/png;base64,${avatar}`
      }
    }
​
    return 'https://bloks.io/img/proton_avatar.png'
}
​
  const updateStatus = () => {
    avatarImage.src = getAvatarImage()
​
    if (session && session.auth) {
      avatarName.textContent = session.auth.actor.toString()
      fromInput.value = session.auth.actor.toString()
      loginButton.style.display = "none"
      avatar.style.display = "block"
    } else {
      avatarName.textContent = ""
      fromInput.value = ""
      loginButton.style.display = "block"
      avatar.style.display = "none"
    }
  }
​
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
​
    updateStatus()
  }
​
  const logout = async () => {
    if (link && session) {
      await link.removeSession(appIdentifier, session.auth, chainId);
    }
    session = undefined;
    link = undefined;
​
    updateStatus()
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
  // Add button listeners
  logoutIcon.addEventListener("click", logout)
  loginButton.addEventListener("click", () => login(false))
  transferButton.addEventListener("click", () => transfer({
    to: toInput.value,
    amount: amountInput.value,
  }))
​
  // Restore on refresh
  login(true)
```
​
### Deep Dive
​
Here is the detailed look at the SDK work process.
​
Class ```ProtonWebSDK``` has three independent blocks which are:  
 - ```linkOptions```
 - ```transportOptions```  
 - ```selectorOptions```
​
All  of  them  have ```type  Object``` property.
​
#### linkOptions
As far as the Proton SDK communicates with a special chain, it is necessary to link it with an SDK instance. This object (linkOptions) is mandatory, and it includes all options for communication process customization.
​
linkOptions includes:
​
 - endpoints – type array – required – an array of endpoints that an SDK will address to.
​
> Only one endpoint is required but if more of them exist, they will be addressed in descending order if previous one is unavailable
​
 - chainId – type string – not required – an Id or a PSR chain name to which the SDK being connected to. If not specified – it is automatically fetched by the JsonRpc from the endpoint provided.
​
 - Storage – type LinkStorage – not required – if not specified, the new Storage is automatically created. In order to customize Storage, you should provide a custom LinkStorage interface with type specifications inside.
​
 - storagePrefix – type string – not required – a custom SDK storage prefix which is prepended to the name of localStorage keys. If not specified, automatically prepends ‘proton-storage’ string.
​
 - restoreSession – type Boolean – not required – if contains ```true``` value, prevents modal from popping up and makes SDK look for saved session value in the Storage. If not specified, automatically contains ```false``` value.
​
> Our SDK is capable to identify whether the developer uses TestNet or MainNet. You can simply use the endpoint you need and SDK will handle all options for you automatically.
​
##### Example
If you add [https://api-dev.protonchain.com/v1/chain/info](https://api-dev.protonchain.com/v1/chain/info) as an endpoint, SDK will switch the scheme variable to the test mode, and all requests will be handled via TestNet.
​
#### transportOptions
transportOptions – is an object which contains all needed data for the client communication. If not specified an empty object will be provided for the SDK.
​
TransportOptions includes:
​
 - requestAccount – type string – not required – this field is used for identifying which account is requesting the client transaction. If no value provided, it will be replaced with the “Unknown Requestor” in the transaction request.
​
 > Most likely, it will be the same as an appName (see below)
​
 - backButton – type Boolean – not required – this field specifies the need of displaying the “back” button in the wallet type selection screen of the modal window. By default - set to ```true```, if set to ```false``` no “back” button will be displayed.
​
#### selectorOptions
selectorOptions – is an object which includes style options for the wallet selection. If not specified the basic styling for the modal window will be provided.
​
selectorOptions includes:
​
 - appName – type string – not required – text which is displayed in the modal window and the name of the app displayed in transaction
​
 - appLogo – type string – not required – image is displayed in the modal window.
​
 - customStyleOptions – type Object – not required – object which can include all styles needed for the wallet selection modal window.  
The ```CustomStyleOptions``` interface located in the ```proton-web-sdk``` directory should be changed in order to customize it.  
(The definition of basic styling is listed below)
​
##### Definition of basic styling – customStyleOptions
​
Basic interface contains several fields which can be overridden by the styles provided by the developer. All  color  types  are  acceptable.  
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
​
 - After repository was cloned successfully, proceed to ```yarn``` and ```lerna``` npm packages global installation by executing following command:  
```
npm i -g yarn lerna
```  
This commands execution may require ```sudo``` rights on Mac OS systems.
​
 - (Under question) – Delete ```react-native-sdk``` package from «packages» directory and ```vue``` package from «examples» directory due to their current inactivity.
​
 - Proceed to main directory, which contains **Proton Web SDK** cloned before, and execute the ```lerna bootstrap``` command.
> This command searches for all ```package.json``` files in directories included in ```lerna.json``` file that’s located at the projects root directory, and manages all dependencies installation as well as required system processes work.
​
 - When execution of ```lerna bootstrap``` command ends successfully – proceed through the installation process by executing ```yarn watch``` command.
​
> This command will initiate project assembly process and watch (auto-update on change) all files located in ```packages``` directory.
​
 - From now on, every change saved in the project will make ```lerna``` package compile new build instance.
​
As soon as you finished all steps listed above, please make an issue in our repository and we will handle your request as soon as possible.
​