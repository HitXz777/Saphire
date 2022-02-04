const { e } = require('../../../database/emojis.json')
const { f } = require('../../../database/frases.json')
const ms = require('parse-ms')

module.exports = {
    name: 'avatar',
    aliases: ['foto', 'pfp', 'pic', 'icon', 'icone'],
    category: 'util',
    ClientPermissions: ['EMBED_LINKS', 'ADD_REACTIONS'],
    emoji: '📷',
    description: "Veja a foto de perfil, sua ou a de alguém",
    usage: '<avatar> <user>',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        if (request) return message.reply(`${e.Deny} | ${f.Request}${sdb.get(`Request.${message.author.id}`)}`)

        let user = message.mentions.users.first() || await client.users.cache.get(args[0]) || message.mentions.repliedUser || client.users.cache.find(user => user.username?.toLowerCase() == args[0]?.toLowerCase() || user.tag?.toLowerCase() == args[0]?.toLowerCase()) || message.author,
            linkavatar = user.avatarURL({ dynamic: true, format: "png", size: 1024 }),
            avatar = await message.guild.members.cache.get(user.id) ? await message.guild.members.cache.get(user.id)?.displayAvatarURL({ dynamic: true, format: "png", size: 1024 }) : client.users.cache.get(user.id)?.displayAvatarURL({ dynamic: true, format: "png", size: 1024 }),
            Emojis = ['❌', '📨', '💙'],
            embed = new MessageEmbed()
                .setColor('#246FE0')
                .setDescription(`[Clique aqui](${linkavatar}) para baixar o avatar de ${user.tag}`)
                .setImage(avatar),
            msg = await message.reply({ embeds: [embed] }),
            Delete = false,
            DmUser = []

        sdb.set(`Request.${message.author.id}`, `${msg.url}`)

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
                    msg.delete(() => { message.channel.send(`${e.Warn} | Ocorreu um erro ao excluir a mensagem.\n\`${err}\``) })
                    return message.delete().catch(err => { return message.channel.send(`${e.Warn} | Ocorreu um erro ao excluir a mensagem de origem.\n\`${err}\``) })
                }

                return msg.edit({ embeds: [embed.setColor('RED').setFooter('Tempo expirado.')] }).catch(() => { })

            })

        function NewLike(User) {
            if (User.id === user.id) return
            if (user.id === client.user.id) return message.channel.send(`${User}, olha... Eu agradeço... Mas você já viu meu \`${prefix}perfil @${client.user.username}\`?`)

            let time = ms(1800000 - (Date.now() - sdb.get(`Users.${User.id}.Timeouts.Rep`)))
            if (sdb.get(`Users.${User.id}.Timeouts.Rep`) !== null && 1800000 - (Date.now() - sdb.get(`Users.${User.id}.Timeouts.Rep`)) > 0)
                return message.channel.send(`${e.Nagatoro} | ${User}, calminha aí Princesa! \`${time.minutes}m, e ${time.seconds}s\``)

            const likes = sdb.add(`Users.${user.id}.Likes`, 1)
            sdb.set(`Users.${User.id}.Timeouts.Rep`, Date.now())

            return message.channel.send(`${e.Check} | ${User} deu um like para ${user.tag}.\nAgora, ${user.tag} possui um total de ${e.Like} ${likes} likes.`)
        }

    }
}