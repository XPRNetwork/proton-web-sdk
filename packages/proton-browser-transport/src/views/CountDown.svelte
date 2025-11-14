<script lang="ts">
  let {countDown = '00:00'}: {countDown: string} = $props()
</script>

<div class="proton-link-countdown">{countDown}</div>

<style lang="scss" global>
  .proton-link-countdown {
    width: 152px;
    height: 152px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 40px auto 5px;
    border-radius: 100%;
    background-color: white;
    font-size: 42px;
    line-height: 1;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  }
</style>
