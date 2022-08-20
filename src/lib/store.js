import {writable} from "svelte/store";
import {getSupply} from "$lib/utils/get-supply.js";

export const appState = writable({
    nodeRunning: false,
    nodeLoaded: false,
})

export const node = writable({
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

export const supply = writable({
    current: null,
    max: null
})


setInterval( async () => {

    //Fetch data from localhost
    const res = await fetch('http://localhost:11898/getinfo')
    if(res.ok) {
        const json = await res.json()
        node.set(json)
    } else console.log('No data, node not running?')

    //Fetch supply from node
    const currentSupply = await getSupply()
    supply.set(currentSupply)


}, 5000)

