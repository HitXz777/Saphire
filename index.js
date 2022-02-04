const SaphireClient = require("./Routes/classes/SaphireClient")
const client = new SaphireClient()
module.exports = client
require('./Routes/functions/process')
for (const file of ["command", "event"]) { require(`./src/structures/${file}`)(client) }
client.start()