const { e } = require('../../../JSON/emojis.json')
const ms = require('parse-ms')

module.exports = {
    name: 'avatar',
    aliases: ['foto', 'pfp', 'pic', 'icon', 'icone'],
    category: 'util',
    ClientPermissions: ['EMBED_LINKS', 'ADD_REACTIONS'],
    emoji: '📷',
    description: "Veja a foto de perfil, sua ou a de alguém",
    usage: '<avatar> <user>',

    run: async (client, message, args, prefix, MessageEmbed, Database) => {

        let user = message.mentions.users.first() || message.mentions.repliedUser || client.users.cache.find(data => data.username?.toLowerCase() === args.join(' ')?.toLowerCase() || data.tag?.toLowerCase() === args[0]?.toLowerCase() || data.discriminator === args[0] || data.id === args[0]) || message.author,
            linkavatar = user.avatarURL({ dynamic: true, format: "png", size: 1024 }),
            avatar = await message.guild.members.cache.get(user.id) ? await message.guild.members.cache.get(user.id)?.displayAvatarURL({ dynamic: true, format: "png", size: 1024 }) : client.users.cache.get(user.id)?.displayAvatarURL({ dynamic: true, format: "png", size: 1024 }),
            Emojis = ['❌', '📨', '💙'],
            embed = new MessageEmbed()
                .setColor('#246FE0')
                .setDescription(`[Clique aqui](${linkavatar}) para baixar o avatar de ${user.tag}`)
                .setImage(avatar),
            msg = await message.reply({ embeds: [embed] })

        return like()

        async function like() {

            let Delete = false,
                DmUser = []

            for (const emoji of Emojis)
                msg.react(emoji).catch(() => { })

            const Collector = msg.createReactionCollector({
                filter: (reaction, u) => Emojis.includes(reaction.emoji.name) && u.id !== client.user.id,
                time: 30000
            })

                .on('collect', (reaction, u) => {

                    if (reaction.emoji.name === '❌' && (u.id === message.author.id || u.id === user.id)) {
                        Delete = true
                        return Collector.stop()
                    }

                    if (reaction.emoji.name === '📨') {

                        if (DmUser.includes(u.id)) return

                        u.send({ embeds: [embed.setFooter(`Foto enviada de: ${message.guild.name}`)] }).catch(() => {
                            return message.channel.send(`${e.Deny} | ${u}, sua DM está fechada. Verifique suas configurações e tente novamente.`)
                        })
                        DmUser.push(u.id)
                        return message.channel.send(`${e.Check} | ${u} solicitou a foto de ${user.username} para sua DM.`)

                    }

                    if (reaction.emoji.name === '💙') return NewLike(u)
                    return

                })

                .on('end', () => {

                    if (Delete) {
                        msg.delete(() => message.channel.send(`${e.Warn} | Ocorreu um erro ao excluir a mensagem.\n\`${err}\``))
                        return message.delete().catch(err => message.channel.send(`${e.Warn} | Ocorreu um erro ao excluir a mensagem de origem.\n\`${err}\``))
                    }

                    return msg.edit({ embeds: [embed.setColor('RED').setFooter('Tempo expirado.')] }).catch(() => { })

                })

            async function NewLike(Author) {
                if (user.id === client.user.id) return message.channel.send(`${Author}, olha... Eu agradeço... Mas você já viu meu \`${prefix}perfil @${client.user.username}\`?`)
                if (Author.id === user.id || user.bot) return

                let authorData = await Database.User.findOne({ id: Author.id }, 'Timeouts.Rep'),
                    userData = await Database.User.findOne({ id: user.id })

                if (!userData) {

                    let u = client.users.cache.get(Author.id)

                    if (!u)
                        return message.reply(`${e.Deny} | Usuário desconhecido.`)

                    Database.registerUser(u)
                    return message.reply(`${e.Deny} | <@${Author.id}>, tenta de novo por favor...`)
                }

                if (client.Timeout(1800000, authorData.Timeouts.Rep))
                    return message.channel.send(`${e.Nagatoro} | ${Author}, calminha aí Princesa! \`${client.GetTimeout(1800000, authorData.Timeouts.Rep)}\``)

                Database.addItem(user.id, 'Likes', 1)
                Database.SetTimeout(Author.id, 'Timeouts.Rep')

                return message.channel.send(`${e.Check} | ${Author} deu um like para ${user.tag}.`)
            }
        }
    }
}