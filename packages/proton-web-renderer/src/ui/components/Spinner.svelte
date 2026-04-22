<script lang="ts">
  import type {Snippet} from 'svelte'
  import type {ClassValue} from 'svelte/elements'

  let {
    loading = true,
    content,
    class: className,
    strokeWidth = 4,
  }: {
    loading?: boolean
    content?: Snippet
    class?: ClassValue
    strokeWidth?: number
  } = $props()

  let animated = $derived(loading)
  const size = 150
  let radius = $derived(size - strokeWidth)
</script>

<div class={['circle', className]} class:animated>
  <div class="content">
    {@render content?.()}
  </div>

  <div class="border">
    <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx={size} cy={size} r={radius} stroke="url(#linear)" stroke-width={strokeWidth} />
      <defs>
        <linearGradient
          id="linear"
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
