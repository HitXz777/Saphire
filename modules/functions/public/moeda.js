const { e } = require('../../../JSON/emojis.json'),
    Database = require('../../classes/Database')

async function Moeda(message, guildId) {

    if (guildId) {
        const guild = await Database.Guild.findOne({ id: guildId }, 'Moeda')
        return guild?.Moeda || `${e.Coin} Safiras`
    }

    if (!message || !message.id || !message.guild) return `${e.Coin} Safiras`

    const guild = await Database.Guild.findOne({ id: message.guild.id }, 'Moeda')
    return guild?.Moeda || `${e.Coin} Safiras`
}

module.exports = Moeda