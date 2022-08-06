<script lang="ts">
    export let countDown: string = '00:00'
</script>

<div class="proton-link-countdown">{countDown}</div>

<style lang="scss" global>
    .proton-link-countdown {
        width: 104px;
        height: 104px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 40px auto 5px;
        border-radius: 100%;
        background-color: white;
        font-size: 28px;
        line-height: 40px;
    }
</style>
