const { DatabaseObj: { e, config } } = require('../../../modules/functions/plugins/database')

module.exports = {
    name: 'nota',
    category: 'interactions',
    emoji: '🤔',
    usage: '<nota> <@user/id>',
    description: 'Quer tal uma avaliação rápida?',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {

        let user = message.mentions.members.first() || message.mentions.repliedUser || message.guild.members.cache.get(args[1])
        if (!user) return message.reply(`${e.Info} | @Marca, fale o ID ou responda a mensagem de alguém usando este comando.`)

        if (user.id === config.ownerId)
            return message.reply(`${e.SaphireObs} | Huum... Minha nota para ${user} é 1000. Ele é liiiiiiindo, perfeeeeito!!!`)

        if (user.id === client.user.id)
            return message.reply('Uma nota pra mim? Que tal infinito?')

        let nota = Math.floor(Math.random() * 12),
            objNotes = {
                0: `🤔 Huum... Minha nota para ${user} é 0. Até me faltou palavras.`,
                1: `🤔 Huum... Minha nota para ${user} é 1. Sabe? Nem sei o que pensar...`,
                2: `🤔 Huum... Minha nota para ${user} é 2. Mas 2 não é 0, ok?`,
                3: `🤔 Huum... Minha nota para ${user} é 3. Mas calma, não desista.`,
                4: `🤔 Huum... Minha nota para ${user} é 4. Acho que sei alguém que pegava.`,
                5: `🤔 Huum... Minha nota para ${user} é 5. Na escola pública passa em...`,
                6: `🤔 Huum... Minha nota para ${user} é 6. Não é Itachi mais me deixou em um genjutsu.`,
                7: `🤔 Huum... Minha nota para ${user} é 7. Não é Neji mas atingiu meu ponto fraco.`,
                8: `🤔 Huum... Minha nota para ${user} é 8. Se fosse um avião, me levava as alturas.`,
                9: `🤔 Huum... Minha nota para ${user} é 9. Tô fugindo de problemas mas se o problema for ${user}, eu vou até buscar.`,
                10: `🤔 Huum... Minha nota para ${user} é 10. Vou juntar as esferas do dragão e pedir você.`
            }[nota]

        return message.reply(`${objNotes || `Viiish, nem tenho nota pra essa maravilha.`}`)

    }
}