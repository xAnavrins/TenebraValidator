import "dotenv/config"
import { Tenebra } from "./utils/websocket.mjs"
import { httpSend } from "./utils/http.mjs"
import { NONCE, PRIVKEY } from "./vars.mjs"
import { log } from "./utils/logging.mjs"

let { url } = await httpSend("/ws/start", {privatekey: PRIVKEY})
.catch(err => log("Error connecting to node", err))

let node = new Tenebra(url)
let stakes = {}

function submitBlock(nonce) {
    node.wsSend({"type": "submit_block", "nonce": nonce})
    log("Block Submitted")
}

function updateStakes(newStakes) {
    newStakes.map(stake => {
        if (stake.active) {
            stakes[stake.owner] = stake
        } else {
            delete stakes[stake.owner]
        }
    })
}

node.once("hello", hello => log(`Connected\n${hello.motd}`))
node.once("authenticated", me => log("Authed as", me.address.address))

node.on("stake", stake => {
    updateStakes([stake])
})

node.on("validator", validator => {
    if (validator === node.address) {
        submitBlock(NONCE)
    }
})

node.on("authenticated", me => {
    httpSend("/staking/validator")
    .then(data => {
        if (data.validator === me.address.address) {
            log("Late Validation!")
            submitBlock(NONCE)
        }
    })

    httpSend("/staking")
    .then((data) => {
        updateStakes(data.stakes)
    })
})

node.once("timedout", () => {
    log("Connection timed out, exiting...")
    process.exit(1)
})

node.once("close", () => {
    log("Connection closed, exiting...")
    process.exit(1)
})
node.once("error", err => {
    log(`Connection errored: ${err}, exiting...`)
    process.exit(1)
})
