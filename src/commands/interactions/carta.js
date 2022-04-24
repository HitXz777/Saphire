const { e } = require('../../../JSON/emojis.json')
const Error = require('../../../modules/functions/config/errors')

module.exports = {
    name: 'carta',
    aliases: ['letter'],
    category: 'interactions',
    emoji: '📨',
    usage: '<carta> <@user/id> <Sua mensagem em diante>',
    description: 'Envie cartas para as pessoas',

    run: async (client, message, args, prefix, MessageEmbed, Database) => {

        let authorData = await Database.User.findOne({ id: message.author.id }, 'Slot.Cartas Timeouts.Letter'),
            cartas = authorData?.Slot?.Cartas || 0,
            user = message.mentions.users.first() || client.users.cache.get(args[0]) || client.users.cache.find(user => user.username?.toLowerCase() == args[0]?.toLowerCase() || user.tag?.toLowerCase() == args[0]?.toLowerCase()),
            Mensagem = args.slice(1).join(' '),
            Server = message.guild.name || "Nome indefinido",
            Timer = authorData?.Timeouts?.Letter

        if (!args[0]) return message.reply({
            embeds: [
                new MessageEmbed()
                    .setColor(client.blue)
                    .setTitle(`📨 Correios de Cartas ${client.user.username}`)
                    .setDescription(`Aqui você pode enviar cartas para qualquer pessoa de qualquer servidor *(que eu esteja)*.`)
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

        if (client.Timeout(900000, Timer))
            return message.reply(`${e.Loading} Calma calma, ainda falta \`${client.GetTimeout(900000, Timer)}\``)

        if (cartas < 1)
            return message.reply(`${e.Deny} | Você não possui cartas, compre algumas na \`${prefix}loja\``)

        if (!user)
            return message.reply(`${e.Deny} | **\`Usuário não encontrado\`** | Mencione um usuário ou diga o ID para que eu possa enviar a sua carta.\n\`${prefix}carta <@user/id> A sua mensagem em diante\``)

        if (!Mensagem || Mensagem.length < 10 || Mensagem.length > 1024)
            return message.reply(`${e.Deny} | A mensagem deve estar entre **10~1024 caracteres**`)

        if (user.bot || user.id === message.author.id)
            return message.reply(`${e.Deny} | Você não pode mandar cartas para você mesmo ou bots.`)

        message.delete().catch(() => { message.channel.send(`${e.Deny} | Erro ao deletar a mensagem original.`) })
        user?.send({
            content: `Esta carta foi enviada pelo usuário **${message.author.tag || "Indefinido"} \`${message.author.id}\`** no servidor **${Server}**.`,
            embeds: [
                new MessageEmbed()
                    .setColor(client.blue)
                    .addField(`📨 Mensagem`, `> ${Mensagem}`)
                    .setFooter(`A ${client.user.username} não se responsabiliza pelo conteúdo presente nesta mensagem.`)
            ]
        }).catch((err) => {

            if (err.code === 50007)
                return message.channel.send(`${e.Info} | Este usuário está com a DM fechada, eu não posso mandar nada. Desculpa.`)

            return Error(message, err)
        })

        Database.subtractItem(message.author.id, 'Slot.Cartas', 1)
        Database.SetTimeout(message.author.id, 'Timeouts.Letter')
        return message.channel.send(`${e.Check} | Carta enviada com sucesso!`)
    }
}