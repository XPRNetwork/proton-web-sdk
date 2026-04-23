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

// Theme is global for all widgets
export const theme = writable<UITheme>('dark')

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

export function initWritableWithReset<T>(): WritableWithReset<T> {
  const {set, subscribe, update} = writable<T | undefined>(undefined)
  return {
    reset: () => set(undefined),
    set,
    subscribe,
    update,
  }
}

export function createAppContext() {
  const app_props = writable<UIProps>(defaultUIProps)

  /** Whether or not the interface is active in the browser */
  const active = writable<boolean>(false)

  const appInfo = writable<UIAppInfo>({})

  /** Whether the dialog is mounted into a custom renderTarget (non-modal mode) */
  const embeddedMode = writable<boolean>(false)

  const closeAction = writable<(() => void) | undefined>(undefined)
  const backAction = writable<(() => void) | undefined>(undefined)
  const manualAction = writable<(() => void) | undefined>(undefined)

  const error = writable<UIError | undefined>(undefined)
  const recoverError = writable<UIError | undefined>(undefined)

  const enabledWallets = writable<Set<UIWalletType> | undefined>(undefined)

  const demoMode = writable<UIDemo | undefined>(undefined)

  const router = initRouter()

  const walletSelect = initWritableWithReset<UIWalletSelectResponse>()

  const qrRequestData = initWritableWithReset<UIQRData>()

  const signRequestData = initWritableWithReset<UISignData>()

  const loadingMessage = writable<string | undefined>(undefined)
  const noClose = writable<boolean>(false)

  function resetState() {
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
    loadingMessage.set(undefined)
    noClose.set(false)
  }

  return {
    resetState,
    app_props,
    active,
    appInfo,
    closeAction,
    backAction,
    manualAction,
    error,
    recoverError,
    enabledWallets,
    demoMode,
    router,
    walletSelect,
    qrRequestData,
    signRequestData,
    embeddedMode,
    loadingMessage,
    noClose,
  }
}

export type UIAppContext = ReturnType<typeof createAppContext>
