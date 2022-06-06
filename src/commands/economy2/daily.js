const Database = require('../../../modules/classes/Database'),
    { Emojis: e } = Database,
    Daily = require('./classes/daily')

module.exports = {
    name: 'daily',
    aliases: ['d', 'diário', 'diario', 'c', 'claim', 'claim'],
    category: 'economy',
    emoji: `${e.Coin}`,
    usage: '<daily>',
    description: 'Pegue uma recompensa diária',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {
        return new Daily().execute(client, message, args, prefix, MessageEmbed, Database)
    }
}