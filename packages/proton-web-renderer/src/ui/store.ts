import {derived, writable} from 'svelte/store'
import type {
  UIAppInfo,
  UIDemo,
  UIError,
  UIProps,
  UIQRData,
  UIRouter,
  UIRouterState,
  UIRouteValue,
  UISignData,
  UITheme,
  UIWalletSelectResponse,
  UIWalletType,
  WritableWithReset,
} from './interfaces'

const defaultUIProps: UIProps = {}

export const app_props = writable<UIProps>(defaultUIProps)

/** Whether the dialog is mounted into a custom renderTarget (non-modal mode) */
export const embeddedMode = writable<boolean>(false)

/** Whether or not the interface is active in the browser */
export const active = writable<boolean>(false)

export const theme = writable<UITheme>('dark')

export const appInfo = writable<UIAppInfo>({})

export const closeAction = writable<(() => void) | undefined>(undefined)
export const backAction = writable<(() => void) | undefined>(undefined)
export const manualAction = writable<(() => void) | undefined>(undefined)

export const error = writable<UIError | undefined>(undefined)
export const recoverError = writable<UIError | undefined>(undefined)

export const enabledWallets = writable<Set<UIWalletType> | undefined>(undefined)

export const demoMode = writable<UIDemo | undefined>(undefined)

const defaultUIRouterState: UIRouterState = {
  path: undefined,
  history: [],
}

const initRouter = (): UIRouter => {
  const state = writable<UIRouterState>(defaultUIRouterState)
  const onchange = derived(state, (value) => ({has_history: value.history.length > 0}))
  return {
    // Method to go one back in history
    back: () =>
      state.update((current: UIRouterState) => ({
        ...current,
        path: current.history[current.history.length - 1],
        history: current.history.slice(0, -1),
      })),
    // Push a new path on to history
    push: (path) =>
      state.update((current) => {
        let history: UIRouteValue[] = []
        if (current.path) {
          history = current.history
          if (current.path !== path) {
            history = [...current.history, current.path]
          }
        }

        return {
          ...current,
          path,
          history,
        }
      }),
    set: state.set,
    subscribe: state.subscribe,
    update: state.update,
    onchange,
  }
}

export const router = initRouter()

export function initWritableWithReset<T>(): WritableWithReset<T> {
  const {set, subscribe, update} = writable<T | undefined>(undefined)
  return {
    reset: () => set(undefined),
    set,
    subscribe,
    update,
  }
}

export const walletSelect = initWritableWithReset<UIWalletSelectResponse>()

export const qrRequestData = initWritableWithReset<UIQRData>()

export const signRequestData = initWritableWithReset<UISignData>()

// Reset data in all stores
export function resetState() {
  active.set(false)
  demoMode.set(undefined)

  router.set({...defaultUIRouterState})
  app_props.set({...defaultUIProps})

  error.set(undefined)
  walletSelect.reset()
  backAction.set(undefined)
  closeAction.set(undefined)
  manualAction.set(undefined)
  signRequestData.reset()
  recoverError.set(undefined)
  enabledWallets.set(undefined)
}
