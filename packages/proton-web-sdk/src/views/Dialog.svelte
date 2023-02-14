<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Header from './Header.svelte';
  import Footer from './Footer.svelte';
  import Wallet from './Wallet.svelte';

  import type { WalletItem } from '../types';

  const dispatch = createEventDispatcher();

  export let title: string = '';
  export let subtitle: string = '';
  export let show: boolean = false;
  export let appLogo: string = '';
  export let hasRoundedLogo: boolean = false;
  export let wallets: WalletItem[] = [];

  function close() {
    show = false;
    dispatch('close');
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
  class="wallet-selector"
  class:wallet-selector-active={show}
  on:click|self|stopPropagation={close}
>
  <div class="wallet-selector-inner">
    <div class="wallet-selector-connect">
      <Header {title} {subtitle} logo={appLogo} isLogoRound={hasRoundedLogo} />

      <div class="wallet-selector-connect-body">
        {#if wallets && wallets.length}
          <ul class="wallet-selector-wallet-list">
            {#each wallets as wallet}
              <Wallet {wallet} on:select-wallet />
            {/each}
          </ul>
        {/if}
        <p class="wallet-selector-tos-agreement">
          By connecting, I accept Proton's <a
            class="wallet-selector-tos-link"
            href="https://protonchain.com/terms"
            target="_blank"
            rel="noreferrer">Terms of Service</a
          >
        </p>
      </div>
    </div>

    <div class="wallet-selector-close" on:click={close} />
  </div>
  <Footer />
</div>

<style lang="scss" global>
  .wallet-selector {
    --color-font-primary: black;
    --color-font-secondary: #a1a5b0;
    --color-link: #00aaef;
    --color-bgdefault: #ffffff;
    --color-logo-bgdefault: transparent;
    --color-option-bg: transparent;
    --color-option-font: #000531;

    font-family: 'Circular Std Book', -apple-system, system-ui,
      BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
      sans-serif;
    font-size: 13px;
    background: rgba(0, 0, 0, 0.65);
    position: fixed;
    top: 0px;
    left: 0px;
    width: 100%;
    height: 100%;
    z-index: 2147483647;
    display: none;
    align-items: center;
    justify-content: center;

    * {
      box-sizing: border-box;
      line-height: 1;
    }

    &-active {
      display: flex;
      flex-direction: column;
    }

    &-inner {
      background: var(--proton-wallet-modal-bgcolor, var(--color-bgdefault));
      color: white;
      margin: 20px 20px 13px 20px;
      padding-top: 50px;
      border-radius: 10px;
      box-shadow: 0px -10px 50px rgba(0, 0, 0, 0.5) !important;
      width: 360px;
      transition-property: all;
      transition-duration: 0.5s;
      transition-timing-function: ease-in-out;
      position: relative;
    }

    &-close {
      display: block;
      position: absolute;
      top: 16px;
      right: 16px;
      width: 28px;
      height: 28px;
      background-image: url("data:image/svg+xml,%3Csvg width='12' height='12' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M9.66 10.987L6 7.327l-3.66 3.66A1.035 1.035 0 11.876 9.523l3.66-3.66-3.66-3.66A1.035 1.035 0 012.34.737L6 4.398 9.66.739a1.035 1.035 0 111.464 1.464l-3.66 3.66 3.66 3.661a1.035 1.035 0 11-1.464 1.464z' fill='rgba(161, 165, 176, 0.7)' fill-rule='nonzero'/%3E%3C/svg%3E");
      background-size: 14px;
      background-repeat: no-repeat;
      background-position: 50%;
      cursor: pointer;
      transition: background-image 0.2s ease;

      &:hover {
        background-image: url("data:image/svg+xml,%3Csvg width='12' height='12' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M9.66 10.987L6 7.327l-3.66 3.66A1.035 1.035 0 11.876 9.523l3.66-3.66-3.66-3.66A1.035 1.035 0 012.34.737L6 4.398 9.66.739a1.035 1.035 0 111.464 1.464l-3.66 3.66 3.66 3.661a1.035 1.035 0 11-1.464 1.464z' fill='rgba(161, 165, 176, 1)' fill-rule='nonzero'/%3E%3C/svg%3E");
        transition: background-image 0.2s ease;
      }
    }

    &-connect {
      padding: 0px 20px;
      border-radius: 10px;
      border-top-left-radius: 0;
      border-top-right-radius: 0;
      background: var(--proton-wallet-modal-bgcolor, var(--color-bgdefault));

      &-body {
        margin-top: 35px;
      }
    }

    &-wallet-list {
      margin: 0px;
      padding: 0px;
      list-style: none;
    }

    &-tos-agreement {
      font-family: 'Circular Std Book', sans-serif;
      font-size: 12px;
      line-height: 16px;
      text-align: center;
      margin-top: 35px;
      margin-bottom: 30px;
      color: var(
        --proton-wallet-color-font-secondary,
        var(--color-font-secondary)
      );
    }

    &-tos-link {
      color: var(--proton-wallet-color-link, var(--color-link));
      text-decoration: none;
    }
  }
</style>
