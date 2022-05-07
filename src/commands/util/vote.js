const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'vote',
    aliases: ['pull', 'votação', 'voto'],
    category: 'util',
    ClientPermissions: ['ADD_REACTIONS'],
    emoji: `${e.Upvote}`,
    usage: '<vote> <Conteúdo a ser votado>',
    description: 'Abra facilmente uma votação no chat',

    run: async (client, message, args, prefix, MessageEmbed, Database) => {

        const Conteudo = args.join(' ')
        if (!Conteudo) return message.reply(`${e.Deny} | Você precisa me dizer o que vai ser votado.`)
        if (Conteudo.length > 1000 || Conteudo.length < 6) return message.reply(`${e.Deny} | Você precisa fornecer uma mensagem que contenha pelo menos **6~1000 caracteres.**`)
        let avatar = message.author.displayAvatarURL({ dynamic: true, format: "png", size: 1024 }) || null

        const msg = await message.channel.send(
            {
                embeds: [new MessageEmbed()
                    .setColor(client.blue)
                    .setDescription(Conteudo)
                    .setAuthor({ name: `${message.author.username} abriu uma votação`, iconURL: avatar })
                ]
            }
        )

        msg.react(`${e.Upvote}`).catch(err => message.channel.send(`${e.Deny} | Erro ao reagir a mensagem: \`${err}\``))
        return msg.react(`${e.DownVote}`).catch(err => message.channel.send(`${e.Deny} | Erro ao reagir a mensagem: \`${err}\``))

    }
}