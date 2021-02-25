const mailjet = require('node-mailjet')
  .connect('598babc2efd1d866672ec59602528688', '03568f1fccf07c04224b4b8fe5996a57')

module.exports = (user, market) => {
  mailjet
    .post("send", { 'version': 'v3.1' })
    .request({
      "Messages": [
        {
          "From": {
            "Email": "thomasvanderplas.leiden@gmail.com",
            "Name": "Thomas"
          },
          "To": [
            {
              "Email": user.email,
              "Name": user.name,
            }
          ],
          "Subject": `${market.name} is ready to sell`,
          "TextPart": `${market.name} is ready to sell`,
          "HTMLPart": `<h3>Hello ${user.name}</h3><p>The price for ${market.name} just hit your set threshhold!\nIt is now at €${market.sell} / ${market.abbr}. Head over to litebit.eu to sell</p>`,
          "CustomID": "AppGettingStartedTest"
        }
      ]
    })

}

