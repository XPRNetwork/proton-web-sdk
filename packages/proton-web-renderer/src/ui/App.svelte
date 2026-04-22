<script lang="ts">
  import {onDestroy, onMount} from 'svelte'
  import Header from './components/Header.svelte'
  import Modal from './components/Modal.svelte'
  import {type UITheme} from './interfaces'
  import ConnectWebAuth from './views/ConnectWebAuth.svelte'
  import GetWebAuth from './views/GetWebAuth.svelte'
  import UseAnchorWallet from './views/UseAnchorWallet.svelte'
  import SignRequest from './views/SignRequest.svelte'
  import RequestWithQRCode from './views/RequestWithQRCode.svelte'
  import type {Unsubscriber} from 'svelte/store'
  import {DEMO_IMG, ROUTES, SUPPORTED_WALLETS} from './constants'
  import GenericError from './views/GenericError.svelte'
  import {getAppContext} from './utils'
  import {theme} from './store'
  import PendingState from './views/PendingState.svelte'

  let {
    onclose,
  }: {
    onclose?: () => void
  } = $props()

  let title = $state('')
  let hideLogo = $state(false)
  let hideBackSource = $state(false)
  let hideBackForRoute = $state(false)

  let appContext = getAppContext()
  const {
    error,
    app_props,
    appInfo,
    router,
    active,
    walletSelect,
    demoMode,
    closeAction,
    loadingMessage,
    backAction,
    noClose,
  } = appContext

  let hideBack = $derived(!!$error || $noClose || hideBackForRoute || hideBackSource)
  let hideClose = $derived($noClose)

  let loadingMsg = $derived.by(() => $loadingMessage ?? 'Preparing request...')

  const isOtherRegExp = /^other\-/
  const isSignRegExp = /\-sign$/
  const isSignManualRegExp = /\-manual\-sign$/
  let unsubscribeProps: Unsubscriber | undefined
  let unsubscribeRouter: Unsubscriber | undefined
  let unsubscribeRouteChange: Unsubscriber | undefined
  let unsubscribeActive: Unsubscriber | undefined

  onMount(() => {
    unsubscribeProps = app_props.subscribe((value) => {
      if (value.theme) {
        setTheme(value.theme)
      }
      if (value.appInfo) {
        appInfo.set(value.appInfo)
      }
    })

    unsubscribeRouteChange = router.onchange.subscribe((value) => {
      hideBackForRoute = !value.has_history && !$backAction
    })

    unsubscribeRouter = router.subscribe((current) => {
      if (current.path) {
        if (isOtherRegExp.test(current.path)) {
          hideLogo = true
        } else {
          hideLogo = false
        }

        if (isSignManualRegExp.test(current.path)) {
          title = 'Sign manually'
          hideBackSource = true
        } else if (isSignRegExp.test(current.path)) {
          title = 'Signing request'
          hideBackSource = true
        } else {
          if (current.path === ROUTES.PREPARING_REQUEST) {
            title = 'Pending...'
            hideBackSource = true
            hideLogo = true
          } else if (current.path === ROUTES.OTHER_ANCHOR_USE) {
            title = 'Anchor wallet'
          } else if (current.path === ROUTES.OTHER_ANCHOR_SIGN) {
            title = 'Anchor wallet'
          } else if (current.path === ROUTES.WEBAUTH_LOGIN_MOBILE) {
            title = 'Scan with WebAuth App'
          } else {
            title = 'Connect WebAuth'
          }
        }
      } else {
        hideLogo = false
        hideBackSource = false
      }
    })

    unsubscribeActive = active.subscribe((value) => {
      if (!value) {
        hideBackSource = false

        if ($walletSelect) {
          $walletSelect.reject(new Error('no wallet selected'))
          walletSelect.reset()
        }
        if ($demoMode) {
          $demoMode.close()
        }
        if ($closeAction) {
          $closeAction()
          closeAction.set(undefined)
        }
        onclose?.()
      }
    })
  })

  function setTheme(themeValue: UITheme) {
    theme.set(themeValue)
  }

  function setLogo(e: Event) {
    const target = e.target as HTMLSelectElement
    const value = target.value
    let logo = ''
    let logoRounded = false
    if (value) {
      logo = DEMO_IMG

      if (value === 'logo_rounded') {
        logoRounded = true
      }
    }

    appInfo.update((value) => {
      return {
        ...value,
        logo,
        logoRounded,
      }
    })
  }

  function setName(e: Event) {
    const target = e.target as HTMLSelectElement
    const value = target.value
    let name = ''
    if (value === 'name') {
      name = 'Taskly'
    } else if (value === 'name_long') {
      name = 'Taskly Is a Very Very Long Application Name'
    }

    appInfo.update((value) => {
      return {
        ...value,
        name,
      }
    })
  }

  onDestroy(() => {
    unsubscribeProps?.()
    unsubscribeRouteChange?.()
    unsubscribeRouter?.()
    unsubscribeActive?.()
  })

  function onClose() {
    active.set(false)
  }

  function onBack() {
    router.back()

    if ($backAction) {
      $backAction()
      backAction.set(undefined)
    }
  }
</script>

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
  <link
    href="https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,100..900;1,100..900&display=swap"
    rel="stylesheet"
  />
</svelte:head>

<Modal>
  {#snippet content()}
    {#if $demoMode}
      <div class="demo">
        <button onclick={() => setTheme('dark')}>Dark</button>
        <button onclick={() => setTheme('light')}>Light</button>
        <div class="spacer"></div>

        <button onclick={() => $demoMode.sign(SUPPORTED_WALLETS.WEBAUTH_MOBILE)}>
          Sign with WebAuth</button
        >
        <button onclick={() => $demoMode.sign(SUPPORTED_WALLETS.ANCHOR)}>Sign with Anchor</button>

        <button onclick={() => $demoMode.showLoading()}>Show loading</button>

        <select onchange={(e) => setLogo(e)}>
          <option value="">No logo</option>
          <option value="logo">Show logo</option>
          <option value="logo_rounded">Show rounded logo</option>
        </select>

        <select onchange={(e) => setName(e)}>
          <option value="">No name</option>
          <option value="name">Show name</option>
          <option value="name_long">Show long name</option>
        </select>
      </div>
    {/if}

    <Header {title} {hideLogo} {hideBack} {hideClose} onclose={onClose} onback={onBack}></Header>

    {#if $active}
      {#if $error}
        <GenericError name={$error.name} description={$error.description} />
      {:else if $router.path === ROUTES.WEBAUTH_GET}
        <GetWebAuth />
      {:else if $router.path === ROUTES.OTHER_ANCHOR_USE}
        <UseAnchorWallet />
      {:else if $router.path === ROUTES.WEBAUTH_LOGIN_MOBILE}
        <RequestWithQRCode />
      {:else if $router.path === ROUTES.WEBAUTH_CONNECT}
        <ConnectWebAuth />
      {:else if $router.path === ROUTES.WEBAUTH_SIGN}
        <SignRequest />
      {:else if $router.path === ROUTES.WEBAUTH_SIGN_MANUAL}
        <RequestWithQRCode />
      {:else if $router.path === ROUTES.OTHER_ANCHOR_SIGN}
        <SignRequest walletType="anchor" />
      {:else if $router.path === ROUTES.OTHER_ANCHOR_SIGN_MANUAL}
        <RequestWithQRCode walletType="anchor" />
      {:else if $router.path === ROUTES.PREPARING_REQUEST}
        <PendingState message={loadingMsg} />
      {/if}
    {/if}
  {/snippet}
</Modal>

<style lang="scss">
  .demo {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1000;
  }

  .spacer {
    display: inline-block;
    width: 30px;
  }
</style>
