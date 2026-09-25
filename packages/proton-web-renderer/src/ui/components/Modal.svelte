<script lang="ts">
  import type {Unsubscriber} from 'svelte/store'

  import {active, embeddedMode, resetState, theme} from '../store'
  import {get} from 'svelte/store'
  import {onDestroy, onMount, type Snippet} from 'svelte'
  import {on} from 'svelte/events'
  import {eventSelf} from '../utils'

  let {
    content,
  }: {
    content?: Snippet
  } = $props()

  let dialog: HTMLDialogElement
  let unsubscribe: Unsubscriber | undefined
  let offEvent: () => void | undefined

  onMount(() => {
    unsubscribe = active.subscribe((value) => {
      if (dialog) {
        if (value && !dialog.open) {
          if (get(embeddedMode)) {
            dialog.show()
          } else {
            dialog.showModal()
          }
        } else if (!value && dialog.open) {
          dialog.close()
          resetState()
        }
      }
    })

    offEvent = on(
      dialog,
      'mousedown',
      eventSelf((e: MouseEvent) => {
        backdropClose(e)
      }),
      {capture: true, passive: false}
    )
  })

  onDestroy(() => {
    if (unsubscribe) {
      unsubscribe()
    }
    if (offEvent) {
      offEvent()
    }
  })

  function cancelRequest() {
    active.set(false)
  }

  // When background is clicked outside of modal, close
  function backdropClose(event: MouseEvent) {
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

  // When escape keypress is captured, close
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && dialog.open) {
      cancelRequest()
    }
  })
</script>

<dialog bind:this={dialog} data-theme={$theme} data-embedded={$embeddedMode ? 'true' : undefined}>
  {@render content?.()}
</dialog>

<style lang="scss">
  @use '../../styles/base';
  @use '../../styles/utils';

  :global {
    @include utils.use-utils;
  }

  dialog {
    font-size: var(--text-base);
    line-height: 1.2;
    width: min(328px, 100vw - var(--space-m));
    padding: 0;
    --max-modal-content-height: calc(100dvh);
    max-height: var(--max-modal-content-height);
    background: var(--body-background);
    border-radius: var(--space-l);
    outline: none;
    border: 1px solid var(--window-border-color);

    &::backdrop {
      background: rgba(0, 0, 0, 0.75);
    }

    &[data-embedded='true'] {
      position: absolute;
      inset: 0;
      margin: 0;
      width: 100%;
      max-width: 100%;
      height: 100%;
      max-height: 100%;
      border: none;
      border-radius: 0;
      --max-modal-content-height: 100%;
    }
  }

  .dialog-content-old {
    padding: var(--space-l);
    overflow: hidden;
    overflow-y: scroll;
    min-height: 496px;
    max-height: 80dvh;
  }
</style>
