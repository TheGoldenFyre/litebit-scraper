const schedule = require("node-schedule")
const request = require("request")
const mailjet = require("./mailjet")
let fs = require("fs")
let path = require("path")

var mysql = require('mysql');
const { on } = require("events")
var con = mysql.createConnection({
    host: "192.168.2.35",
    user: "crypto",
    password: "CryptoStonks",
    database: "LITEBITDB"
});
con.connect((err) => { if (err) throw err })


// Makes sure that the api refresh is run every 30 seconds.
const job = schedule.scheduleJob("*/30 * * * * *", Run)

function Run() {
    // Reads into memory the markets that are currently being watched
    console.log("Connected to DB");
    con.query("SELECT * FROM markets;", (qerr, res) => {
        res.forEach(market => {
            CheckMarket(market.Abbr)
        });
    })
}

function CheckMarket(marketAbbr) {
    request(`https://api.litebit.eu/market/${marketAbbr}`, (requestErr, res, body) => {
        if (requestErr) throw requestErr

        let marketData = JSON.parse(body)

        con.query(`
        SELECT users.UserName, users.Email, usermarkets.Abbr, markets.MarketName, usermarkets.MinSell
        FROM users natural join usermarkets natural join markets
        WHERE usermarkets.Abbr = '${marketAbbr}'`,
            (qerr, res) => {
                console.log(qerr)
                console.log(res)
            })

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
