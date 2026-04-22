<script lang="ts">
  import {onDestroy} from 'svelte'
  import Spinner from './Spinner.svelte'

  let {
    end,
    loading = true,
    ontimeout,
  }: {
    end?: string
    loading?: boolean
    ontimeout?: () => void
  } = $props()

  let deadline = $state<Date>(new Date())
  let remaining = $state<number>()

  let interval: NodeJS.Timeout
  let timeout: NodeJS.Timeout

  $effect(() => {
    if (interval) {
      clearInterval(interval)
    }

    if (timeout) {
      clearTimeout(timeout)
    }

    if (end) {
      deadline = new Date(end)
      interval = setInterval(() => {
        remaining = new Date(deadline).getTime() - Date.now()
        if (remaining <= 0) {
          clearInterval(interval)
          loading = false

          timeout = setTimeout(() => {
            ontimeout?.()
          }, 1000)
        }
      }, 1000)
    }
  })

  onDestroy(() => {
    if (interval) {
      clearInterval(interval)
    }
  })

  function countdownFormat(date: Date) {
    const timeLeft = date.getTime() - Date.now()
    if (timeLeft > 0) {
      return new Date(timeLeft).toISOString().slice(14, 19)
    }
    return '00:00'
  }
</script>

<Spinner {loading} class="countdown-spinner">
  {#snippet content()}
    {#if deadline}
      {#key remaining}
        <span class="label">
          {countdownFormat(deadline)}
        </span>
      {/key}
    {/if}
  {/snippet}
</Spinner>

<style lang="scss">
  :global(.countdown-spinner) {
    width: 232px;
    height: 232px;
    margin-inline: auto;
  }

  .label {
    font-size: 48px;
    font-family:
      SFMono-Regular, ui-monospace, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New',
      monospace;
    font-weight: 500;
    line-height: normal;
  }
</style>
