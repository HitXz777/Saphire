const { e } = require('../../../JSON/emojis.json'),
    { MessageSelectMenu, MessageActionRow } = require('discord.js')

module.exports = {
    name: 'setsexo',
    aliases: ['sexo', 'gênero', 'genero', 'setgenero', 'setgênero'],
    category: 'perfil',
    ClientPermissions: ['ADD_REACTIONS'],
    emoji: '🌛',
    usage: '<setsexo>',
    description: 'Defina seu sexo no perfil',

    run: async (client, message, args, prefix, MessageEmbed, Database) => {

        let data = await Database.User.findOne({ id: message.author.id }, 'Perfil.Sexo')
        
        if (!data) {
            Database.registerUser(message.author)
            return message.reply(`${e.Menhera} | Opa! Você não tinha nenhuma informação no banco de dados. Acabei de registrar você. Pode usar o comando de novo.`)
        }

        let sexo = data.Perfil?.Sexo,
            emojis = ['♂️', '♀️', '🏳️‍🌈', '*️⃣', '🚁', '❌'],
            valuesToProfile = {
                man: '♂️ Homem',
                woman: '♀️ Mulher',
                LGBT: '🏳️‍🌈 LGBTQIA+',
                indefinido: '*️⃣ Indefinido',
                helicopter: '🚁 Helicóptero de Guerra',
            },
            labels = [
                { label: 'Homen', emoji: emojis[0], value: 'man', defined: valuesToProfile.man },
                { label: 'Mulher', emoji: emojis[1], value: 'woman', defined: valuesToProfile.woman },
                { label: 'LGBTQIA+', emoji: emojis[2], value: 'lgbt', defined: valuesToProfile.LGBT },
                { label: 'Indefinido', emoji: emojis[3], value: 'indefinido', defined: valuesToProfile.indefinido },
                { label: 'Helicóptero de Guerra', emoji: emojis[4], value: 'helicopter', defined: valuesToProfile.helicopter },
            ],
            setted = false,
            options = []

        for (let value of labels) {
            if (value.defined === sexo) continue

            options.push({ label: value.label, emoji: value.emoji, value: value.value })
        }

        const setGenerPainel = new MessageActionRow()
            .addComponents(new MessageSelectMenu()
                .setCustomId('setSexo')
                .setPlaceholder('Selecionar meu sexo') // Mensagem estampada
                .addOptions([
                    options,
                    {
                        label: 'Cancelar mudança de sexo',
                        emoji: emojis[5],
                        value: 'cancel'
                    }
                ])
            )

        let msg = await message.reply({
            content: `${e.Loading} | Escolha seu sexo.`,
            components: [setGenerPainel]
        })

        return msg.createMessageComponentCollector({
            filter: (interaction) => interaction.customId === 'setSexo' && interaction.user.id === message.author.id,
            idle: 60000,
            max: 1
        })
            .on('collect', async interaction => {
                interaction.deferUpdate().catch(() => { })
                setted = true

                switch (interaction.values[0]) {
                    case 'man': defineGener('♂️ Homem'); break;
                    case 'woman': defineGener('♀️ Mulher'); break;
                    case 'lgbt': defineGener('🏳️‍🌈 LGBTQIA+'); break;
                    case 'indefinido': defineGener('*️⃣ Indefinido'); break;
                    case 'helicopter': defineGener('🚁 Helicóptero de Guerra'); break;
                    case 'cancel': defineGener('canceled'); break;
                    default:
                        msg.edit({
                            content: `${e.Warn} | Comando não reconhecido dentre as opções. Por favor, tente novamente.`,
                            components: []
                        }).catch(() => { })
                        break;
                }
                return
            })
            .on('end', () => {
                if (setted) return

                return msg.edit({ content: `${e.Deny} | Comando cancelado.`, components: [] })
            })

        function defineGener(setSelected) {

            if (setSelected === 'canceled')
                return msg.edit({ content: `${e.Deny} | Comando cancelado.` })

            Database.updateUserData(message.author.id, 'Perfil.Sexo', setSelected)
            return msg.edit({ content: `${e.Check} | Sexo "${setSelected}" definido com sucesso!`, components: [] }).catch(() => { })
        }

    }
}