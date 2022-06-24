
const { readdirSync } = require("fs"),
    Colors = require('../../../modules/functions/plugins/colors')

module.exports = {
    name: 'help',
    description: '[bot] Central de ajuda',
    dm_permission: false,
    type: 1,
    options: [],
    async execute({ interaction: interaction, client: client, database: Database, emojis: e, guildData: guildData, clientData: clientData }) {

        const { Config: config } = Database,
            prefix = guildData?.Prefix || client.prefix,
            { user } = interaction,
            color = await Colors(user.id)

        let SaphireInviteLink = `https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=applications.commands%20bot`,
            ghostServer = client.guilds.cache.get(config.saphiresHome),
            serverInvite = ghostServer ? ` ou quem sabe entrar na [${ghostServer.name}](${config.MoonServerLink}) para se divertir?` : '',
            PrincipalEmbed = {
                color: color,
                title: `${e.BlueHeart} Centralzinha de Ajuda da ${client.user.username}`,
                url: SaphireInviteLink,
                image: { url: 'https://media.discordapp.net/attachments/893361065084198954/939681589724598282/teste.png?width=720&height=223' },
                fields: [
                    {
                        name: `${e.SaphireTimida} ${client.user.username}`,
                        value: `Você pode [me adicionar](${SaphireInviteLink}) no seu servidor e também pode entrar no [meu servidor de suporte](${config.SupportServerLink}) pra tirar algumas dúvidas${serverInvite}`
                    },
                    {
                        name: `⭐ Comandos movidos para Slash Commands`,
                        value: 'Vários comandos estão sendo movidos para Slash Commands por causa das quantidades de sub-comandos que estes comandos portavam. No Slash Commands, os sub-comandos ficam visíveis e muito mais fácil de mexer com os comandos.'
                    }
                ],
                footer: { text: 'Este painel se fechará após 1 minuto de inatividade' }
            },
            painel = {
                type: 1,
                components: [{
                    type: 3,
                    custom_id: 'menu',
                    placeholder: 'Escolher uma categoria',
                    options: [
                        {
                            label: 'Painel Inicial',
                            description: 'Painel Principal',
                            emoji: `${e.BlueHeart}`,
                            value: 'PainelPrincipal',
                        },
                        {
                            label: 'Admin',
                            description: `${client.user.username}\'s Team Administrator`,
                            emoji: `${e.Admin}`,
                            value: 'administration',
                        },
                        {
                            label: 'Bot, vulgo Eu',
                            description: 'Todos os comandos ligados a euzinha aqui',
                            emoji: `${e.Gear}`,
                            value: 'bot',
                        },
                        {
                            label: 'Economia',
                            description: 'Economy Global System',
                            emoji: `${e.PandaProfit}`,
                            value: 'economy',
                        },
                        {
                            label: 'Games/Jogos',
                            description: 'Que tal só se divertir?',
                            emoji: '🎮',
                            value: 'games',
                        },
                        {
                            label: 'Gifs',
                            description: 'Interagir com os outros é muito legal',
                            emoji: '🖼',
                            value: 'gifs',
                        },
                        {
                            label: 'Moderação/Administração',
                            description: 'Comandos só pros Mod/Adm de plantão',
                            emoji: `${e.ModShield}`,
                            value: 'moderation',
                        },
                        {
                            label: 'Perfil',
                            description: 'Comandos do perfil pessoal de cada um',
                            emoji: '👤',
                            value: 'perfil',
                        },
                        {
                            label: 'Random',
                            description: 'Pensa numas coisas aleatórias',
                            emoji: `${e.CoolDoge}`,
                            value: 'random',
                        },
                        {
                            label: 'Utilidades',
                            description: 'Comandos uteis',
                            emoji: `${e.SaphireOk}`,
                            value: 'util',
                        },
                        {
                            label: 'Fechar o painel de ajuda',
                            description: 'Desativa o painel rápido',
                            emoji: `${e.Deny}`,
                            value: 'Close',
                        }
                    ]
                }]
            }

        const msg = await interaction.reply({
            embeds: [PrincipalEmbed],
            components: [painel],
            fetchReply: true
        }),
            collector = msg.createMessageComponentCollector({
                filtro: (int) => int.customId === 'menu' && int.user.id === user.id,
                idle: 60000
            })

                .on('collect', async int => {

                    let value = int.values[0]
                    await int.update({})

                    if (value === 'PainelPrincipal') return msg.edit({ embeds: [PrincipalEmbed], components: [painel] }).catch(() => { })
                    if (value === 'Close') return collector.stop()

                    let values = await readdirSync('./src/slashCommands/')

                    if (values.includes(value?.toLowerCase()))
                        return HelpPainel(`${value}`)

                    return await interaction.followUp({
                        content: `${e.QuestionMark} | Algo estranho aconteceu.`,
                        ephemeral: true
                    })

                    async function HelpPainel(x) {

                        let cots = [], catts = []

                        readdirSync("./src/slashCommands/").forEach(dir => {
                            if (dir.toLowerCase() !== x.toLowerCase()) return
                            const commands = readdirSync(`./src/slashCommands/${dir}/`).filter(file => file.endsWith(".js"))

                            const cmds = commands.map(command => {
                                let file = require(`../../slashCommands/${dir}/${command}`),
                                    name = file.name?.replace(".js", ""),
                                    des = client.slashCommands.get(name)?.description || "Sem descrição",
                                    format = `\`/${name}\``

                                if (!name) {
                                    format = '\`Comando indisponível\`'
                                    des = '---------------------------------'
                                }

                                return { cname: format, des: des }
                            })

                            cmds.map(co => catts.push({ name: `${cmds.length === 0 ? "Em andamento." : co.cname}`, value: co.des }))
                            cots.push(dir.toLowerCase())
                        })

                        if (cots.includes(x.toLowerCase()))
                            return msg.edit({
                                embeds: [{ color: color, fields: catts }],
                                components: [painel]
                            }).catch(() => { })

                        return msg.edit({
                            content: `${e.Deny} | Nada foi encontrado.`,
                            embeds: []
                        }).catch(() => { })
                    }

                })

                .on('end', () => {

                    let embed = msg.embeds[0]
                    if (!embed) return
                    embed.color = client.red
                    embed.footer = { text: 'Comando cancelado.' }

                    return msg.edit({ embeds: [embed], components: [] }).catch(() => { })
                })

        return

    }
}