import { LOGGING, TIMEZONE } from "../vars.mjs"

function getDate() {
    return new Date().toLocaleString("en-CA", { hourCycle: "h23", timeZone: TIMEZONE})
}

export function log(...args) {
    if (LOGGING) console.log(`[${getDate()}]`, ...args)
}
