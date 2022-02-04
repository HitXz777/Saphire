const { e } = require('../../../database/emojis.json')
const colors = require('../../../Routes/functions/colors')
const Error = require('../../../Routes/functions/errors')
const ms = require('parse-ms')

module.exports = {
    name: 'carta',
    aliases: ['letter'],
    category: 'interactions',
    emoji: '📨',
    usage: '<carta> <@user/id> <Sua mensagem em diante>',
    description: 'Envie cartas para as pessoas',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        let
            cartas = sdb.get(`Users.${message.author.id}.Slot.Cartas`) || 0,
            user = message.mentions.users.first() || client.users.cache.get(args[0]) || client.users.cache.find(user => user.username?.toLowerCase() == args[0]?.toLowerCase() || user.tag?.toLowerCase() == args[0]?.toLowerCase()),
            Mensagem = args.slice(1).join(' ') || 'Nope!',
            Server = message.guild.name || "Nome indefinido",
            Timer = sdb.get(`Users.${message.author.id}.Timeouts.Letter`) || 0,
            LetterTimer = ms(900000 - (Date.now() - Timer))

        if (!args[0])
            return message.reply({
                embeds: [
                    new MessageEmbed()
                        .setTitle(`📨 Correios de Cartas ${client.user.username}`)
                        .setDescription(`Aqui você pode enviar cartas para qualquer pessoa do servidor.`)
                        .addFields(
                            {
                                name: `${e.Gear} | Comando`,
                                value: `\`${prefix}carta @user A sua mensagem que deseja enviar\``
                            },
                            {
                                name: `${e.Info} | Item necessário`,
                                value: `📨 Carta`
                            }
                        )
                ]
            })

        if (Timer !== null && 900000 - (Date.now() - Timer) > 0)
            return message.reply(`${e.Loading} Calma calma, ainda falta \`${LetterTimer.minutes}m e ${LetterTimer.seconds}s\``)

        if (cartas < 1)
            return message.reply(`${e.Deny} | Você não possui cartas, compre algumas na \`${prefix}loja\``)

        if (!user)
            return message.reply(`${e.Deny} | **\`Usuário não encontrado\`** | Mencione um usuário ou diga o ID para que eu posso enviar a sua carta.\n\`${prefix}carta <@user/id> A sua mensagem em diante\``)

        if (Mensagem.length < 10 || Mensagem.length > 1024)
            return message.reply(`${e.Deny} | A mensagem deve estar entre **10~1500 caracteres**`)

        if (user.bot || user.id === message.author.id)
            return message.reply(`${e.Deny} | Você não pode mandar cartas para você mesmo ou bots.`)

        sdb.subtract(`Users.${message.author.id}.Slot.Cartas`, 1)

        user?.send({
            content: `Esta carta foi enviada pelo usuário **${message.author.tag || "Indefinido"}** do servidor **${Server}**.`,
            embeds: [
                new MessageEmbed()
                    .setColor(colors(message.member))
                    .addField(`📨 Mensagem`, `> ${Mensagem}`)
                    .setFooter(`A ${client.user.username} não se responsabiliza pelo conteúdo presente nesta mensagem.`)
            ]
        }).catch((err) => {

            if (err.code === 50007) {
                sdb.add(`Users.${message.author.id}.Slot.Cartas`, 1)
                return message.reply(`${e.Info} | Este usuário está com a DM fechada, eu não posso mandar nada. Desculpa.`)
            }

            return Error(message, err)
        })

        sdb.subtract(`Users.${message.author.id}.Slot.Cartas`, 1)
        sdb.set(`Users.${message.author.id}.Timeouts.Letter`, Date.now())
        return message.reply(`${e.Check} | Carta enviada com sucesso!`)
    }
}