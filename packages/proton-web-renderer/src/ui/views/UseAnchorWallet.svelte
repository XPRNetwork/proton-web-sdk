<script lang="ts">
  import Button from '../components/Button.svelte'
  import Layout from '../components/Layout.svelte'
  import QRCode from '../components/QRCode.svelte'
  import Tabs from '../components/Tabs.svelte'
  import {AUTH_TYPES} from '../constants'
  import {getAppContext} from '../utils'

  let appContext = getAppContext()
  let {qrRequestData} = appContext
  const tabs = [
    {
      name: AUTH_TYPES.MOBILE,
      label: 'Mobile',
    },
    {
      name: AUTH_TYPES.DESKTOP,
      label: 'Desktop',
    },
  ]

  let current = $state('mobile')

  const code = $derived.by(() => $qrRequestData?.code)
  const link = $derived.by(() => $qrRequestData?.link)
</script>

<Layout>
  {#snippet content()}
    <div class="wrap">
      <div class="head">
        <Tabs {tabs} bind:current />
      </div>

      <div class="core">
        {#if current === AUTH_TYPES.MOBILE}
          {#if code}
            <QRCode {code} />
          {/if}
        {:else if current === AUTH_TYPES.DESKTOP}
          {#if link}
            <Button
              align="center"
              full
              appearance="accent"
              label="Open Anchor Wallet"
              href={link}
              targetSelf
            />
          {/if}
        {/if}
      </div>
    </div>
  {/snippet}
  {#snippet footer()}
    <div class="footer">
      <Button full align="center" appearance="flat" href="https://greymass.com/anchor" class="">
        {#snippet content()}
          <span>Download Anchor Wallet</span>
        {/snippet}
      </Button>
    </div>
  {/snippet}
</Layout>

<style lang="scss">
  @use '../../styles/mixins.scss';

  .wrap {
    height: 100%;
    min-height: 0;
    display: grid;
    grid-template-rows: min-content auto;
    box-sizing: border-box;
  }

  .head {
    padding: var(--space-2xl) var(--space-l);
    box-sizing: border-box;
  }

  .core {
    @include mixins.sexy-scrollbars;
    box-sizing: border-box;
    padding: var(--space-2xl) var(--space-l);
    border-top: 1px solid var(--border-color);
  }

  .footer {
    border-top: 1px solid var(--border-color);
    box-sizing: border-box;
  }
</style>
