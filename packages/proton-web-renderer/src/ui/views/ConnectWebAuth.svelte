<script lang="ts">
  import AppInfo from '../components/AppInfo.svelte'
  import Button from '../components/Button.svelte'
  import ErrorDisplay from '../components/ErrorDisplay.svelte'
  import Icon from '../components/icons/Icon.svelte'
  import Layout from '../components/Layout.svelte'
  import WalletButton from '../components/WalletButton.svelte'
  import {ROUTES, SUPPORTED_WALLETS} from '../constants'
  import {type UIWalletType} from '../interfaces'
  import {getAppContext} from '../utils'

  let appContext = getAppContext()
  let {demoMode, enabledWallets, router, walletSelect} = appContext

  const noWallets = $derived($enabledWallets?.size === 0)

  function selectWallet(walletType: UIWalletType) {
    if ($walletSelect) {
      $walletSelect.resolve(walletType)
      walletSelect.reset()
    }
    if ($demoMode) {
      $demoMode.selectWallet(walletType)
    }
  }

  function getWebAuth() {
    router.push(ROUTES.WEBAUTH_GET)
  }
</script>

<Layout>
  {#snippet content()}
    <div class="wrap" class:has-error={noWallets}>
      {#if noWallets}
        <ErrorDisplay name="No enabled wallets" description="Enable at least one wallet" />
      {:else}
        <div class="content">
          <AppInfo />

          <ul class="wallets">
            {#if $enabledWallets?.has(SUPPORTED_WALLETS.WEBAUTH_MOBILE)}
              <li>
                <WalletButton
                  onclick={() => selectWallet(SUPPORTED_WALLETS.WEBAUTH_MOBILE)}
                  icon="qr-code"
                  label="Mobile App"
                  sublabel="Scan QR Code"
                />
              </li>
            {/if}
            {#if $enabledWallets?.has(SUPPORTED_WALLETS.WEBAUTH_WEB)}
              <li>
                <WalletButton
                  onclick={() => selectWallet(SUPPORTED_WALLETS.WEBAUTH_WEB)}
                  icon="browser"
                  label="Browser wallet"
                  sublabel="Authorize device"
                />
              </li>
            {/if}
          </ul>
        </div>

        <div class="border-block new-account">
          <Button align="center" full onclick={() => getWebAuth()} appearance="secondary">
            {#snippet content()}
              <Icon name="web-auth" size="var(--space-2xl)" />
              <span class="btn-label">Get WebAuth</span>
            {/snippet}
          </Button>
        </div>

        <div class="border-block connect-other">
          {#if $enabledWallets?.has(SUPPORTED_WALLETS.ANCHOR)}
            <Button
              align="center"
              full
              appearance="flat"
              onclick={() => selectWallet(SUPPORTED_WALLETS.ANCHOR)}
            >
              {#snippet content()}
                <span>Connect with other wallets</span>
                <Icon name="arrow-right" />
              {/snippet}
            </Button>
          {/if}
        </div>
      {/if}
    </div>
  {/snippet}

  {#snippet footer()}
    <div class="tos">
      <span>
        By connecting, I accept XPR Network's <a
          href="https://xprnetwork.org/webauth-terms"
          target="_blank"
          class="link">Terms of Service</a
        >
      </span>
    </div>
  {/snippet}
</Layout>

<style lang="scss">
  @use '../../styles/mixins.scss';

  .wrap {
    box-sizing: border-box;
    min-height: 100%;
    display: grid;
    grid-template-rows: fit-content(60%) max-content auto;

    &.has-error {
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  .content {
    max-width: 100%;
    min-width: 0;
  }

  .wallets {
    padding: var(--space-l);
    list-style: none;
    margin: 0;
    overflow: auto;
    box-sizing: border-box;

    display: flex;
    flex-direction: column;
    gap: var(--space-s);
  }

  .border-block {
    box-sizing: border-box;
    border-top: 1px solid var(--border-color);
  }

  .new-account {
    padding: var(--space-l);
    box-sizing: border-box;
  }

  .connect-other {
    box-sizing: border-box;
    display: flex;
    align-items: flex-end;
    justify-content: center;
  }

  .tos {
    padding: var(--space-l);
    box-sizing: border-box;
    font-family: var(--text-font);
    font-size: var(--text-xxs);
    font-weight: 500;
    line-height: 100%;
    letter-spacing: -0.3px;
    color: var(--text-color-secondary);
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
