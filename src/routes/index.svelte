<script>
    import {appState, node} from "$lib/store.js";
    import {goto} from "$app/navigation";
    import {Moon} from "svelte-loading-spinners";
    import {fade} from 'svelte/transition'

    const startNode = () => {
        window.api.startNode()
        $appState.nodeRunning = true
    }

    $: {
        if($appState.nodeRunning === true && $node.network_height > 1000000){
            goto('/dashboard')
        }
    }

</script>

<div in:fade class="wrapper">
    <h1>NODE</h1>

    <button on:click={startNode}>
        {#if $appState.nodeRunning}
            <div in:fade>
                <Moon color="#000000" size="24" unit="px"/>
            </div>
        {:else }
            <h3>Start node</h3>
        {/if}
    </button>
</div>

<style lang="scss">
  .wrapper {
    height: 80vh;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;

    h1 {
      color: var(--title-color);
    }
  }

  button {
    height: 40px;
    width: 120px;
    grid-column: span 4 / span 4;
    border-radius: 5px;
    border: none;
    font-family: Montserrat, sans-serif;
    background-color: var(--success-color);
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;

    h3 {
      color: var(--title-color);
      margin: 0;
    }
  }
</style>