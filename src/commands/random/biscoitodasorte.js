const { f } = require('../../../JSON/frases.json')

module.exports = {
    name: 'biscoitodasorte',
    aliases: ['biscoito'],
    category: 'random',
    emoji: '🥠',
    usage: '<biscoitodasorte>',
    description: 'Quer tentar a sorte hoje?',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {

        let BiscMessage = f.BiscoitoDaSorte[Math.floor(Math.random() * f.BiscoitoDaSorte.length)]
        message.channel.send(`🥠 | ${BiscMessage}`)
    }
}