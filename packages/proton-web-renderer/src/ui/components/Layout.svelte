<script lang="ts">
  import type {Snippet} from 'svelte'

  let {
    content,
    footer,
  }: {
    content?: Snippet
    footer?: Snippet
  } = $props()
</script>

<article>
  <section>
    {@render content?.()}
  </section>
  {#if footer}
    <footer>
      {@render footer()}
    </footer>
  {/if}
</article>

<style lang="scss">
  @use '../../styles/mixins.scss';
  article {
    min-height: 452px;
    display: grid;
    grid-template-rows: 1fr max-content;
    grid-template-areas: 'content' 'footer';
    box-sizing: border-box;
  }

  section {
    @include mixins.sexy-scrollbars;

    grid-area: content;
    overflow: hidden;
    overflow-y: scroll;
    box-sizing: border-box;
  }

  footer {
    grid-area: footer;
  }
</style>
