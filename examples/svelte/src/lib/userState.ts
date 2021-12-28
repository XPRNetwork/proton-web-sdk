import { writable, get } from 'svelte/store'
import * as SDK from './webSdk'
import type { RpcInterfaces } from '@proton/js'

export const actor = writable('')
export const permission = writable('')
export const accountData = writable(undefined as RpcInterfaces.UserInfo | undefined)
export const avatar = writable('')

const clear = () => {
	actor.update(v => '')
	permission.update(v => '')
	accountData.update(v => undefined)
}

const getAvatar = () => {
	const avatar = get(accountData) && get(accountData).avatar

	if (avatar) {
		if (avatar.indexOf('/9j/') !== -1) {
		return `data:image/jpeg;base64,${avatar}`
		} else if (avatar.indexOf('iVBORw0KGgo') !== -1) {
		return `data:image/png;base64,${avatar}`
		}
	}

	return 'https://bloks.io/img/proton_avatar.png'
}

export const login = async (reconnect: boolean = false) => {
	clear()

	if (reconnect) {
		await SDK.reconnect()
	} else {
		await SDK.login()
	}

	if (SDK.session && SDK.session.auth) {
		actor.update(_ => SDK.session.auth.actor.toString())
		permission.update(_ => SDK.session.auth.permission.toString())

		const userInfo = await SDK.getProtonAvatar(get(actor))
		accountData.update(_ => userInfo)
		avatar.update(_ => getAvatar())
	}
}

export const logout = async () => {
	await SDK.logout()
	clear()
}

export const transfer = async ({ to, amount }: { to: string, amount: string }) => {
	await SDK.transfer({
		to,
		amount,
	})
} 