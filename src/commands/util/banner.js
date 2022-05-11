const { e } = require('../../../JSON/emojis.json'),
    fetch = require("node-fetch"),
    allowedFormats = ["webp", "png", "jpg", "jpeg", "gif"],
    allowedSizes = Array.from({ length: 9 }, (e, i) => 2 ** (i + 4))

module.exports = {
    name: 'banner',
    aliases: ['faixa', 'bn'],
    category: 'util',
    emoji: '🖼️',
    usage: '<banner> [@user]',
    description: 'Veja o banner. Seu ou o de alguém',

    run: async (client, message, args, prefix, MessageEmbed, Database) => {

        let user = message.mentions.users.first() || message.mentions.repliedUser || client.users.cache.find(data => data.username?.toLowerCase() === args.join(' ')?.toLowerCase() || data.tag?.toLowerCase() === args[0]?.toLowerCase() || data.discriminator === args[0] || data.id === args[0]) || message.author,
            founded = false

        if (!user) return message.reply(`${e.Deny} | Nenhum usuário foi encontrado.`)

        let msg = await message.reply(`${e.Loading} | Obtendo banner...`)

        if (user.bot) return msg.edit(`${e.Deny} | Bot não possuem banner. Sorry.`).catch(() => { })

        check()
        const banner = await get(user.id, 2048, "png", true)

        founded = true
        if (!banner) return msg.edit(`${e.Deny} | Nenhum banner foi encontrado.`).catch(() => { })

        return msg.edit({
            content: `🖼️ Este é o banner que ${user.tag} está usando.`,
            embeds: [
                new MessageEmbed()
                    .setColor(client.blue)
                    .setDescription(`${e.Download} | [Baixar](${banner}) banner em formato original.`)
                    .setImage(banner)
            ]
        }).catch(() => { })

        function check() {
            if (founded) return

            setTimeout(() => {
                return msg.edit(`${e.Deny} | Não consegui encontrar nada. Foi mal ai`).catch(() => { })
            }, 4000)
        }

        async function createBannerURL(userId, banner, format = "webp", size = "1024", dynamic) {
            if (dynamic) format = banner.startsWith("a_") ? "gif" : format
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

            } catch (err) { }

            founded = true
            return Data
        }

    }
}