<script>
  import { appState, node, resetStore, supply } from "$lib/store.js";
  import { goto } from "$app/navigation";
  import { fade } from "svelte/transition";
  import { Moon } from "svelte-loading-spinners";

  const stopNode = () => {
    window.api.stopNode();
    goto("/");
    $appState.nodeRunning = false;
    resetStore()
  };

  const restartNode = () => {
    window.api.restartNode();
    resetStore()
  };


  let syncPercentage;
  $:syncPercentage = (($node.height / $node.network_height) * 100).toFixed(2);

</script>

{#if $node.network_height < 1000000}
  <div in:fade class="loading">
    <Moon color="var(--title-color)" size="40" unit="px" />
  </div>
{:else }
  <div in:fade class="wrapper">
    <div class="grid">
      <div class="col">
        <p>Sync</p>
        <div class="card">
          {#if $node.synced === false}
            <h3>{syncPercentage}%</h3>
            <div class="sync-bar progress" style="width: {syncPercentage}%"></div>
          {:else }
            <h3>Synced</h3>
          {/if}
        </div>
      </div>
      <div class="col">
        <p>Connected to</p>
        <div class="card">
          <h3>{($node.outgoing_connections_count <= 0) ? '0' : $node.outgoing_connections_count} Nodes</h3>
        </div>
      </div>
      <div class="col">
        <p>Your height</p>
        <div class="card">
          <h3>{$node.height}</h3>
        </div>
      </div>
      <div class="col">
        <p>Network height</p>
        <div class="card">
          <h3>{$node.network_height}</h3>
        </div>
      </div>
      <div class="col">
        <p>Hashrate</p>
        <div class="card">
          <h3>{($node.hashrate / 1000000).toFixed(2)} MH/s</h3>
        </div>
      </div>
      <div class="col">
        <p>Difficulty</p>
        <div class="card">
          <h3>{($node.difficulty / 1000000).toFixed()} M</h3>
        </div>
      </div>
      {#if $node.synced === false}
        <div class="row">
          <p>Supply</p>
          <div class="card">
            <h3>{$supply.current} XKR</h3>
          </div>
        </div>
      {/if}
      <button class="red" on:click={stopNode}>
        <h3>Stop</h3>
      </button>
      <button class="grey" on:click={restartNode}>
        <h3>Restart</h3>
      </button>
    </div>
  </div>
{/if}


<style lang="scss">

  .loading {
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    top: 0;
    width: 100%;
    height: 100vh;
    background-color: var(--background-color);
    z-index: 100;
  }

  .wrapper {
    padding: 0 30px;
  }

  .grid {
    display: grid;
    width: 100%;
    grid-template-columns: repeat(12, minmax(0, 1fr));
    gap: 1rem;
  }

  .col {
    grid-column: span 6 / span 6;
  }

  .row {
    grid-column: span 12 / span 12;
  }

  p {
    margin: 8px 0;
    opacity: 50%;
    font-family: Montserrat;
    color: var(--text-color);
    font-size: 1rem;
  }

  .card {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 48px;
    color: white;
    background-color: var(--card-background-color);
    border-radius: 5px;
    border: 1px solid var(--card-border-color);
    position: relative;
    z-index: 1;

    h3 {
      position: absolute;
      align-self: center;
      z-index: 3;
      color: var(--title-color);
    }
  }

  .sync-bar {
    background-color: var(--card-border-color);
    margin-right: auto;
    height: 100%;
    border-radius: 5px 0 0 5px;
    border-right: 1px solid #ffffff60;
    z-index: 2;

  }

  button {
    height: 40px;
    grid-column: span 6 / span 6;
    border-radius: 5px;
    border: none;
    font-family: Montserrat, sans-serif;
    cursor: pointer;
    margin-top: 3rem;

    h3 {
      margin: 0;
      color: var(--title-color);
    }
  }

  .red {
    background-color: var(--warn-color);
  }

  .grey {
    background-color: var(--card-background-color);
    border: 1px solid var(--card-border-color)
  }
</style>