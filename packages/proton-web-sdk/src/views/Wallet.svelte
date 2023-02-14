<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();
  import type { WalletItem } from '../types';

  export let wallet: WalletItem;

  $: walletTypeClass = ` wallet-selector-logo--${wallet.key.toLowerCase()}`;

  function selectWallet() {
    dispatch('select-wallet', {
      walletName: wallet.key,
    });
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<li class="wallet-selector-wallet" on:click|stopPropagation={selectWallet}>
  <div class="wallet-selector-logo{walletTypeClass}" />
  <span class="wallet-selector-wallet-name">{wallet.value}</span>
  <div class="wallet-selector-right-arrow" />
</li>

<style lang="scss" global>
  .wallet-selector {
    &-wallet {
      background: var(--proton-wallet-option-bg, var(--color-option-bg));
      display: flex;
      align-items: center;
      padding: 20px 20px 20px 16px;
      border: 1px solid rgba(161, 165, 176, 0.23);

      &:hover {
        cursor: pointer;

        .wallet-selector-right-arrow {
          background-image: url("data:image/svg+xml,%3Csvg aria-hidden='true' focusable='false' data-prefix='fas' data-icon='chevron-right' class='svg-inline--fa fa-chevron-right fa-w-10' role='img' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 512'%3E%3Cpath fill='rgba(161, 165, 176, 1)' d='M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z'%3E%3C/path%3E%3C/svg%3E");
        }
      }

      & + #{&} {
        margin-top: 8px;
      }
    }

    &-logo {
      width: 40px;
      height: 40px;
      background-repeat: no-repeat;
      background-position: 50%;
      background-size: 30px;

      &--proton {
        background-image: url("data:image/svg+xml,%3Csvg aria-hidden='true' focusable='false' data-prefix='fas' data-icon='mobile-android-alt' style='color: %23752EEB;' role='img' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 512'%3E%3Cpath fill='currentColor' d='M272 0H48C21.5 0 0 21.5 0 48v416c0 26.5 21.5 48 48 48h224c26.5 0 48-21.5 48-48V48c0-26.5-21.5-48-48-48zm-64 452c0 6.6-5.4 12-12 12h-72c-6.6 0-12-5.4-12-12v-8c0-6.6 5.4-12 12-12h72c6.6 0 12 5.4 12 12v8zm64-80c0 6.6-5.4 12-12 12H60c-6.6 0-12-5.4-12-12V60c0-6.6 5.4-12 12-12h200c6.6 0 12 5.4 12 12v312z'%3E%3C/path%3E%3C/svg%3E");
        background-size: 20px;
      }

      &--webauth {
        background-image: url("data:image/svg+xml,%3Csvg aria-hidden='true' focusable='false' data-prefix='far' data-icon='browser' style='color: %23752EEB;' role='img' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Cpath fill='currentColor' d='M464 32H48C21.5 32 0 53.5 0 80v352c0 26.5 21.5 48 48 48h416c26.5 0 48-21.5 48-48V80c0-26.5-21.5-48-48-48zM48 92c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v24c0 6.6-5.4 12-12 12H60c-6.6 0-12-5.4-12-12V92zm416 334c0 3.3-2.7 6-6 6H54c-3.3 0-6-2.7-6-6V168h416v258zm0-310c0 6.6-5.4 12-12 12H172c-6.6 0-12-5.4-12-12V92c0-6.6 5.4-12 12-12h280c6.6 0 12 5.4 12 12v24z'%3E%3C/path%3E%3C/svg%3E");
      }

      &--anchor {
        background-image: url("data:image/svg+xml,%3Csvg aria-hidden='true' focusable='false' data-prefix='fas' data-icon='desktop' style='color: %23752EEB;' role='img' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 576 512'%3E%3Cpath fill='currentColor' d='M528 0H48C21.5 0 0 21.5 0 48v320c0 26.5 21.5 48 48 48h192l-16 48h-72c-13.3 0-24 10.7-24 24s10.7 24 24 24h272c13.3 0 24-10.7 24-24s-10.7-24-24-24h-72l-16-48h192c26.5 0 48-21.5 48-48V48c0-26.5-21.5-48-48-48zm-16 352H64V64h448v288z'%3E%3C/path%3E%3C/svg%3E");
      }
    }

    &-wallet-name {
      font-family: 'Circular Std Book', sans-serif;
      font-size: 16px;
      line-height: 24px;
      color: var(--proton-wallet-option-font, var(--color-option-font));
      margin-left: 20px;
    }

    &-right-arrow {
      background-image: url("data:image/svg+xml,%3Csvg aria-hidden='true' focusable='false' data-prefix='fas' data-icon='chevron-right' class='svg-inline--fa fa-chevron-right fa-w-10' role='img' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 512'%3E%3Cpath fill='rgba(161, 165, 176, 0.7)' d='M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z'%3E%3C/path%3E%3C/svg%3E");
      width: 10px;
      height: 20px;
      background-size: 10px;
      background-repeat: no-repeat;
      background-position: 50%;
      margin-left: auto;
    }
  }
</style>
