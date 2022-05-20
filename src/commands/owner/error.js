const { e } = require('../../../JSON/emojis.json')
const Error = require('../../../modules/functions/config/errors')

module.exports = {
    name: 'error',
    aliases: ['er', 'erro', 'err'],
    category: 'owner',
    emoji: `${e.OwnerCrow}`,
    owner: true,
    usage: '<error>',
    description: 'Causa um erro para testar o sistema de segurança',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {

        return message.reply(a).catch(err => { Error(message, err) })
    }
}