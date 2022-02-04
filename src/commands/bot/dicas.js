const { e } = require('../../../database/emojis.json')
const { f } = require('../../../database/frases.json')

// #246FE0 - Azul Saphire
module.exports = {
    name: 'dicas',
    aliases: ['dica', 'tip', 'tips'],
    category: 'bot',
    emoji: `${e.SaphireFeliz}`,
    usage: '<dicas>',
    description: 'Dicas da Saphire',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        let dicas = f.Dicas[Math.floor(Math.random() * f.Dicas.length)]
        return message.channel.send(`${e.SaphireObs} ${dicas}`)
    }
}