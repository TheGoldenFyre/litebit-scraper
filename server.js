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
            SELECT DISTINCT users.UserName, users.Email, usermarkets.MinSell
            FROM usermarkets, users
            WHERE usermarkets.Abbr = '${marketAbbr}' AND users.ID = usermarkets.UserID`,
            (qerr, res) => {
                if (qerr) throw qerr;

                res.forEach(user => HandleUser(user, marketData))
            }
        )
    })
}

function HandleUser(user, market) {
    market = market.result

    if (user.MinSell < market.sell) {
        mailjet(user, market)
    } else {
        console.log(`Price not high enough.\nUser: ${user.UserName} - Market: ${market.abbr}\n€${market.sell} - €${user.MinSell}`)
    }
}
