const SaphireClient = require("./modules/classes/SaphireClient")
const client = new SaphireClient()
module.exports = client
require('./modules/functions/config/process')
for (const file of ["command", "event"]) require(`./src/structures/${file}`)(client)
client.start()