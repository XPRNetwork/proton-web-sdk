<script lang="ts">
  import {onDestroy} from 'svelte'

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

  let animated = $derived(loading)
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

<div class="circle" class:animated>
  <div class="content">
    {#if deadline}
      {#key remaining}
        <span class="label">
          {countdownFormat(deadline)}
        </span>
      {/key}
    {/if}
  </div>

  <div class="border">
    <svg viewBox="0 0 232 232" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="116" cy="116" r="114" stroke="url(#paint0_linear_9150_252)" stroke-width="4" />
      <defs>
        <linearGradient
          id="paint0_linear_9150_252"
          x1="157.568"
          y1="232"
          x2="74.4288"
          y2="3.44952e-06"
          gradientUnits="userSpaceOnUse"
        >
          <stop stop-color="#7013C5" />
          <stop offset="0.35" stop-color="#7330D7" />
          <stop offset="0.5" stop-color="#7543E3" />
          <stop offset="0.65" stop-color="#F94E6C" />
          <stop offset="0.75" stop-color="#FC9237" />
          <stop offset="0.85" stop-color="#FFD305" />
          <stop offset="1" stop-color="#20BF55" />
        </linearGradient>
      </defs>
    </svg>
  </div>
</div>

<style lang="scss">
  .circle {
    width: 232px;
    height: 232px;
    margin-inline: auto;
    position: relative;
    display: flex;
    place-content: center;
    box-sizing: border-box;
    border-radius: 100%;
    transition: padding 0.3s ease-out;

    &.animated {
      .border {
        opacity: 1;
      }
    }
  }

  .content {
    position: relative;
    background: black;
    border-radius: inherit;
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 1px solid rgba(var(--countdown-background), 0.05);
    background: rgba(var(--countdown-background), 0.05);
    z-index: 0;
  }

  .label {
    font-size: 48px;
    font-family:
      SFMono-Regular, ui-monospace, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New',
      monospace;
    font-weight: 500;
    line-height: normal;
  }

  .border {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
    opacity: 0;
    transition: opacity 0.3s ease-out;
    pointer-events: none;

    svg {
      aspect-ratio: 1/1;
      width: 100%;
      height: 100%;
      animation: rotation 4s linear infinite;
    }
  }

  @keyframes rotation {
    0% {
      transform: rotate(0);
    }
    100% {
      transform: rotate(360deg);
    }
  }
</style>
