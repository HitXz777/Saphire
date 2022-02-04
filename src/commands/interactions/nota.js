const { DatabaseObj } = require('../../../Routes/functions/database')
const { e, config } = DatabaseObj

// #246FE0 - Azul Saphire
module.exports = {
    name: 'nota',
    category: 'interactions',
    emoji: '🤔',
    usage: '<nota> <@user/id>',
    description: 'Quer tal uma avaliação rápida?',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        let user = message.mentions.members.first() || message.mentions.repliedUser || message.guild.members.cache.get(args[1])
        if (!user) return message.reply(`${e.Info} | @Marca, fala o ID ou responda a mensagem de alguém usando este comando.`)

        if (user.id === config.ownerId)
            return message.reply(`${e.SaphireObs} | Huum... Minha nota para ${user} é 1000. Ele é liiiiiiindo, perfeeeeito!!!`)

        if (user.id === client.user.id)
            return message.reply('Uma nota pra mim? Que tal infinito?')

        let nota = Math.floor(Math.random() * 11)

        switch (nota) {
            case 0:
                message.reply(`🤔 Huum... Minha nota para ${user} é 0. Até me faltou palavras.`)
                break;
            case 1:
                message.reply(`🤔 Huum... Minha nota para ${user} é 1. Sabe? Nem sei o que pensar...`)
                break;
            case 2:
                message.reply(`🤔 Huum... Minha nota para ${user} é 2. Mas 2 não é 0, ok?`)
                break;
            case 3:
                message.reply(`🤔 Huum... Minha nota para ${user} é 3. Mas calma, não desista.`)
                break;
            case 4:
                message.reply(`🤔 Huum... Minha nota para ${user} é 4. Acho que sei alguém que pegava.`)
                break;
            case 5:
                message.reply(`🤔 Huum... Minha nota para ${user} é 5. Na escola pública passa em...`)
                break;
            case 6:
                message.reply(`🤔 Huum... Minha nota para ${user} é 6. Não é Itachi mais me deixou em um genjutsu.`)
                break;
            case 7:
                message.reply(`🤔 Huum... Minha nota para ${user} é 7. Não é Neji mas atingiu meu ponto fraco.`)
                break;
            case 8:
                message.reply(`🤔 Huum... Minha nota para ${user} é 8. Se fosse um avião, me levava as alturas.`)
                break;
            case 9:
                message.reply(`🤔 Huum... Minha nota para ${user} é 9. Tô fugindo de problemas mas se o problema for ${user}, eu vou até buscar.`)
                break;
            case 10:
                message.reply(`🤔 Huum... Minha nota para ${user} é 10. Vou juntar as esferas do dragão e pedir você.`)
                break;
            default:
                message.reply(`Viiish, nem tenho nota pra essa maravilha.`)
                break;
        }
    }
}