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
            member = message.guild.members.cache.get(user.id)

        let userAvatarURL = user.avatarURL({ dynamic: true, format: "png", size: 1024 }),
            memberAvatarURL = member?.avatarURL({ dynamic: true, format: "png", size: 1024 }),
            userAvatarImage = user.displayAvatarURL({ dynamic: true, format: "png", size: 1024 }),
            memberAvatarImage = member.displayAvatarURL({ dynamic: true, format: "png", size: 1024 }),
            Emojis = ['⬅️', '📨', '🗑️', '💙', '➡️'],
            embeds = [
                new MessageEmbed()
                    .setColor('#246FE0')
                    .setDescription(`${e.Download} [Clique aqui](${userAvatarURL}) para baixar o avatar de ${user.tag}`)
                    .setImage(userAvatarImage),
                new MessageEmbed()
                    .setColor('#246FE0')
                    .setDescription(`${e.Download} [Clique aqui](${memberAvatarURL}) para baixar o avatar de ${user.tag}`)
                    .setImage(memberAvatarImage)
            ],
            atualEmbed = 0, DmUser = []

        const buttonsWithArrows = [
            {
                type: 1,
                components: [
                    {
                        type: 2,
                        emoji: Emojis[0], // Left Arrow
                        custom_id: 'leftArrow',
                        style: 'PRIMARY'
                    },
                    {
                        type: 2,
                        emoji: Emojis[1], // letter
                        custom_id: 'letter',
                        style: 'PRIMARY'
                    },
                    {
                        type: 2,
                        emoji: Emojis[2], // X
                        custom_id: 'x',
                        style: 'DANGER'
                    },
                    {
                        type: 2,
                        emoji: Emojis[3], // Blue Heart
                        custom_id: 'blueHeart',
                        style: 'PRIMARY'
                    },
                    {
                        type: 2,
                        emoji: Emojis[4], // Right Arrow
                        custom_id: 'rightArrow',
                        style: 'PRIMARY'
                    }
                ]
            }
        ]

        const buttonsWithoutArrows = [
            {
                type: 1,
                components: [
                    {
                        type: 2,
                        emoji: Emojis[1], // Letter
                        custom_id: 'letter',
                        style: 'PRIMARY'
                    },
                    {
                        type: 2,
                        emoji: Emojis[2], // X
                        custom_id: 'x',
                        style: 'DANGER'
                    },
                    {
                        type: 2,
                        emoji: Emojis[3], // Blue Heart
                        custom_id: 'blueHeart',
                        style: 'PRIMARY'
                    }
                ]
            }
        ]

        let msg = memberAvatarURL
            ? await message.reply({ embeds: [embeds[0]], components: buttonsWithArrows })
            : await message.reply({ embeds: [embeds[0]], components: buttonsWithoutArrows })

        return msg.createMessageComponentCollector({
            filter: int => true,
            idle: 60000
        })
            .on('collect', (interaction) => {
                interaction.deferUpdate().catch(() => { })

                let intId = interaction.customId,
                    intUser = interaction.user

                if (['leftArrow', 'rightArrow'].includes(intId) && intUser.id === message.author.id) {
                    atualEmbed = atualEmbed === 0 ? 1 : 0

                    return msg.edit({ embeds: [embeds[atualEmbed]] }).catch(() => { })
                }

                if (intId === 'blueHeart')
                    return NewLike(intUser)

                if (intId === 'x' && [message.author.id, user.id].includes(intUser.id)) {
                    message.delete().catch(() => { })
                    return msg.delete().catch(() => { })
                }

                if (intId === 'letter')
                    return sendLetter(intUser)

                return
            })
            .on('end', () => msg.edit({ components: [] }).catch(() => { }))

        function sendLetter(u) {

            if (DmUser.includes(u.id)) return

            u.send({ embeds: [embeds[atualEmbed].setFooter({ text: `Foto enviada de: ${message.guild.name}` })], components: [] }).catch(() => {
                return message.channel.send(`${e.Deny} | ${u}, sua DM está fechada. Verifique suas configurações e tente novamente.`)
            })
            DmUser.push(u.id)
            return message.channel.send(`${e.Check} | ${u} solicitou a foto de ${user.username} para sua DM.`)

        }

        async function NewLike(Author) {
            if (user.id === client.user.id) return message.channel.send(`${Author}, olha... Eu agradeço... Mas você já viu meu \`${prefix}perfil @${client.user.username}\`?`)
            if (Author.id === user.id) return
            if (user.bot) return message.channel.send(`${e.Deny} | <@${Author.id}>, bots não podem receber likes, ok?`)

            let authorData = await Database.User.findOne({ id: Author.id }, 'Timeouts.Rep'),
                userData = await Database.User.findOne({ id: user.id })

            if (!userData) {

                let u = client.users.cache.get(user.id)

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