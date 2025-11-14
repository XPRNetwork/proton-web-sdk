<script lang="ts">
  interface Props {
    isLogoRound?: boolean;
    logo?: string | null;
    title?: string;
    subtitle?: string;
  }
  let {isLogoRound = false, logo = '', title = '', subtitle = ''}: Props = $props();
</script>

<div class="wallet-selector-connect-header">
  {#if logo}
    <img
      class="wallet-selector-logo"
      class:is-rounded={isLogoRound}
      src={logo}
      alt="app-logo"
    />{/if}
  {#if title}<span class="wallet-selector-title">{title}</span>{/if}
  {#if subtitle}<span class="wallet-selector-subtitle">{subtitle}</span>{/if}
</div>

<style lang="scss" global>
  .wallet-selector {
    &-connect-header {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    &-logo {
      width: 100px;
      height: 100px;
      background: var(--proton-wallet-color-bglogo, var(--color-logo-bgdefault));

      &.is-rounded {
        width: 120px;
        height: 120px;
        padding: 10px;
        margin-bottom: 10px;
        border: 1px solid rgba(161, 165, 176, 0.23);
        border-radius: 50%;
      }
    }

    &-title {
      font-size: 16px;
      font-family: 'Circular Std Book', sans-serif;
      line-height: 24px;
      color: var(--proton-wallet-color-font-primary, var(--color-font-primary));
      text-align: center;
    }

    &-subtitle {
      font-size: 16px;
      font-family: 'Circular Std Book', sans-serif;
      line-height: 24px;
      color: var(--proton-wallet-color-font-secondary, var(--color-font-secondary));
      text-align: center;
    }
  }
</style>
