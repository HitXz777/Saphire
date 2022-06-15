const fetch = require("node-fetch"),
    allowedFormats = ["webp", "png", "jpg", "jpeg", "gif"],
    allowedSizes = Array.from({ length: 9 }, (e, i) => 2 ** (i + 4))

module.exports = {
    name: 'Ver avatar',
    dm_permission: false,
    type: 2,
    async execute({ interaction: interaction, client: client, emojis: e }) {

        const { targetId, guild } = interaction

        let user = client.users.cache.get(targetId),
            member = guild.members.cache.get(user.id),
            userAvatarURL = user.avatarURL({ dynamic: true, format: "png", size: 1024 }),
            memberAvatarURL = member?.avatarURL({ dynamic: true, format: "png", size: 1024 }),
            userAvatarImage = user.displayAvatarURL({ dynamic: true, format: "png", size: 1024 }),
            memberAvatarImage = member?.displayAvatarURL({ dynamic: true, format: "png", size: 1024 }),
            banner = await get(user.id, 2048, "png", true),
            embeds = [
                {
                    color: client.blue,
                    description: `${e.Download} [Clique aqui](${userAvatarURL}) para baixar o avatar original de ${user.tag}`,
                    image: { url: userAvatarImage }
                }
            ]

        if (memberAvatarImage && userAvatarImage !== memberAvatarImage)
            embeds.push({
                color: client.blue,
                description: `${e.Download} [Clique aqui](${memberAvatarURL}) para baixar o avatar no servidor de ${member?.user?.tag || 'NomeDesconhecido'}`,
                image: { url: memberAvatarImage }
            })

        if (banner)
            embeds.push({
                color: client.blue,
                description: `${e.Download} [Clique aqui](${banner}) para baixar o banner de ${member?.user?.tag || 'NomeDesconhecido'
                    }`,
                image: { url: banner }
            })

        return interaction.reply({ embeds: [...embeds], ephemeral: true })

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