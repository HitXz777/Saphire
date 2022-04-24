const { e } = require('../../../JSON/emojis.json')
const Colors = require('../../../modules/functions/plugins/colors')

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
        let sexo = data.Perfil?.Sexo,
            color = await Colors(message.author.id)

        const embed = new MessageEmbed()
            .setColor(color)
            .setTitle('Escolha seu sexo')
            .setDescription('♂️ Homem\n♀️ Mulher\n🏳️‍🌈 LGBTQIA+\n*️⃣ Indefinido\n🚁 Helicóptero de Guerra')

        return message.reply({ embeds: [embed] }).then(msg => {

            msg.react('❌').catch(() => { }) // Cancel
            if (sexo == "♂️ Homem") {
                msg.react('♀️').catch(() => { }) // Mulher
                msg.react('🏳️‍🌈').catch(() => { }) // LGBTQIA+
                msg.react('*️⃣').catch(() => { }) // Indefinido
                msg.react('🚁').catch(() => { }) // Helicóptero
            } else if (sexo == "♀️ Mulher") {
                msg.react('♂️').catch(() => { }) // Homem
                msg.react('🏳️‍🌈').catch(() => { }) // LGBTQIA+
                msg.react('*️⃣').catch(() => { }) // Indefinido
                msg.react('🚁').catch(() => { }) // Helicóptero
            } else if (sexo == "🏳️‍🌈 LGBTQIA+") {
                msg.react('♂️').catch(() => { }) // Homem
                msg.react('♀️').catch(() => { }) // Mulher
                msg.react('*️⃣').catch(() => { }) // Indefinido
                msg.react('🚁').catch(() => { }) // Helicóptero
            } else if (sexo == "*️⃣ Indefinido") {
                msg.react('♂️').catch(() => { }) // Homem
                msg.react('♀️').catch(() => { }) // Mulher
                msg.react('🏳️‍🌈').catch(() => { }) // LGBTQIA+
                msg.react('🚁').catch(() => { }) // Helicóptero
            } else if (sexo == "🚁 Helicóptero de Guerra") {
                msg.react('♂️').catch(() => { }) // Homem
                msg.react('♀️').catch(() => { }) // Mulher
                msg.react('🏳️‍🌈').catch(() => { }) // LGBTQIA+
                msg.react('*️⃣').catch(() => { }) // Indefinido
            } else if (sexo == null) {
                msg.react('♂️').catch(() => { }) // Homem
                msg.react('♀️').catch(() => { }) // Mulher
                msg.react('🏳️‍🌈').catch(() => { }) // LGBTQIA+
                msg.react('*️⃣').catch(() => { }) // Indefinido
                msg.react('🚁').catch(() => { }) // Helicóptero
            }

            const filter = (reaction, user) => { return ['❌', '♂️', '♀️', '🏳️‍🌈', '*️⃣', '🚁'].includes(reaction.emoji.name) && user.id === message.author.id }
            msg.awaitReactions({ filter, max: 1, time: 20000, errors: ['time'] }).then(collected => {
                const reaction = collected.first()

                switch (reaction.emoji.name) {
                    case '♂️': Homem(); break;
                    case '♀️': Mulher(); break;
                    case '🏳️‍🌈': LGBT(); break;
                    case '*️⃣': Indefinido(); break;
                    case '🚁': Helicoptero(); break;
                    case '❌': Cancel(); break;
                    default: message.channel.send(`${e.Deny} | Aconteceu algo que não era para acontecer. Use o comando novamente.`); break;
                }

            }).catch(() => {

                msg.edit({ embeds: [embed.setColor('RED').setDescription(`${e.Deny} | Tempo expirado`)] }).catch(() => { })
            })

            function Homem() {

                embed.setColor('GREEN').setTitle(`${e.Check} Sexo definido com sucesso!`).setDescription('♂️ Homem')
                Database.updateUserData(message.author.id, 'Perfil.Sexo', "♂️ Homem")
                msg.edit({ embeds: [embed] }).catch(() => { })
            }

            function Mulher() {

                embed.setColor('GREEN').setTitle(`${e.Check} Sexo definido com sucesso!`).setDescription('♀️ Mulher')
                Database.updateUserData(message.author.id, 'Perfil.Sexo', "♀️ Mulher")
                msg.edit({ embeds: [embed] }).catch(() => { })
            }

            function LGBT() {

                embed.setColor('GREEN').setColor('GREEN').setTitle(`${e.Check} Sexo definido com sucesso!`).setDescription('🏳️‍🌈 LGBTQIA+')
                Database.updateUserData(message.author.id, 'Perfil.Sexo', "🏳️‍🌈 LGBTQIA+")
                msg.edit({ embeds: [embed] }).catch(() => { })
            }

            function Indefinido() {

                embed.setColor('GREEN').setTitle(`${e.Check} Sexo definido com sucesso!`).setDescription('*️⃣ Indefinido')
                Database.updateUserData(message.author.id, 'Perfil.Sexo', "*️⃣ Indefinido")
                msg.edit({ embeds: [embed] }).catch(() => { })
            }

            function Helicoptero() {

                embed.setColor('GREEN').setTitle(`${e.Check} Sexo definido com sucesso!`).setDescription('🚁 Helicóptero de Guerra')
                Database.updateUserData(message.author.id, 'Perfil.Sexo', "🚁 Helicóptero de Guerra")
                msg.edit({ embeds: [embed] }).catch(() => { })
            }

            function Cancel() {

                embed.setColor('RED').setTitle(`${e.Deny} Request Cancelada!`).setDescription('O sexo não foi alterado')
                return msg.edit({ embeds: [embed] }).catch(() => { })
            }
        })
    }
}