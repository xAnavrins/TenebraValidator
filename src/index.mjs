import "dotenv/config"
import { Tenebra } from "./tenebra.mjs"
import { httpSend } from "./utils/http.mjs"
import { NODE_ENV, PRIVKEY } from "./vars.mjs"
import { log } from "./utils/logging.mjs"
import { CommandHandler } from "./cli.mjs"

let { url } = await httpSend("/ws/start", {privatekey: PRIVKEY})
.catch(err => log("Error connecting to node", err))

let node = new Tenebra(url)
let cli = new CommandHandler(node)
cli.start()
if (NODE_ENV == "development") cli.debug({node: node});

node.once("hello", hello => log(`Connected\n${hello.motd}`))
node.once("ready", me => log("Authed as", me.address.address))

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
