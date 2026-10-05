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


// 2026-10-05: estimate sync duration from accepted local observations.
export const syncRemainingMinutes = writable(null)

let syncSample = null
let infoRequest = 0
let settledInfoRequest = 0

function recordSyncSample(info, receivedAt) {
    let remainingMinutes = null
    const valid = info && info.synced === false &&
        Number.isSafeInteger(info.height) && info.height >= 0 &&
        Number.isSafeInteger(info.network_height) &&
        info.network_height > info.height && Number.isFinite(receivedAt)
    const sample = valid ? {
        height: info.height,
        networkHeight: info.network_height,
        startTime: info.start_time,
        receivedAt
    } : null

    if (sample && syncSample &&
        sample.startTime === syncSample.startTime &&
        sample.height > syncSample.height &&
        sample.networkHeight >= syncSample.networkHeight &&
        sample.receivedAt > syncSample.receivedAt) {
        const minutes = Math.ceil(
            (sample.networkHeight - sample.height) /
            (sample.height - syncSample.height) *
            ((sample.receivedAt - syncSample.receivedAt) / 60000)
        )
        if (Number.isSafeInteger(minutes) && minutes > 0) {
            remainingMinutes = minutes
        }
    }

    syncSample = sample
    syncRemainingMinutes.set(remainingMinutes)
}

setInterval( async () => {

    //Fetch data from localhost
    const request = ++infoRequest
    try {
        const res = await fetch('http://localhost:11898/getinfo')
        if (!res.ok) throw new Error('Node info request failed')
        const json = await res.json()

        if (request > settledInfoRequest) {
            settledInfoRequest = request
            recordSyncSample(json, performance.now())
            node.set(json)
        }
    } catch (error) {
        if (request > settledInfoRequest) {
            settledInfoRequest = request
            syncSample = null
            syncRemainingMinutes.set(null)
            console.log('No data, node not running?', error)
        }
    }

    //Fetch supply from node
    const currentSupply = await getSupply()
    supply.set(currentSupply)


}, 5000)

