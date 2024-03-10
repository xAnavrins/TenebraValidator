import { HEADERS, TIMEOUT } from "./vars.mjs"
import { WebSocket } from "ws"
import { EventEmitter } from "events"
import { httpSend } from "./utils/http.mjs"

export class Tenebra extends EventEmitter {
    constructor(url) {
        super()
        this.callbacks = []
        this.address = ""
        this.keepalive && clearTimeout(this.keepalive)
        this.keepalive = setTimeout(this.timedOut, TIMEOUT)
        this.ws = new WebSocket(url, {headers: HEADERS})
        this.stakes = {}

        this.ws.on("close", () => this.emit("close"))
        this.ws.on("error", err => this.emit("error", err))

        this.ws.on("message", msg => {
            let data = JSON.parse(msg)
            this.emit("raw", msg)
            this.emit("json", data)

            if (data.hasOwnProperty("id")) {
                let callback = this.callbacks[data.id]
                if (callback) {
                    callback(data)
                    delete this.callbacks[data.id]
                }
            }

            switch(data.type) {
                case "keepalive":
                    this.keepalive && clearTimeout(this.keepalive)
                    this.keepalive = setTimeout(this.timedOut, TIMEOUT)
                    this.emit("keepalive", data.server_time)
                    break;

                case "hello":
                    this.wsSend({"type": "unsubscribe", "event": "blocks"})
                    this.wsSend({"type": "unsubscribe", "event": "ownTransactions"})
                    this.wsSend({"type": "unsubscribe", "event": "ownStake"})
                    this.wsSend({"type": "subscribe", "event": "validators"})
                    this.wsSend({"type": "subscribe", "event": "stakes"})
                    this.wsSend({"type": "me"}, data => {
                        this.address = data.address.address

                        httpSend("/staking")
                        .then((stake_data) => {
                            this.updateStakes(stake_data.stakes)
                            this.emit("ready", data)
                        })
                    })
                    this.emit("hello", data)
                    break;

                case "event":
                    switch(data.event) {
                        case "validator":
                            this.emit("validator", data.validator)
                            break;
                        case "stake":
                            this.updateStakes([data.stake])
                            this.emit("stake", data.stake)
                            break;
                    }
                    break;
                }
        })
    }

    updateStakes(newStakes) {
        newStakes.map(stake => this.stakes[stake.owner] = stake)
    }

    wsSend(data, callback) {
        let indexOf = this.callbacks.findIndex(i => !i)
        let id = indexOf === -1 ? this.callbacks.length : indexOf
        this.callbacks[id] = callback || (() => {})
        data.id = id
        this.ws.send(JSON.stringify(data))
    }

    submitBlock(nonce, callback) {
        node.wsSend({"type": "submit_block", "nonce": nonce}, callback)
    }

    timedOut() {
        this.emit("timedout")
    }
}
