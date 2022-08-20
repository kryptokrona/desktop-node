<script>
    import {appState, node, supply} from "$lib/store.js";
    import {goto} from "$app/navigation";
    import {fade} from 'svelte/transition'

    const stopNode = () => {
        window.api.stopNode()
        $appState.nodeRunning = false
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
            white_peerlist_size: null,
        })
        goto('/')
    }

    let syncPercentage
    $:syncPercentage = (($node.height / $node.network_height) * 100).toFixed(2)

</script>

<div in:fade class="wrapper">
    <div class="grid">
        <div class="col">
            <p>Sync</p>
            <div class="card">
                {#if $node.synced === false}
                    <h3>{syncPercentage}%</h3>
                    <div class="sync-bar" style="width: {syncPercentage}%"></div>
                    {:else }
                    <h3>Synced</h3>
                {/if}
            </div>
        </div>
        <div class="col">
            <p>Height</p>
            <div class="card">
                <h3>{$node.height}</h3>
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
        <div class="col">
            <p>Hashrate</p>
            <div class="card">
                <h3>{($node.hashrate / 1000000).toFixed()} MH/s</h3>
            </div>
        </div>
        <div class="col">
            <p>Difficulty</p>
            <div class="card">
                <h3>{($node.difficulty / 1000000).toFixed()} M</h3>
            </div>
        </div>
        <div class="col">
            <p>Out</p>
            <div class="card">
                <h3>{$node.outgoing_connections_count}</h3>
            </div>
        </div>
        <div class="col">
            <p>In</p>
            <div class="card">
                <h3>{$node.incoming_connections_count}</h3>
            </div>
        </div>
        <button class="red" on:click={stopNode}>
            <h3>Stop</h3>
        </button>
    </div>
</div>


<style lang="scss">

  .syncing {
    position: absolute;
    top: 0;
    background-color: #121212;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    height: 100vh;
    width: 100%;
    z-index: 110;
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
    color: white;
    font-size: 1rem;
  }

  .card {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 48px;
    color: white;
    background-color: #171717;
    border-radius: 5px;
    border: 1px solid #252525;
    position: relative;
    z-index: 1;

    h3 {
      position: absolute;
      align-self: center;
      z-index: 3;
      color: white;
    }
  }

  .sync-bar {
    margin-right: auto;
    height: 100%;
    border-radius: 5px;
    z-index: 2;
    background-color: #252525;
  }

  button {
    height: 40px;
    grid-column: span 4 / span 4;
    border-radius: 5px;
    border: none;
    font-family: Montserrat, sans-serif;
    grid-column: span 4 / span 4;
    grid-column-start: 5;
    cursor: pointer;

    h3 {
      margin: 0;
      color: white;
    }
  }

  .red {
    background-color: var(--warn-color);
  }

  .green {
    background-color: var(--success-color);
  }
</style>