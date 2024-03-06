import fs from "fs/promises"
import repl  from "repl"

const __dirname = new URL(".", import.meta.url).pathname

export class CommandHandler {
    constructor(node) {
        this.node = node
        this.stdin = process.openStdin()
    }

    async start() {
        let commands = {}
        let files = await fs.readdir(__dirname + "commands", {withFileTypes: true})
        for (let file of files) {
            let command = await import(`${file.path}/${file.name}`)
            commands[command.name] = command.execute
        }

        this.stdin.addListener("data", async data => {
            let args = data.toString().trim().split(" ")
            let cmd = args.splice(0, 1)[0].toLowerCase()
            if (commands[cmd]) {
                commands[cmd](this.node, args)
            }
        })
    }

    debug(contexts) {
        this.repl = new repl.start()
        for (let [name, context] of Object.entries(contexts)) {
            this.repl.context[name] = context
        }
    }
}
