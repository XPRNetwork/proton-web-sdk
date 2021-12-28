import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { RpcInterfaces } from '@proton/js'
import * as SDK from './webSdk'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  actor = '';
  permission = '';
  avatar = '';
  accountData = undefined as RpcInterfaces.UserInfo | undefined;
  toControl = new FormControl('');
  amountControl = new FormControl('');

  ngAfterContentInit() {
    this.login(true)
  }

  clear () {
    this.actor = ''
    this.permission = ''
    this.accountData = undefined
  }

  async login (reconnect: boolean = false) {
    this.clear()

    if (reconnect) {
      await SDK.reconnect()
    } else {
      await SDK.login()
    }

    if (SDK.session && SDK.session.auth) {
      this.actor = SDK.session.auth.actor.toString()
      this.permission = SDK.session.auth.permission.toString()

      this.accountData = await SDK.getProtonAvatar(this.actor)
      this.avatar = this.getAvatar()
    }
  }

  async logout () {
    await SDK.logout()
    this.clear()
  }  

  async transfer () {
    await SDK.transfer({
      to: this.toControl.value,
      amount: this.amountControl.value,
    })
  }

  getAvatar () {
    const avatar = this.accountData && this.accountData.avatar

    if (avatar) {
      if (avatar.indexOf('/9j/') !== -1) {
        return `data:image/jpeg;base64,${avatar}`
      } else if (avatar.indexOf('iVBORw0KGgo') !== -1) {
        return `data:image/png;base64,${avatar}`
      }
    }

    return 'https://bloks.io/img/proton_avatar.png'
  }
}
