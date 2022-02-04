const { e } = require('../../../database/emojis.json')
const Error = require('../../../Routes/functions/errors')

module.exports = {
    name: 'error',
    aliases: ['er', 'erro', 'err'],
    category: 'owner',
    emoji: `${e.OwnerCrow}`,
    usage: '<error>',
    description: 'Causa um erro para testar o sistema de segurança',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        return message.reply(a).catch(err => { Error(message, err) })
    }
}