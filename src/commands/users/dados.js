const { e } = require('../../../JSON/emojis.json'),
    { MessageSelectMenu, MessageActionRow } = require('discord.js')

module.exports = {
    name: 'dados',
    aliases: ['data', 'meusdados', 'mydata'],
    category: 'users',
    emoji: e.data,
    usage: 'data',
    description: 'Todos os seus dados presentes no banco de dados',

    run: async (client, message, args, prefix, MessageEmbed, Database) => {

        const msg = await message.reply(`${e.Loading} | Obtendo os dados necessários...`)

        let data = await Database.User.findOne({ id: message.author.id })

        if (!data)
            return message.channel.send(`${e.Deny} | Nenhum dado foi encontrado no meu banco de dados referente ao seu ID. Por favor, tente novamente.`).catch(() => { })

        let authorData = {
            _id: data?._id,
            Clan: data?.Clan || 'Nenhum',
            Likes: data?.Likes || 0,
            Xp: data?.Xp || 0,
            Level: data?.Level || 0,
            Transactions: data?.Transactions?.length || 0,
            Balance: data?.Balance || 0,
            AfkSystem: data?.AfkSystem ? 'Ativado' : 'Desativado',
            MixCount: data?.MixCount || 0,
            QuizCount: data?.QuizCount || 0,
            TicTacToeCount: data?.TicTacToeCount || 0,
            CompetitiveMemoryCount: data?.CompetitiveMemoryCount || 0,
            ForcaCount: data?.ForcaCount || 0,
            DailyCount: data?.DailyCount || 0,
            Cache: {
                ComprovanteOpen: data?.Cache?.ComprovanteOpen ? 'Aberto' : 'Fechado'
            },
            Color: {
                Perm: data?.Color?.Perm ? 'Obtem permissão de cores personalizadas' : 'Não possui permissão de cores personalizadas',
                Set: data?.Color?.Set ? data.Color.Set : '#246FE0 - Padrão'
            },
            Vip: {
                Permanent: data?.Vip?.Permanent ? 'Sim' : 'Não',
                Validate: client.Timeout(data?.Vip?.TimeRemaing, data?.Vip?.DateNow) ? 'Sim' : 'Não',
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
                    { label: 'Dados Basicos', value: 'basicData' }
                ])
            )

        initalPage()

        return msg.createMessageComponentCollector({
            filter: (interaction) => interaction.customId === 'data' && interaction.user.id === message.author.id,
            idle: 60000
        })
            .on('collect', async interaction => {
                interaction.deferUpdate().catch(() => { })

                switch (interaction.values[0]) {
                    case 'baseData': initalPage(); break
                    case 'basicData': basicData(); break
                    default: noDataFound(); break
                }

                return

            })
            .on('end', () => msg.edit({ content: `${e.Deny} | Comando cancelado.`, components: [] }))

        function initalPage() {
            return msg.edit({
                content: 'Base: Discord Basic Information',
                embeds: [
                    new MessageEmbed()
                        .setColor(client.blue)
                        .setTitle('Dados Base')
                        .setDescription('Esses são seus dados base do Discord, que por sua vez, todos tem acesso a eles.')
                        .addFields(
                            {
                                name: 'Identidade',
                                value: `Tag: ${message.author.tag}\nID: ${message.author.id}`
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
                        .setTitle('No data found!')
                        .setDescription('Nenhum dado foi encontrado nesta categoria. Use mais comandos e invista no seu perfil para adquirir mais dados.')
                        .setFooter({ text: `${message.author.username}'s Data`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })

                ],
                components: [typesComponents]
            }).catch(() => { })
        }

        function basicData() {

            const basicData = {
                idObject: authorData._id,
                Clan: authorData.Clan,
                Likes: authorData.Likes,
                Xp: authorData.Xp,
                Level: authorData.Level,
                Transactions: authorData.Transactions,
                Balance: authorData.Balance,
                AfkSystem: authorData.AfkSystem,
                MixCount: authorData.MixCount,
                QuizCount: authorData.QuizCount,
                TicTacToeCount: authorData.TicTacToeCount,
                CompetitiveMemoryCount: authorData.CompetitiveMemoryCount,
                ForcaCount: authorData.ForcaCount,
                DailyCount: authorData.DailyCount,
            }

            return msg.edit({
                content: 'Base: Basic Saphire\'s Database Information',
                embeds: [
                    new MessageEmbed()
                        .setColor(client.blue)
                        .setTitle('Dados Básicos')
                        .setDescription(`Aqui estão todos os seus dados básicos presentes na Saphire's Database.\n*Todos os outros dados se encontram nos comandos \`${prefix}perfil\` & \`${prefix}slot\`*`)
                        .addFields(
                            {
                                name: 'Info Database - Basic Stage',
                                value: `
                                Database's Location Document ID - \`${basicData.idObject}\`\n
                                
                                `
                            }
                        )
                        .setFooter({ text: `${message.author.username}'s Data`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })

                ],
                components: [typesComponents]
            }).catch(() => { })
        }

    }
}