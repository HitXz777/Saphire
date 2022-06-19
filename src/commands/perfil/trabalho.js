const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'trabalho',
    aliases: ['profissão', 'job', 'profissao', 'setprofissão'],
    category: 'perfil',
    emoji: '👷',
    usage: '/editprofile',
    description: 'Defina um trabalho no seu perfil',

    execute: async (client, message, args, prefix, MessageEmbed, Database) =>  {
        return message.reply(`${e.Info} | Este comando foi movido para Slash Command e será excluído em breve. Use \`/editprofile\``)
    }
}