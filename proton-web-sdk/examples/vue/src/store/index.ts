import { createStore } from 'vuex'
import { RpcInterfaces } from '@proton/js'
import * as SDK from '../webSdk'

export default createStore({
  state: {
    actor: '',
    permission: '',
    accountData: undefined as RpcInterfaces.UserInfo | undefined
  },
  actions: {
    async login ({ state, commit }) {
      commit('clear')

      await SDK.login()

      if (SDK.session) {
        if (SDK.session.auth) {
          state.actor = SDK.session.auth.actor.toString()
          state.permission = SDK.session.auth.permission.toString()
          state.accountData = await SDK.getProtonAvatar(state.actor)
        }
      }
    },

    async reconnect ({ state, commit }) {
      commit('clear')

      await SDK.reconnect()

      if (SDK.session && SDK.session.auth) {
        state.actor = SDK.session.auth.actor.toString()
        state.permission = SDK.session.auth.permission.toString()
      }
    },

    async logout ({ commit }) {
      await SDK.logout()
      commit('clear')
    },

    async transfer ({}, { to, amount }) {
      await SDK.transfer({ to, amount })
    },
  },

  mutations: {
    clear (state) {
      state.actor = ''
      state.permission = ''
    }
  },

  modules: {
  }
})
