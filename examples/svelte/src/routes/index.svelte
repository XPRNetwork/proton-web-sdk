<script context="module" lang="ts">
	export const prerender = true;
</script>

<script lang="ts">
	import Header from '../lib/header/Header.svelte'
	import Transfer from '../lib/Transfer.svelte'
</script>

<svelte:head>
	<title>Home</title>
</svelte:head>

<section>
	<Header/>
	<Transfer/>
</section>

<style>
</style>
