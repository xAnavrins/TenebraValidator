import { SYNC_NODE, HEADERS } from "../vars.mjs"

export function httpSend(path, data, method) {
    method = method ? method : data ? "POST" : "GET"
    return fetch(SYNC_NODE + path, {method, headers: HEADERS, body: JSON.stringify(data)})
    .then(data => data.json())
}
