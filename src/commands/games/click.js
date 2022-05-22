const Click = require('./classes/click')

module.exports = {
    name: 'click',
    aliases: ['clique', 'clicar'],
    category: 'games',
    emoji: '👉',
    usage: '<click> <@user>',
    description: 'Quem clicar primeiro ganha ponto',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {

        return new Click().start(client, message, args, prefix, MessageEmbed, Database)

    }
}