const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'dicas',
    aliases: ['dica', 'tip', 'tips'],
    category: 'bot',
    emoji: `${e.SaphireFeliz}`,
    usage: '<dicas>',
    description: 'Dicas da Saphire',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {

        let Dicas = Database.Frases.get('f')?.Dicas || []

        if (['add', 'new', '+'].includes(args[0]?.toLowerCase())) return addType()
        if (['del', 'remove', '-'].includes(args[0]?.toLowerCase())) return removeType()

        let initialType = Dicas[Math.floor(Math.random() * Dicas.length)],
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
            let newType = Dicas[Math.floor(Math.random() * Dicas.length)]
            if (TypesArray.includes(newType)) return getNewType()
            TypesArray.unshift(newType)
            return TypesArray.map(type => `${e.SaphireObs} | ${type}`).join('\n')
        }

        async function addType() {

            let data = await Database.Client.findOne({ id: client.user.id }, 'Moderadores Administradores')

            if (!data?.Administradores?.includes(message.author.id) && !data?.Moderadores?.includes(message.author.id))
                return message.reply(`${e.Admin} | Apenas moderadores e administradores da Saphire's Team podem adicionar novas dicas neste comando.`)

            if (!args[1]) return  message.reply(`${e.Deny} | Forneça uma dica para que eu possa adiciona-lá no banco de dados.`)

            let type = args.slice(1).join(' ')

            if (Dicas.includes(type)) return message.reply(`${e.Deny} | Já existe uma dica exatamente como essa no meu banco de dados.`)

            Database.Frases.push('f.Dicas', type)
            return message.reply(`${e.Check} | Dica adicionada com sucesso!`)
        }

        async function removeType() {

            let data = await Database.Client.findOne({ id: client.user.id }, 'Moderadores Administradores')

            if (!data?.Administradores?.includes(message.author.id) && !data?.Moderadores?.includes(message.author.id))
                return message.reply(`${e.Admin} | Apenas moderadores e administradores da Saphire's Team podem adicionar novas dicas neste comando.`)

            if (!args[1]) return  message.reply(`${e.Deny} | Forneça uma dica para que eu possa remove-lá no banco de dados.`)

            let type = args.slice(1).join(' ')

            if (!Dicas.find(t => t === type)) return message.reply(`${e.Deny} | Não existe nenhuma dica igual a esta no meu banco de dados.`)

            Database.Frases.pull('f.Dicas', type)
            return message.reply(`${e.Check} | Dica removida com sucesso!`)
        }
    }
}