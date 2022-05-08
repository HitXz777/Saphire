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
            id: data?.id,
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
            Timeouts: {
                Bug: data?.Timeouts?.Bug || 0,
                Daily: data?.Timeouts?.Daily || 0,
                Cu: data?.Timeouts?.Cu || 0,
                Roleta: data?.Timeouts?.Roleta || 0,
                Esmola: data?.Timeouts?.Esmola || 0,
                Work: data?.Timeouts?.Work || 0,
                ImagesCooldown: data?.Timeouts?.ImagesCooldown || 0,
                ServerIdeia: data?.Timeouts?.ServerIdeia || 0,
                Letter: data?.Timeouts?.Letter || 0,
                Confess: data?.Timeouts?.Confess || 0,
                Loteria: data?.Timeouts?.Loteria || 0,
                LevelTrade: data?.Timeouts?.LevelTrade || 0,
                LevelImage: data?.Timeouts?.LevelImage || 0,
                Cantada: data?.Timeouts?.Cantada || 0,
                Bitcoin: data?.Timeouts?.Bitcoin || 0,
                Porquinho: data?.Timeouts?.Porquinho || 0,
                Rep: data?.Timeouts?.Rep || 0,
            },
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

                return {
                    'baseData': initalPage(),
                    'basicData': basicData()
                }[interaction.values[0]] || noDataFound()

                return
            })
            .on('end', () => msg.edit({ content: `${e.Deny} | Comando cancelado.`, components: [] }))

        function initalPage() {
            return msg.edit({
                content: 'Base One',
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
                content: 'No Data',
                embeds: [
                    new MessageEmbed()
                        .setColor(client.blue)
                        .setTitle('Nenhum dado encontrado nesta categoria')
                        .setFooter({ text: `${message.author.username}'s Data`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })

                ],
                components: [typesComponents]
            }).catch(() => { })
        }

        function basicData() {

            const basicData = {
                idObject: authorData._id,
                Clan: author
            }

            return msg.edit({
                content: 'No Data',
                embeds: [
                    new MessageEmbed()
                        .setColor(client.blue)
                        .setTitle('Nenhum dado encontrado nesta categoria')
                        .setFooter({ text: `${message.author.username}'s Data`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })

                ],
                components: [typesComponents]
            }).catch(() => { })
        }

        function getStarsCount() {

            let stars = [
                Um = data?.Perfil?.Estrela?.Um ? 1 : false,
                Dois = data?.Perfil?.Estrela?.Dois ? 2 : false,
                Tres = data?.Perfil?.Estrela?.Tres ? 3 : false,
                Quatro = data?.Perfil?.Estrela?.Quatro ? 4 : false,
                Cinco = data?.Perfil?.Estrela?.Cinco ? 5 : false,
                Seis = data?.Perfil?.Estrela?.Seis ? 6 : false
            ]

            for (let i = 0; i < 6; i++)
                if (stars[i] > 0) return stars[i]

            return 0
        }

    }
}