<script lang="ts">
  import type {Unsubscriber} from 'svelte/store'

  import {onDestroy, onMount, type Snippet} from 'svelte'
  import {on} from 'svelte/events'
  import {eventSelf, getAppContext} from '../utils'
  import {theme} from '../store'

  let {
    content,
  }: {
    content?: Snippet
  } = $props()

  let dialog = $state<HTMLDialogElement | undefined>(undefined)
  let unsubscribe: Unsubscriber | undefined
  let offMouseDownEvent: () => void | undefined
  let offKeyDownEvent: () => void | undefined

  let appContext = getAppContext()
  let {active, embeddedMode, noClose} = appContext

  onMount(() => {
    unsubscribe = active.subscribe((value) => {
      if (dialog) {
        if (value && !dialog.open) {
          dialog.showModal()
        } else if (!value && dialog.open) {
          dialog.close()
        }
      }
    })

    if (dialog) {
      offMouseDownEvent = on(
        dialog,
        'mousedown',
        eventSelf((e: MouseEvent) => {
          backdropClose(e)
        }),
        {capture: true, passive: false}
      )

      offKeyDownEvent = on(document, 'keydown', (event: KeyboardEvent) => {
        if (event.key === 'Escape' && dialog?.open && !$noClose) {
          cancelRequest()
        }
      })
    }
  })

  onDestroy(() => {
    if (unsubscribe) {
      unsubscribe()
    }
    if (offMouseDownEvent) {
      offMouseDownEvent()
    }
    if (offKeyDownEvent) {
      offKeyDownEvent()
    }
  })

  function cancelRequest() {
    active.set(false)
  }

  // When background is clicked outside of modal, close
  function backdropClose(event: MouseEvent) {
    if (dialog && !$noClose) {
      var rect = dialog.getBoundingClientRect()
      var isInDialog =
        rect.top <= event.clientY &&
        event.clientY <= rect.top + rect.height &&
        rect.left <= event.clientX &&
        event.clientX <= rect.left + rect.width
      if (!isInDialog) {
        event.preventDefault()
        cancelRequest()
      }
    }
  }
</script>

{#if $embeddedMode}
  <div data-theme={$theme} class={['dialog', 'dialog--embedded', !$active && 'is-hidden']}>
    {@render content?.()}
  </div>
{:else}
  <dialog bind:this={dialog} data-theme={$theme} class="dialog">
    {@render content?.()}
  </dialog>
{/if}

<style lang="scss">
  @use '../../styles/base';
  @use '../../styles/utils';

  :global {
    @include utils.use-utils;
  }

  .dialog {
    font-size: var(--text-base);
    line-height: 1.2;
    padding: 0;
    background: var(--body-background);
    max-height: var(--max-modal-content-height);
    border-radius: var(--space-l);
    outline: none;
    border: 1px solid var(--window-border-color);

    display: grid;
    grid-template-rows: max-content;

    &.is-hidden {
      display: none;
    }

    &--embedded {
      --max-modal-content-height: 100%;
      width: 100%;
      max-width: 100%;
      height: 100%;
      max-height: 100%;
      border: none;
      border-radius: 0;
    }
  }
  dialog {
    width: min(328px, 100vw - var(--space-m));
    --max-modal-content-height: calc(100dvh);

    &::backdrop {
      background: rgba(0, 0, 0, 0.75);
    }
  }
</style>
