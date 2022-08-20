<script>
  import { appState, node, supply } from "$lib/store.js";
  import { goto } from "$app/navigation";
  import { fade } from "svelte/transition";

  const stopNode = () => {
    window.api.stopNode();
    goto("/");
    $appState.nodeRunning = false;
    node.set({
      alt_blocks_count: null,
      difficulty: null,
      grey_peerlist_size: null,
      hashrate: null,
      height: null,
      incoming_connections_count: null,
      last_known_block_index: null,
      major_version: null,
      minor_version: null,
      network_height: null,
      outgoing_connections_count: null,
      start_time: null,
      status: null,
      supported_height: null,
      synced: null,
      testnet: null,
      tx_count: null,
      tx_pool_size: null,
      upgrade_heights: null,
      version: null,
      white_peerlist_size: null
    });
  };

  let syncPercentage;
  $:syncPercentage = (($node.height / $node.network_height) * 100).toFixed(2);

</script>

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
  </div>
</div>


<style lang="scss">

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
    grid-column: span 4 / span 4;
    border-radius: 5px;
    border: none;
    font-family: Montserrat, sans-serif;
    grid-row: span 2 / span 2;
    grid-column-start: 5;
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

  .green {
    background-color: var(--success-color);
  }
</style>