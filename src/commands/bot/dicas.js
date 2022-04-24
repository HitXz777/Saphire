const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'dicas',
    aliases: ['dica', 'tip', 'tips'],
    category: 'bot',
    emoji: `${e.SaphireFeliz}`,
    usage: '<dicas>',
    description: 'Dicas da Saphire',

    run: async (client, message, args, prefix, MessageEmbed, Database) => {

        let f = Database.Frases.get('f')

        let initialType = f.Dicas[Math.floor(Math.random() * f.Dicas.length)],
            TypesArray = [],
            i = 0

        TypesArray.push(initialType)

        let typesFormated = TypesArray.map(type => `${e.SaphireObs} | ${type}`).join('\n'),
            msg = await message.reply(`${typesFormated}`)

        msg.react('🆙').catch(() => { })

        let collector = msg.createReactionCollector({
            filter: (reaction, user) => reaction.emoji.name === '🆙' && user.id === message.author.id,
            idle: 30000,
            errors: ['time']
        })

            .on('collect', () => {

                i++
                if (i > 15) collector.stop()
                return msg.edit(`${getNewType()}`)

            })

        function getNewType() {
            let newType = f.Dicas[Math.floor(Math.random() * f.Dicas.length)]
            if (TypesArray.includes(newType)) return getNewType()
            TypesArray.unshift(newType)
            return TypesArray.map(type => `${e.SaphireObs} | ${type}`).join('\n')
        }
    }
}