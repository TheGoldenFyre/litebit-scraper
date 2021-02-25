const mailjet = require ('node-mailjet')
.connect('598babc2efd1d866672ec59602528688', '03568f1fccf07c04224b4b8fe5996a57')
const request = mailjet
.post("send", {'version': 'v3.1'})
.request({
  "Messages":[
    {
      "From": {
        "Email": "thomasvanderplas.leiden@gmail.com",
        "Name": "Thomas"
      },
      "To": [
        {
          "Email": "thomasvanderplas.leiden@gmail.com",
          "Name": "Thomas"
        }
      ],
      "Subject": "Greetings from Mailjet.",
      "TextPart": "My first Mailjet email",
      "HTMLPart": "<h3>Dear passenger 1, welcome to <a href='https://www.mailjet.com/'>Mailjet</a>!</h3><br />May the delivery force be with you!",
      "CustomID": "AppGettingStartedTest"
    }
  ]
})
request
  .then((result) => {
    console.log(result.body)
  })
  .catch((err) => {
    console.log(err.statusCode)
  })