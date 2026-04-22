<script lang="ts">
  import {getAppContext} from '../utils'

  let appContext = getAppContext()
  let {appInfo} = appContext

  const appName = $derived.by(() => $appInfo.name)
  const appLogo = $derived.by(() => $appInfo.logo)
  const rounded = $derived.by(() => ($appInfo.logoRounded ? 'rounded' : undefined))
  const hasInfo = $derived(!!appName || !!appLogo)
</script>

{#if hasInfo}
  <div class="app-info">
    {#if appLogo}
      <div>
        <img src={appLogo} alt={appName} class="app-info__logo" data-rounded={rounded} />
      </div>
    {/if}

    {#if appName}
      <div class="app-info__name" title={appName}>{appName}</div>
    {/if}
  </div>
{/if}

<style lang="scss">
  .app-info {
    margin-top: var(--space-m);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--space-s);
    box-sizing: border-box;
    padding: 0 var(--space-l) var(--space-xs);

    &__name {
      font-size: var(--text-base);
      font-weight: 600;
      line-height: 1;
      letter-spacing: -0.8px;
      white-space: nowrap;
      overflow: hidden;
      padding: var(--space-xs) 0;
      text-overflow: ellipsis;
      max-width: 100%;
    }

    &__logo {
      object-fit: cover;
      width: 48px;
      height: 48px;
      background-color: var(--logo-background-color);
      display: inline-block;
      font-size: 8px;
      overflow: hidden;
      text-overflow: ellipsis;

      &[data-rounded] {
        border-radius: 100%;
      }
    }
  }
</style>
