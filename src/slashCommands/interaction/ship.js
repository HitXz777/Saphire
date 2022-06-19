const { g } = require('../../../modules/Images/gifs.json')

module.exports = {
    name: 'ship',
    description: '[interaction] Calcule o amor entre 2 pessoas',
    dm_permission: false,
    type: 1,
    options: [
        {
            name: 'user1',
            description: 'Usuário um',
            type: 6,
            required: true
        },
        {
            name: 'user2',
            description: 'Usuário dois',
            type: 6
        }
    ],
    async execute({ interaction: interaction, client: client, emojis: e }) {

        const { options, user: author } = interaction,
            user1 = options.getUser('user1'),
            user2 = options.getUser('user2') || author

        if ([user1.id, user2.id].includes(client.user.id)) return reply(`${e.Deny} | Opa, opa! Eu não namoro ninguém, muito menos gosto, vou ficar te devendo essa.`, true)
        if (user2.id === user1.id) return reply(`${e.Deny} | Pessoas diferentes, poxa...`, true)

        let love = Math.random() * 100
        let loveIndex = Math.floor(love / 10)
        let loveLevel = "💖".repeat(loveIndex) + "💔".repeat(10 - loveIndex)
        let gif70 = g.Ship[0]
        let gif40 = g.Ship[1]
        let gif00 = g.Ship[2]

        const embed = { color: 'RED' }

        if (love > 70) {
            embed.tile = `${e.NezukoJump} Medidor de Amor ${client.user.username}`
            embed.thumbnail = { url: gif70 }
            embed.description = `${user1.username} & ${user2.username}\nHuuum... Eu vejo futuro.\n${loveLevel}⠀${Math.floor(love)}% `
        }

        if (love > 40 && love < 70) {
            embed.title = `${e.NezukoDance} Medidor de Amor ${client.user.username}`
            embed.thumbnail = { url: gif40 }
            embed.description = `${user1.username} & ${user2.username}\nhmm... Ainda acho que pode sair algo.\n${loveLevel}⠀${Math.floor(love)}% `
        }

        if (love < 40) {
            embed.title = `${e.SadPanda} Medidor de Amor ${client.user.username}`
            embed.thumbnail = { url: gif00 }
            embed.description = `${user1.username} & ${user2.username}\n... Que pena, mas quem sabe, né?.\n${loveLevel}⠀${Math.floor(love)}% `
        }

        return await interaction.reply({ embeds: [embed] })

        async function reply(message, ephemeral = false) {
            await interaction.reply({ content: message, ephemeral: ephemeral })
        }
    }
}