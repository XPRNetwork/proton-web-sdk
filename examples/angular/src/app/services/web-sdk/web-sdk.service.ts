import { Injectable } from '@angular/core';

import ProtonWebSDK, {
  ProtonWebLink,
  LinkSession,
  TransactResult,
  Link,
} from '@proton/web-sdk';
import { Serialize, JsonRpc, RpcInterfaces } from '@proton/js';

const REQUEST_ACCOUNT = 'taskly';
const CHAIN_ID =
  '384da888112027f0321850a169f737c33e53b388aad48b5adace4bab97f437e0';
const ENDPOINTS = ['https://proton.greymass.com'];

@Injectable({
  providedIn: 'root',
})
export class WebSdkService {
  public session?: LinkSession;
  public link?: ProtonWebLink | Link;

  private rpc = new JsonRpc(ENDPOINTS);

  constructor() {}

  async createLink({
    restoreSession = false,
  }: {
    restoreSession?: boolean;
  }): Promise<void> {
    const { link: localLink, session: localSession } = await ProtonWebSDK({
      linkOptions: {
        endpoints: ENDPOINTS,
        chainId: CHAIN_ID,
        restoreSession,
      },
      transportOptions: {
        requestAccount: REQUEST_ACCOUNT,
        requestStatus: false,
      },
      selectorOptions: {
        appName: 'Taskly',
      },
    });
    this.link = localLink;
    this.session = localSession;
  }

  async login(): Promise<LinkSession | undefined> {
    await this.createLink({ restoreSession: false });
    if (this.session) {
      return this.session;
    } else {
      return undefined;
    }
  }

  async transact(
    actions: Serialize.Action[],
    broadcast: boolean
  ): Promise<TransactResult> {
    if (this.session) {
      return this.session.transact(
        {
          transaction: {
            actions,
          } as never,
        },
        { broadcast }
      );
    } else {
      throw new Error('No Session');
    }
  }

  async logout(): Promise<void> {
    if (this.link && this.session) {
      await this.link.removeSession(
        REQUEST_ACCOUNT,
        this.session.auth,
        CHAIN_ID
      );
    }
    this.session = undefined;
    this.link = undefined;
  }

  async reconnect(): Promise<LinkSession | undefined> {
    if (!this.session) {
      await this.createLink({ restoreSession: true });
    }

    if (this.session) {
      return this.session;
    } else {
      return undefined;
    }
  }

  async transfer({ to, amount }: { to: string; amount: string }) {
    if (!this.session) {
      throw new Error('No Session');
    }

    return await this.session.transact(
      {
        actions: [
          {
            /**
             * The token contract, precision and symbol for tokens can be seen at protonscan.io/tokens
             */

            // Token contract
            account: 'eosio.token',

            // Action name
            name: 'transfer',

            // Action parameters
            data: {
              // Sender
              from: this.session.auth.actor,

              // Receiver
              to: to,

              // 4 is precision, XPR is symbol
              quantity: `${(+amount).toFixed(4)} XPR`,

              // Optional memo
              memo: '',
            },
            authorization: [this.session.auth],
          },
        ],
      },
      {
        broadcast: true,
      }
    );
  }

  async getProtonAvatar(
    account: string
  ): Promise<RpcInterfaces.UserInfo | undefined> {
    try {
      const result = await this.rpc.get_table_rows({
        code: 'eosio.proton',
        scope: 'eosio.proton',
        table: 'usersinfo',
        key_type: 'i64',
        lower_bound: account,
        index_position: 1,
        limit: 1,
      });

      if (result.rows.length > 0 && result.rows[0].acc === account) {
        return result.rows[0];
      }
    } catch (e) {
      console.error('getProtonAvatar error', e);
    }

    return undefined;
  }
}

