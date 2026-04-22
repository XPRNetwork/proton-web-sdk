<script lang="ts">
  import Layout from '../components/Layout.svelte'
  import Spinner from '../components/Spinner.svelte'

  let {message}: {message: string} = $props()
</script>

<Layout>
  {#snippet content()}
    <div class="wrap">
      <div class="core">
        <Spinner class="pending-spinner" strokeWidth={10} />
        <div class="core__label">
          {message}
        </div>
      </div>
    </div>
  {/snippet}
</Layout>

<style lang="scss">
  @use '../../styles/mixins.scss';

  :global(.pending-spinner) {
    width: 80px;
    height: 80px;
    margin-inline: auto;
    --countdown-background: transparent;
  }

  .wrap {
    height: 100%;
    min-height: 0;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    box-sizing: border-box;
  }

  .core {
    margin-top: 30%;
    box-sizing: border-box;
    padding: calc(var(--space-l) * 2) var(--space-2xl);

    &__label {
      font-size: var(--text-xl);
      font-style: normal;
      font-weight: 600;
      line-height: 120%; /* 28.8px */
      letter-spacing: -1.2px;
      text-align: center;
      margin-top: var(--space-xl);
    }
  }
</style>
