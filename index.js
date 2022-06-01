const SaphireClient = require("./modules/classes/SaphireClient")
const client = new SaphireClient()
client.start()
module.exports = client
require('./modules/functions/config/process')
for (const file of ["command", "event"]) require(`./src/structures/${file}`)(client)