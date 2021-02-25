const schedule = require("node-schedule")
const request = require("request")
const mailjet = require("./mailjet")
let fs = require("fs")
let path = require("path")

// Makes sure that the api refresh is run every 30 seconds.
const job = schedule.scheduleJob("*/30 * * * * *", Run)

function Run() {
    // Reads into memory the markets that are currently being watched
    fs.readFile(path.resolve("./markets.json"), (marketReadErr, data) => {
        if (marketReadErr) throw marketReadErr

        const markets = JSON.parse(data)
        markets.forEach(market => {
            CheckMarket(market)
        })
    })
}

function CheckMarket(market) {
    request(`https://api.litebit.eu/market/${market.name}`, (requestErr, res, body) => {
        if (requestErr) throw requestErr
        let marketData = JSON.parse(body)
        fs.readFile(path.resolve("./notified-users.json"), (userReadError, data) => {
            if (userReadError) throw userReadError;
            const users = JSON.parse(data)
            users.forEach((user) => {
                HandleUser(user, marketData);
            })
        })
    })
}

function HandleUser(user, market) {
    market = market.result
    let selectedUserMarket = user.markets.find(userMarket => market.abbr === userMarket.name)
    if (selectedUserMarket) {
        if (selectedUserMarket.minSell < market.sell) {
            mailjet(user, market)
        } else {
            console.log(`Price not high enough.\nUser: ${user.name} - Market: ${market.abbr}\n€${market.sell} - €${selectedUserMarket.minSell}`)
        }
    }
}
