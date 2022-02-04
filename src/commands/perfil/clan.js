const { e } = require('../../../database/emojis.json')
// #246FE0 - Azul Saphire
module.exports = {
    name: 'clan',
    aliases: ['grupo'],
    category: 'perfil',
    emoji: '🛡️',
    usage: '<clan> <CodeInvite>',
    description: 'Entre ou crie um clan',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {
        return message.reply(`${e.Loading} | Comando em produção`)
    }
}