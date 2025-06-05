import { inject, Injectable } from '@angular/core';
import { RpcInterfaces } from '@proton/js';

import { WebSdkService } from '../web-sdk/web-sdk.service';
import { from, map, of, ReplaySubject, shareReplay, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  readonly actor$ = new ReplaySubject<string>(1);
  readonly permission$ = new ReplaySubject<string>(1);

  readonly accountData$ = this.actor$.pipe(
    switchMap((actor) => {
      if (actor) {
        return from(this.sdk.getProtonAvatar(actor));
      }
      return of(undefined);
    }),
    shareReplay({
      bufferSize: 1,
      refCount: false,
    })
  );

  readonly avatar$ = this.accountData$.pipe(
    map((data) => this.getAvatar(data)),
    shareReplay({
      bufferSize: 1,
      refCount: false,
    })
  );

  private sdk = inject(WebSdkService);

  constructor() {
    this.login(true);

  }

  async login(reconnect: boolean = false) {
    this.clear();

    if (reconnect) {
      await this.sdk.reconnect();
    } else {
      await this.sdk.login();
    }

    if (this.sdk.session?.auth) {
      this.actor$.next(this.sdk.session.auth.actor.toString());
      this.permission$.next(this.sdk.session.auth.permission.toString());
    }
  }

  async logout() {
    await this.sdk.logout();
    this.clear();
  }

  async transfer(to: string, amount: string) {
    await this.sdk.transfer({
      to: to,
      amount: amount,
    });
  }

  private getAvatar(data?: RpcInterfaces.UserInfo): string {
    const avatar = data?.avatar;

    if (avatar) {
      if (avatar.indexOf('/9j/') !== -1) {
        return `data:image/jpeg;base64,${avatar}`;
      } else if (avatar.indexOf('iVBORw0KGgo') !== -1) {
        return `data:image/png;base64,${avatar}`;
      }
    }

    return 'https://explorer.xprnetwork.org/img/proton_avatar.png';
  }

  private clear() {
    this.actor$.next('');
    this.permission$.next('');
  }
}
