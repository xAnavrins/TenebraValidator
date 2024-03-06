import { table } from "table"

export const name = "stakeinfo"

export async function execute(node, args) {
    let currentStakes = Object.values(node.stakes)

    let totalActive = currentStakes.reduce((acc, i) => {
        return acc += i.active && i.stake
    }, 0)

    let tableData = currentStakes.map(i => {
        let percentage = i.stake / totalActive
        return [i.owner, i.stake.toLocaleString(), i.active ? (percentage * 100).toFixed(2)+"%" : "", i.active ? (1400 * percentage).toFixed(3) : ""]
    })

    tableData = [
        ["Owner", "Amount", "%Share", "Revenue/day"],
        ...tableData
    ]

    let stakesTable = table(tableData, {
        drawHorizontalLine: (i, total) => i < 3 || i === total,
        header: {
            alignment: "center",
            content: `Total Staked: ${totalActive.toLocaleString()} TST`
        }
    })
    console.log(stakesTable)
}
