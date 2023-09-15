import "dotenv/config"
import { Tenebra } from "./utils/websocket.mjs";
import { httpSend } from "./utils/http.mjs";
import { NONCE, PRIVKEY } from "./vars.mjs";

let { url } = await httpSend("/ws/start", {privatekey: PRIVKEY})
.catch(err => {
    console.log("Error connecting to node", err)
})

let node = new Tenebra(url)

function submitBlock(nonce) {
    node.wsSend({"type": "submit_block", "nonce": nonce})
    console.log("Block Submitted")
}

node.on("hello", hello => console.log(hello.motd))
node.on("authenticated", me => console.log("Authed as", me.address.address))

node.on("stake", stake => {
    console.log("Stake", stake)
})
node.on("validator", validator => {
    console.log(`Validator "${validator}" "${node.address}"`)
    if (validator === node.address) {
        submitBlock(NONCE)
    }
})

node.on("authenticated", me => {
    httpSend("/staking/validator")
    .then(data => {
        console.log("CurrentValidator", data)
        if (data.validator === me.address.address) {
            submitBlock(NONCE)
        }
    })
})

node.on("timedout", () => {
    console.log("Connection timed out, exiting...")
    process.exit(1)
})

// node.on("close")
// node.on("error")
