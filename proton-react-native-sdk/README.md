# Proton Web SDK

## Installation

```
yarn add @proton/react-native-sdk react-native-get-random-values @react-native-community/async-storage

cd ios
pod install
```

## Usage

### Initialization

To use `@proton/react-native-sdk` import the class `ConnectWallet`. If you are using typescript, you can import the types `ProtonLink` and `LinkSession`.

```javascript
import {
  ConnectWallet,
  LinkSession,
  ProtonLink,
} from '@proton/react-native-sdk';

class ProtonSDK {
  chainId: string;
  endpoints: string[];
  requestAccount: string;
  session: LinkSession;
  link: ProtonLink;


  constructor() {
    this.chainId =
      '71ee83bcf52142d61019d95f9cc5427ba6a0d7ff8accd9e2088ae2abeaf3d3dd';
    this.endpoints = ['https://testnet.protonchain.com']; // Multiple for fault tolerance
    this.requestAccount = 'taskly'; // optional
    this.session = null;
    this.link = null;
  }
```

### Login

Using the return value from `ConnectWallet`, call the `login` method with the `chainId`, `endpoints`, the `requestAccount` and the `getReturnUrl` function. The `getRetunUrl` function returns the url scheme of the app that the user will be redirected to after an interaction with the Proton App. `ConnectWallet` will return the user session (`LinkSession`) and a link (`ProtonLink`).

```javascript
login = async () => {
  const { session, link } = await ConnectWallet({
    linkOptions: { chainId: this.chainId, endpoints: this.endpoints },
    transportOptions: {
      requestAccount: this.requestAccount,
      getReturnUrl: () => 'taskly://main',
    },
  });

  this.link = link;
  this.session = session;
  return { auth: session.auth };
};
```

This function can be used in code like this:

```
// Usage
const protonSDK = new ProtonSDK();

// usage login()
try {
  const { auth } = await protonSDK.login();
  rootStore.setActor(auth.actor);
  rootStore.setPermission(auth.permission);

  // do something like go to a subscription page
  navigation.navigate('subscription');
} catch (ex) {
  // login failed
  Alert.alert('Error', ex.message);
}
```

Note that login will throw an exception if the user does not authorize the login.

### Transaction

To initiatize a transaction, use the `transact` method of the session object:

```javascript
sendTransaction = async (actions: Action) => {
  return this.session.transact({ actions: actions }, { broadcast: true });
};
```

The following code shows a small example how to send 5 XUSDT to an account:

```javascript
try {
  const actions = [
    {
      account: 'xtokens',
      name: 'transfer',
      authorization: [
        {
          actor: rootStore.actor, // auth.actor that was saved before
          permission: rootStore.permission, // auth.permission that was saved before
        },
      ],
      data: {
        from: rootStore.actor, // auth.actor that was saved before
        to: protonSDK.requestAccount, // the account the transaction is send to
        quantity: '5.000000 XUSDT', // the amount of the transaction
        memo: 'Taskly',
      },
    },
  ];

  const tx = await protonSDK.sendTransaction(actions);

  // navigate to the subscribed page
  navigation.navigate('subscribed');
} catch (ex) {
  // the transaction failed
  Alert.alert('Error', ex.message);
}
```

Please note that if the user does not authorize the transaction, an exception will be thrown.

### Logout

To logout call `removeSession` on the `link` object.

```javascript
logout = async () => {
  await this.link.removeSession(this.requestAccount, this.session.auth);
  this.session = null;
  this.link = null;
};
```

In the application you can use it like this:

```
// usage logout
protonSDK.logout();
navigation.navigate('welcome');
```

### Restore session

To restore a previous session, call the `ConnectWallet` function similar to login, but set the `restoreSession` key as `true` in `linkOptions`.

```javascript
  restoreSession = async () => {
    try {
      const { link, session } = await ConnectWallet({
        linkOptions: {
          chainId: this.chainId,
          endpoints: this.endpoints,
          restoreSession: true,
        },
        transportOptions: {
          requestAccount: this.requestAccount,
          getReturnUrl: () => 'taskly://main',
        },
      });
      this.link = link;
      this.session = session;
      console.log('session', this.session);
      if (session) {
        return {
          auth: this.session.auth
        };
      } else {
        return { auth: { actor: '', permission: '' } };
      }
    } catch (e) {
      return e;
    }
  };
}
```

The code below shows how `restoreSesssion` might be used:

```javascript
try {
  await protonSDK.restoreSession();
} catch (ex) {
  console.warn(ex.message);
}

if (protonSDK.session !== null) {
  console.log('session still exists');
} else {
  console.log('session does not exits anymore');
}
```
