export const SYNC_NODE = process.env.SYNC_NODE   || "https://tenebra.lil.gay"
export const PRIVKEY   = process.env.PRIVATE_KEY
export const TIMEZONE  = process.env.TIMEZONE
export const UAGENT    = process.env.UAGENT      || "Anav's Tenebra Validator"
export const NONCE     = process.env.NONCE       || "SomeNonce"
export const TIMEOUT   = process.env.TIMEOUT     || 15000
export const STAKE     = process.env.STAKE       || -1
export const HEADERS = {
    "Content-Type": "application/json",
    "User-Agent": UAGENT,
}
