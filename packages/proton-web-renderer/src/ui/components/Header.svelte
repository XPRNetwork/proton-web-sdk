<script lang="ts">
  import Icon from './icons/Icon.svelte'
  import ButtonIcon from './ButtonIcon.svelte'

  let {
    title,
    hideLogo = false,
    hideClose = false,
    hideBack = false,
    onback,
    onclose,
  }: {
    hideClose?: boolean
    hideBack?: boolean
    hideLogo?: boolean
    title: string
    onback?: () => void
    onclose?: () => void
  } = $props()

  function close() {
    onclose?.()
  }

  function back() {
    onback?.()
  }
</script>

<header class="dialog-header">
  <div class="slot left">
    {#if !hideBack}
      <ButtonIcon icon="arrow-left" onclick={() => back()}></ButtonIcon>
    {/if}
  </div>

  <div class="center">
    {#if !hideLogo}
      <Icon name="web-auth" class="header-icon" size="var(--space-xl)" />
    {/if}
    {title}
  </div>
  {#if !hideClose}
    <div class="slot right">
      <ButtonIcon icon="xmark" onclick={() => close()}></ButtonIcon>
    </div>
  {/if}
</header>

<style lang="scss">
  .dialog-header {
    border-bottom: 1px solid var(--border-color);
    padding: var(--space-l) var(--space-m);
    font-size: var(--text-sm);
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    gap: var(--space-xs);

    .slot {
      display: flex;
      align-items: center;
    }

    .left {
      justify-content: flex-start;
    }

    .right {
      justify-content: flex-end;
    }

    .center {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    :global(.header-icon) {
      margin-right: var(--space-s);
    }
  }
</style>
