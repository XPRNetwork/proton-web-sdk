import ProtonRNSDK, {ProtonLink} from '@proton/react-native-sdk';
import type {LinkSession} from '@proton/react-native-sdk';

class ProtonSDK {
  chainId;
  endpoints;
  requestAccount;
  session: LinkSession | null | undefined;
  link: ProtonLink | null;

  constructor() {
    this.chainId =
      '71ee83bcf52142d61019d95f9cc5427ba6a0d7ff8accd9e2088ae2abeaf3d3dd';
    this.endpoints = ['https://testnet.protonchain.com']; // Multiple for fault tolerance
    this.requestAccount = 'taskly'; // optional
    this.session = null;
    this.link = null;
  }

  login = async () => {
    const {session, link} = await ProtonRNSDK({
      linkOptions: {
        chainId: this.chainId,
        endpoints: this.endpoints,
      },
      transportOptions: {
        requestAccount: this.requestAccount,
        getReturnUrl: () => 'example://main',
      },
    });

    this.link = link;
    this.session = session;

    console.log('Auth: ', this.session?.auth);
  };

  transfer = async () => {
    if (!this.session) {
      return;
    }

    return this.session.transact(
      {
        transaction: {
          actions: [
            {
              account: 'eosio.token',
              name: 'transfer',
              authorization: [this.session.auth],
              data: {
                from: this.session.auth.actor,
                to: 'token.burn',
                quantity: '0.0001 XPR',
                memo: '',
              },
            },
          ],
        } as never,
      },
      {
        broadcast: true,
      },
    );
  };

  logout = async () => {
    if (this.link && this.session) {
      await this.link.removeSession(this.requestAccount, this.session.auth);
      
      this.link = null;
      this.session = undefined;
    }
    
  };
}

export const sdk = new ProtonSDK();
