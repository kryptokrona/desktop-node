<script lang="ts">
	import { onMount } from 'svelte';
	import Navbar from "../components/Navbar.svelte";
	import TrafficLights from "../components/TrafficLights.svelte";

	let ready: boolean = false;
	onMount(() => (ready = true));
</script>

<div class="dragbar"></div>

{#if ready}
	<TrafficLights />
	<Navbar />
	<slot />
{/if}

<style>

	@import '../lib/theme/global.scss';

	.dragbar {
		-webkit-app-region: drag;
		position: absolute;
		z-index: 100;
		height: 40px;
		width: 100%;
	}
</style>
