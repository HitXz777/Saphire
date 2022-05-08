const { e } = require('../../../JSON/emojis.json'),
    { MessageSelectMenu, MessageActionRow, Collector } = require('discord.js')

module.exports = {
    name: 'dados',
    aliases: ['data', 'meusdados', 'mydata'],
    category: 'users',
    emoji: e.data,
    usage: 'data',
    description: 'Todos os seus dados presentes no banco de dados',

    run: async (client, message, args, prefix, MessageEmbed, Database) => {

        const msg = await message.reply(`${e.Loading} | Obtendo os dados necessários...`),
            data = await Database.User.findOne({ id: message.author.id })

        if (!data)
            return message.channel.send(`${e.Deny} | Nenhum dado foi encontrado no meu banco de dados referente ao seu ID. Por favor, tente novamente.`).catch(() => { })

        let authorData = {
            _id: data?._id,
            Clan: data?.Clan || 'Clan do not exist',
            Likes: data?.Likes || 0,
            Xp: data?.Xp || 0,
            Level: data?.Level || 0,
            Transactions: data?.Transactions?.length || 0,
            Balance: data?.Balance || 0,
            AfkSystem: data?.AfkSystem ? 'Actived' : 'Disabled',
            MixCount: data?.MixCount || 0,
            QuizCount: data?.QuizCount || 0,
            TicTacToeCount: data?.TicTacToeCount || 0,
            CompetitiveMemoryCount: data?.CompetitiveMemoryCount || 0,
            ForcaCount: data?.ForcaCount || 0,
            DailyCount: data?.DailyCount || 0,
            Cache: {
                ComprovanteOpen: data?.Cache?.ComprovanteOpen ? 'Open' : 'Closed'
            },
            Color: {
                Perm: data?.Color?.Perm ? 'Yes' : 'No',
                Set: data?.Color?.Set ? data.Color.Set : 'Default'
            },
            Vip: {
                Permanent: data?.Vip?.Permanent ? 'Yes' : 'No',
                Validate: client.Timeout(data?.Vip?.TimeRemaing, data?.Vip?.DateNow) ? 'Yes' : 'No',
            },
            Jokempo: {
                Wins: data?.Jokempo?.Wins || 0,
                Loses: data?.Jokempo?.Loses || 0
            }
        }

        const typesComponents = new MessageActionRow()
            .addComponents(new MessageSelectMenu()
                .setCustomId('data')
                .setPlaceholder('Escolher categoria de dados')
                .addOptions([
                    { label: 'Dados Base', value: 'baseData' },
                    { label: 'Dados Basicos', value: 'basicData' },
                    { label: 'Pontuação de Jogos', value: 'gamingCountingData' },
                    { label: 'Encerrar', value: 'close' }
                ])
            )

        initalPage()

        const collector = msg.createMessageComponentCollector({
            filter: (interaction) => interaction.customId === 'data' && interaction.user.id === message.author.id,
            idle: 60000
        })
            .on('collect', async interaction => {
                interaction.deferUpdate().catch(() => { })

                switch (interaction.values[0]) {
                    case 'baseData': initalPage(); break
                    case 'basicData': basicData(); break
                    case 'gamingCountingData': gamingCountingData(); break
                    case 'close': collector.stop(); break
                    default: noDataFound(); break
                }

                return

            })
            .on('end', () => msg.edit({ content: `${e.Deny} | Comando cancelado.`, components: [] }))

        return

        function initalPage() {
            return msg.edit({
                content: 'Base: Discord Basic Information',
                embeds: [
                    new MessageEmbed()
                        .setColor(client.blue)
                        .setTitle('Dados Base - (Beta)')
                        .setDescription('Esses são seus dados base do Discord, que por sua vez, todos tem acesso a eles.')
                        .addFields(
                            {
                                name: 'Identidade',
                                value: `Tag: \`${message.author.tag}\`\nID: \`${message.author.id}\``
                            }
                        )
                        .setFooter({ text: `${message.author.username}'s  Data`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })

                ],
                components: [typesComponents]
            }).catch(() => { })
        }

        function noDataFound() {
            return msg.edit({
                content: 'Base: No Data',
                embeds: [
                    new MessageEmbed()
                        .setColor(client.blue)
                        .setTitle('No data found! - (Beta)')
                        .setDescription('Nenhum dado foi encontrado nesta categoria. Use mais comandos e invista no seu perfil para adquirir mais dados.')
                        .setFooter({ text: `${message.author.username}'s Data`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })

                ],
                components: [typesComponents]
            }).catch(() => { })
        }

        function basicData() {

            return msg.edit({
                content: `Base: Basic ${client.user.username}\'s Database Information`,
                embeds: [
                    new MessageEmbed()
                        .setColor(client.blue)
                        .setTitle('Dados Básicos - (Beta)')
                        .setDescription(`Aqui estão todos os seus dados básicos presentes na ${client.user.username}'s Database.\n*Todos os outros dados se encontram nos comandos \`${prefix}perfil\` & \`${prefix}slot\`*`)
                        .addFields(
                            {
                                name: 'Info Database - Basic Stage',
                                value: `Database's Location Document ID - \`${authorData._id}\`\nClan - \`${authorData.Clan.replace('`', '')}\`\nVip Status - \`Permanent: ${authorData.Vip.Permanent} | Actived: ${authorData.Vip.Validate}\`\nLikes - \`${authorData.Likes}\`\nExperience - \`${authorData.Xp}\`\nLevel - \`${authorData.Level}\`\nTransactions Count - \`${authorData.Transactions}\`\nBalance - \`${authorData.Balance} Safiras\`\nAfk System - \`${authorData.AfkSystem}\`\nCustom Embed Color - \`Permission: ${authorData.Color.Perm} | Hex Code: ${authorData.Color.Set}\`\nDonate Receipt Channel - \`${authorData.Cache.ComprovanteOpen}\``
                            }
                        )
                        .setFooter({ text: `${message.author.username}'s Data`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })

                ],
                components: [typesComponents]
            })
        }

        function gamingCountingData() {

            return msg.edit({
                content: `Base: Basic ${client.user.username}\'s Database Information`,
                embeds: [
                    new MessageEmbed()
                        .setColor(client.blue)
                        .setTitle(`${client.user.username}\'s Database Information - (Beta)`)
                        .setDescription(`Aqui estão todos os seus dados dos jogos na ${client.user.username}'s Database.`)
                        .addFields(
                            {
                                name: 'Info Database - Gaming Count',
                                value: `Mix Count - \`${authorData.MixCount}\`Quiz Count - \`${authorData.QuizCount}\`Tic Tac Toe Count - \`${authorData.TicTacToeCount}\`Competitive Memory Count - \`${authorData.CompetitiveMemoryCount}\`Hangman Count - \`${authorData.ForcaCount}\`Daily Count - \`${authorData.DailyCount}\`Jokempo Count - \`${authorData.Jokempo.Wins} Victory x Defeat ${authorData.Jokempo.Loses}\``
                            }
                        )
                        .setFooter({ text: `${message.author.username}'s Data`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })

                ],
                components: [typesComponents]
            })
        }
    }
}