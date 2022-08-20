export function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

let supply
const max = 1000000000

export const getSupply = async () => {
    const latestHash = await getLatest()
    const current = await getByBlockHash(latestHash)
    return {current, max}
}

async function getLatest() {
    console.log("🚨 Getting supply")
    const response = await fetch('https://blocksum.org/api/json_rpc', {
        method: 'POST',
        cache: 'no-cache',
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
        body: JSON.stringify({
            jsonrpc: "2.0",
            id: "test",
            method: "getlastblockheader",
            params: {}
        })
    });
    console.log(response)
    const data = await response.json()
    console.log('data', data)
    return data.result.block_header.hash
}

async function getByBlockHash(hash) {
    const response = await fetch('https://blocksum.org/api/json_rpc', {
        method: 'POST',
        cache: 'no-cache',
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
        body: JSON.stringify({
            jsonrpc: "2.0",
            id: "test",
            method: "f_block_json",
            params: {
                hash: hash
            }
        })
    });
    const data = await response.json();
    return ((data.result.block.alreadyGeneratedCoins).slice(0, -5))
}

