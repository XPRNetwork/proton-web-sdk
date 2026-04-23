<script lang="ts">
  import Button from '../components/Button.svelte'
  import Icon from '../components/icons/Icon.svelte'
  import Layout from '../components/Layout.svelte'
  import QRCode from '../components/QRCode.svelte'
  import {getAppContext} from '../utils'

  let appContext = getAppContext()
  let {qrRequestData} = appContext
  let {
    walletType = 'webauth',
  }: {
    walletType?: 'webauth' | 'anchor'
  } = $props()

  const code = $derived.by(() => $qrRequestData?.code)
  const link = $derived.by(() => $qrRequestData?.link)
</script>

<Layout>
  {#snippet content()}
    <div class="wrap">
      {#if code}
        <QRCode label="Scan QR Code" {code} />
      {/if}
    </div>
  {/snippet}

  {#snippet footer()}
    <div class="footer">
      {#if link}
        <div class="footer__label">or</div>

        <Button full align="center" href={link} targetSelf appearance="outlined">
          {#snippet content()}
            <span class="btn-label">
              {#if walletType === 'anchor'}
                Open Wallet
              {:else}
                Open <Icon name="web-auth" size="var(--space-xl)" class="web-auth" /> WebAuth
              {/if}
            </span>
          {/snippet}
        </Button>
      {/if}
    </div>
  {/snippet}
</Layout>

<style lang="scss">
  .wrap {
    height: 100%;
    min-height: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    padding: var(--space-2xl) var(--space-l);
  }

  .btn-label {
    :global(*) {
      vertical-align: middle;
    }

    :global(.web-auth) {
      margin-inline: var(--space-xs);
    }
  }

  .footer {
    padding-inline: calc(var(--space-l) * 2);
    padding-bottom: var(--space-2xl);

    &__label {
      margin-bottom: var(--space-l);
      text-align: center;
      font-size: var(--text-xs);
      font-style: normal;
      line-height: normal;
      letter-spacing: -0.36px;
    }
  }
</style>
