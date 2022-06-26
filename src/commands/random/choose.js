const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'choose',
    aliases: ['escolhar', 'escolha'],
    category: 'random',
    emoji: `${e.QuestionMark}`,
    usage: '/choose',
    description: 'Deixa que eu escolho pra você',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {
        return message.reply(`${e.Info} | Este comando foi movido para Slash Command e será excluído em breve. Use \`/choose\``)
      }
}