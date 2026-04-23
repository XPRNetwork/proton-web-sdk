<script lang="ts">
  import Countdown from '../components/Countdown.svelte'
  import ErrorDisplay from '../components/ErrorDisplay.svelte'
  import Layout from '../components/Layout.svelte'
  import {getAppContext} from '../utils'

  let {
    walletType = 'webauth',
  }: {
    walletType?: 'webauth' | 'anchor'
  } = $props()

  let appContext = getAppContext()

  let {signRequestData, manualAction, demoMode, recoverError} = appContext

  const end = $derived.by(() => {
    const value = $signRequestData?.timeout ?? 60 * 1000 * 2
    return new Date(Date.now() + value).toISOString()
  })

  const label = $derived.by(() => {
    if ($signRequestData?.deviceName) {
      return $signRequestData.deviceName
    }

    return walletType === 'anchor' ? 'Anchor Wallet' : 'WebAuth Wallet'
  })

  function signManually(e: MouseEvent) {
    e.preventDefault()

    if ($manualAction) {
      $manualAction()
      manualAction.set(undefined)
    }

    if ($demoMode) {
      $demoMode.signManually(walletType)
    }
  }

  function ontimeout() {
    if ($demoMode) {
      $demoMode.timeout(walletType)
    }
  }
</script>

<Layout>
  {#snippet content()}
    <div class="wrap">
      <div class="core">
        {#if $recoverError}
          <ErrorDisplay name={$recoverError.name} description={$recoverError.description} />
        {:else}
          <div class="core__label">
            Please open {label} to <br /> review the transaction
          </div>
          <Countdown {end} {ontimeout} />
        {/if}
      </div>
    </div>
  {/snippet}
  {#snippet footer()}
    <div class="footer">
      <!-- svelte-ignore a11y_invalid_attribute -->
      Optional: <a href="#" onclick={signManually} class="link">Sign manually using QR code</a>
    </div>
  {/snippet}
</Layout>

<style lang="scss">
  @use '../../styles/mixins.scss';

  .wrap {
    height: 100%;
    min-height: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
  }

  .core {
    box-sizing: border-box;
    padding: calc(var(--space-l) * 2) var(--space-2xl);

    &__label {
      margin-bottom: var(--space-l);
      text-align: center;
      font-size: var(--text-sm);
      line-height: normal;
      letter-spacing: -0.42px;
    }
  }

  .footer {
    border-top: 1px solid var(--border-color);
    box-sizing: border-box;
    padding: var(--space-2xl);
    text-align: center;
    font-size: var(--text-xs);
    line-height: normal;
    letter-spacing: -0.36px;
    color: var(--text-color-secondary);
  }
</style>
