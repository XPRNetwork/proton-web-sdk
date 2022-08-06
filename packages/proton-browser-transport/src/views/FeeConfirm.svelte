<script lang="ts">
    import {createEventDispatcher} from 'svelte'
    const dispatch = createEventDispatcher()

    export let expiresIn: string = '--:--'

    function proceedWithoutFee() {
        dispatch('no-fee')
    }
</script>

<div class="proton-link-subtitle">
    You can try to <span on:click|preventDefault={proceedWithoutFee}>proceed without the fee</span> or
    accept the fee shown below to pay for these costs.
</div>
<div class="proton-link-subtitle">Offer expires in {expiresIn}</div>

<style lang="scss"></style>
