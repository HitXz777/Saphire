const { e } = require('../../../JSON/emojis.json'),
    fetch = require("node-fetch"),
    allowedFormats = ["webp", "png", "jpg", "jpeg", "gif"],
    allowedSizes = Array.from({ length: 9 }, (e, i) => 2 ** (i + 4))

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
            banner = await get(user.id, 2048, "png", true),
            embeds = [
                {
                    embed: new MessageEmbed()
                        .setColor(client.blue)
                        .setDescription(`${e.Download} [Clique aqui](${userAvatarURL}) para baixar o avatar original de ${user.tag}`)
                        .setImage(userAvatarImage),
                    type: 'original'
                },
                {
                    embeed: new MessageEmbed()
                        .setColor(client.blue)
                        .setDescription(`${e.Download} [Clique aqui](${memberAvatarURL}) para baixar o avatar no servidor de ${member.user.tag}`)
                        .setImage(memberAvatarImage),
                    type: 'guild'
                },
                {
                    embed: new MessageEmbed()
                        .setColor(client.blue)
                        .setDescription(`${e.Download} [Clique aqui](${banner}) para baixar o banner de ${member.user.tag}`)
                        .setImage(banner),
                    type: 'banner'
                }
            ],
            atualEmbed = 0, DmUserGuild = [], DmUserOriginal = [], DmUserBanner = []

        if (userAvatarImage === memberAvatarImage)
            memberAvatarImage = null

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

        let msg = memberAvatarURL || banner
            ? await message.reply({ embeds: [embeds[0].embed], components: buttonsWithArrows })
            : await message.reply({ embeds: [embeds[0].embed], components: buttonsWithoutArrows })

        return msg.createMessageComponentCollector({
            filter: int => true,
            idle: 60000
        })
            .on('collect', (interaction) => {
                interaction.deferUpdate().catch(() => { })

                let intId = interaction.customId,
                    intUser = interaction.user

                if (intId === 'rightArrow' && intUser.id === message.author.id) {
                    atualEmbed++
                    if (!memberAvatarImage && atualEmbed === 1) atualEmbed = 2
                    if (atualEmbed === 3) atualEmbed = 0

                    return msg.edit({ embeds: [embeds[atualEmbed].embed] }).catch(() => { })
                }

                if (intId === 'leftArrow' && intUser.id === message.author.id) {
                    atualEmbed--
                    if (!memberAvatarImage && atualEmbed === 1) atualEmbed = 0
                    if (atualEmbed === -1) atualEmbed = 2

                    return msg.edit({ embeds: [embeds[atualEmbed].embed] }).catch(() => { })
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

            let embedType = embeds[atualEmbed].type,
                replaceWord = 'a foto'

            if (DmUserBanner.includes(u.id) && embedType === 'banner') return
            if (DmUserGuild.includes(u.id) && embedType === 'guild') return
            if (DmUserOriginal.includes(u.id) && embedType === 'original') return

            u.send({ embeds: [embeds[atualEmbed].embed.setFooter({ text: `Foto enviada de: ${message.guild.name}` })], components: [] }).catch(() => {
                return message.channel.send(`${e.Deny} | ${u}, sua DM está fechada. Verifique suas configurações e tente novamente.`)
            })

            if (embedType === 'banner') {
                DmUserBanner.push(u.id)
                replaceWord = 'o banner'
            }

            if (embedType === 'guild') {
                DmUserGuild.push(u.id)
                replaceWord = 'a foto personalizada no servidor'
            }

            if (embedType === 'original') DmUserOriginal.push(u.id)

            return message.channel.send(`${e.Check} | ${u} solicitou ${replaceWord} de ${user.username} para sua DM.`)

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

        async function createBannerURL(userId, banner, format = "webp", size = "1024", dynamic) {
            if (dynamic) format = banner.startsWith("a_") ? "gif" : format
            if (!banner) return false
            return `https://cdn.discordapp.com/banners/${userId}/${banner}.${format}${parseInt(size) ? `?size=${parseInt(size)}` : ''}`
        }

        async function get(userId, size, format, dynamic) {

            if (format && !allowedFormats.includes(format)) return false
            if (size && (!allowedSizes.includes(parseInt(size)) || isNaN(parseInt(size)))) return false
            if (dynamic && typeof dynamic !== "boolean") return false
            let Data = ""

            try {

                await fetch(`https://discord.com/api/v9/users/${userId}`, {
                    method: 'GET',
                    headers: { 'Authorization': `Bot ${process.env.DISCORD_CLIENT_BOT_TOKEN}` }
                })
                    .then(res => res.json())
                    .then(user => {
                        if (user.code == 50035) return false
                        if (!user.banner) return false
                        if (user.banner) Data = createBannerURL(user.id, user.banner, format, size, dynamic)
                    })

            } catch (err) {
                return false
            }

            if (!Data) return false
            return Data
        }
    }
}