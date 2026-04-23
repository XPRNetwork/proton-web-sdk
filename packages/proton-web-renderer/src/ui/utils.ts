import {getContext} from 'svelte'
import type {UIAppContext} from './store'

export function eventSelf(fn) {
  return function (...args) {
    const event = /** @type {Event} */ args[0]
    // @ts-expect-error this is unknown
    if (event.target === this) {
      // @ts-expect-error this is unknown
      fn?.apply(this, args)
    }
  }
}

export function eventOnce(fn) {
  let ran = false

  return function (...args) {
    if (ran) return
    ran = true

    // @ts-expect-error this is unknown
    return fn?.apply(this, args)
  }
}

export function getAppContext(): UIAppContext {
  return getContext<UIAppContext>('appContext')
}
