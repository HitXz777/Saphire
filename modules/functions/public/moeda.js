const { e } = require('../../../JSON/emojis.json'),
    Database = require('../../classes/Database')

async function Moeda(message) {

    if (!message || !message.id || !message.guild) return `${e.Coin} Safiras`

    const guild = await Database.Guild.findOne({ id: message.guild.id }, 'Moeda'),
        moeda = guild?.Moeda

    return moeda || `${e.Coin} Safiras`
}

module.exports = Moeda