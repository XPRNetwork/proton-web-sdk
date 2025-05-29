import { defineStore } from 'pinia'
import type { RpcInterfaces } from '@proton/js'
import * as SDK from '@/webSdk'

export const useUserStore = defineStore('user', {
  state: () => ({
    actor: '',
    permission: '',
    accountData: undefined as RpcInterfaces.UserInfo | undefined
  }),
  actions: {
    async login () {
      this.clear()
      await SDK.login()

      if (SDK.session) {
        if (SDK.session.auth) {
          this.actor = SDK.session.auth.actor.toString()
          this.permission = SDK.session.auth.permission.toString()
          this.accountData = await SDK.getProtonAvatar(this.actor)
        }
      }
    },

    async reconnect () {
      this.clear()

      await SDK.reconnect()

      if (SDK.session && SDK.session.auth) {
        this.actor = SDK.session.auth.actor.toString()
        this.permission = SDK.session.auth.permission.toString()
      }
    },

    async logout () {
      await SDK.logout()
      this.clear()
    },

    async transfer ({ to, amount }: { to: string; amount: string; }) {
      await SDK.transfer({ to, amount })
    },

    clear() {
      this.actor = ''
      this.permission = ''
    }
  },
})
