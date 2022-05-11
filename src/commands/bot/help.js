const
    { readdirSync } = require("fs"),
    { MessageSelectMenu, MessageActionRow } = require("discord.js"),
    { DatabaseObj: { e, config } } = require("../../../modules/functions/plugins/database")

module.exports = {
    name: 'help',
    aliases: ['comandos', 'comando', 'commands', 'h', 'ajuda', 'socorro', 'info', 'comands', 'cmd', 'cmds'],
    usage: '<help> [NomeDoComando]',
    category: 'bot',
    ClientPermissions: ['EMBED_LINKS'],
    emoji: `${e.Info}`,
    description: 'Central de Ajuda',

    run: async (client, message, args, prefix, MessageEmbed, Database) => {

        let SaphireInviteLink = `https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=applications.commands%20bot`,
            PrincipalEmbed = new MessageEmbed()
                .setColor('#246FE0')
                .setTitle(`${e.BlueHeart} Centralzinha de Ajuda da ${client.user.username}`)
                .setURL(`${SaphireInviteLink}`)
                .setImage('https://media.discordapp.net/attachments/893361065084198954/939681589724598282/teste.png?width=720&height=223')
                .setDescription(`Oiiii!!! Acho que já sabe, mas eu sou a Saphire Moon, muito prazer! ${e.SaphireTimida}\nAqui estão todas as informações que você precisa sobre os meus comandos! As que você não achar, você vai encontrar na [Docs Saphire](${config.SaphiDocs})\nMas antes de eu apresentar tudo, quero que conheça minha pequena história!\n \nLá no começo de tudo, eu era apenas uma faísca no meio da poeira do universo, não tinha muita coisa na minha memória. Então, com o tempo eu fui evoluindo e crescendo, mas teve um dia que aconteceu algo bem ruim! ${e.SaphireCry} O universo foi resetado.\nEu sofri e ainda sofro muitas mudanças... Estou sendo recriada, do zero. A cada dia, meu criador me mostra e me ensina algo novo, e com a ajuda de milhares de pessoas em centenas de servidores brincando comigo, eu aprendo e aprendo cada vez mais. Hoje, eu tenho ${client.commands.size || 0} comandos ativos e venho ganhando comandos novos quase todos os dias. E você, o que tem pra me ensinar hoje? ${e.SaphireLove}`)
                .addField(`${e.Info} Perguntas frequentes`, `Está com alguma dúvida? \`${prefix}faq\``)
                .addField('🛰️ Global System Notification', `Ative o \`${prefix}logs\` no servidor e aproveite do meu sistema avançado de notificação. Eu vou te avisar desde os bans/kicks até Autoroles com permissões editadas.`)
                .addField(`${e.SaphireTimida} Saphire`, `Você pode [me adicionar](${SaphireInviteLink}) no seu servidor e também pode entrar no [meu servidor](${config.ServerLink}) pra interagir ou tirar algumas dúvida.`)
                .addField(`${e.CoroaDourada} Premium Stage`, `Tem interesse em desbloquear comandos únicos? Use \`${prefix}premium\` e descubra mais.`)
                .addField('⭐ Atualizações', 'Acesse a segunda aba do painel de ajuda e fique por dentro de tudo.')
                .addField(`📄 Documentação`, `https://saphire.gitbook.io/saphire/\n*obs: A documentação da Saphire está incompleta.*`)
                .setFooter({ text: 'Este painel se fechará após 1 minuto de inatividade' }),         
                // .addField(`${e.TopGG} Top.gg`, `[Votar](${config.TopGGLink}/vote) na ${client.user.username}.`),
            painel = new MessageActionRow()
                .addComponents(new MessageSelectMenu()
                    .setCustomId('menu')
                    .setPlaceholder('Escolher uma categoria') // Mensagem estampada
                    .addOptions([
                        {
                            label: 'Painel Inicial',
                            description: 'Painel Principal',
                            emoji: `${e.BlueHeart}`,
                            value: 'PainelPrincipal',
                        },
                        {
                            label: 'Atualizações',
                            description: 'Atualizações que eu recebi',
                            emoji: '⭐',
                            value: 'att',
                        },
                        {
                            label: 'AFK',
                            description: 'Afk Global System',
                            emoji: `${e.Afk}`,
                            value: 'afk',
                        },
                        {
                            label: 'Admin',
                            description: 'Saphire\'s Team Administrator',
                            emoji: `${e.Admin}`,
                            value: 'admin',
                        },
                        {
                            label: 'Animes',
                            description: 'Todo mundo gosta de animes, não é?',
                            emoji: `${e.NezukoDance}`,
                            value: 'animes',
                        },
                        {
                            label: 'Bot, vulgo Eu',
                            description: 'Todos os comandos ligados a euzinha aqui',
                            emoji: `${e.Gear}`,
                            value: 'bot',
                        },
                        {
                            label: 'Configurações',
                            description: 'Comandos de configurações do servidor/usuário',
                            emoji: `${e.On}`,
                            value: 'config',
                        },
                        {
                            label: 'Economia 1',
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
                            label: 'Interação',
                            description: 'Interagir com os outros é muito legal',
                            emoji: '🫂',
                            value: 'interactions',
                        },
                        {
                            label: 'Pros Usuários',
                            description: 'Comandos dos usuários',
                            emoji: `${e.RedStar}`,
                            value: 'users',
                        },
                        {
                            label: 'Moderação/Administração',
                            description: 'Comandos só pros Mod/Adm de plantão',
                            emoji: `${e.ModShield}`,
                            value: 'moderation',
                        },
                        {
                            label: 'Desenvolvedor',
                            description: 'Comandos exclusivos do meu criador/desenvolvedor',
                            emoji: `${e.OwnerCrow}`,
                            value: 'owner',
                        },
                        {
                            label: 'Perfil',
                            description: 'Comandos do perfil pessoal de cada um',
                            emoji: '👤',
                            value: 'perfil',
                        },
                        {
                            label: 'Vip',
                            description: 'Sistema VIP',
                            emoji: `${e.VipStar}`,
                            value: 'vip'
                        },
                        {
                            label: 'Random',
                            description: 'Pensa numas coisas aleatórias',
                            emoji: `${e.CoolDoge}`,
                            value: 'random',
                        },
                        {
                            label: 'Reações/Emoções',
                            description: 'Mostre ao mundo como se sente',
                            emoji: '😁',
                            value: 'reactions',
                        },
                        {
                            label: 'Manipulação de Imagens',
                            description: 'Manipule imagens com os membros',
                            emoji: '🖼️',
                            value: 'images',
                        },
                        {
                            label: 'Servidor',
                            description: 'Comandos fechados só para o servidor',
                            emoji: `${e.PlanetServer}`,
                            value: 'servidor',
                        },
                        {
                            label: 'Utilidades',
                            description: 'Comandos uteis para qualquer um, garanto',
                            emoji: `${e.QuestionMark}`,
                            value: 'util',
                        },
                        {
                            label: 'Premium Stage',
                            description: 'Comandos exclusivos para Servidores Premium',
                            emoji: `${e.CoroaDourada}`,
                            value: 'premium',
                        },
                        {
                            label: 'Fechar o painel de ajuda',
                            description: 'Desativa o painel rápido',
                            emoji: `${e.Deny}`,
                            value: 'Close',
                        },
                    ])
                )

        if (args[0]) return HelpWithArgs(args[0])

        const msg = await message.reply({ embeds: [PrincipalEmbed], components: [painel] }),
            collector = msg.createMessageComponentCollector({
                filtro: (interaction) => interaction.customId === 'menu' && interaction.user.id === message.author.id,
                idle: 60000
            });

        collector.on('end', () => msg.edit({ components: [] }).catch(() => { }))

        collector.on('collect', async (collected) => {
            if (collected.user.id !== message.author.id) return

            let valor = collected.values[0]
            collected.deferUpdate().catch(() => { })

            if (valor === 'PainelPrincipal') return msg.edit({ embeds: [PrincipalEmbed], components: [painel] }).catch(() => { })
            if (valor === 'afk') return Afk()
            if (valor === 'att') return atualization()
            if (valor === 'Close') return collector.stop()

            let values = ['admin', 'premium', 'animes', 'bot', 'config', 'economy', 'games', 'users', 'images', 'interactions', 'moderation', 'owner', 'perfil', 'vip', 'random', 'reactions', 'servidor', 'util']

            if (values.includes(valor?.toLowerCase()))
                return HelpPainel(`${valor}`)

            return message.reply(`${e.QuestionMark} | Algo estranho aconteceu.`)

            function Afk() {
                return msg.edit({
                    embeds: [
                        new MessageEmbed()
                            .setColor('#246FE0')
                            .setTitle(`${e.Planet} Afk Global System`)
                            .setDescription('Utilize este comando para avisar que você está offline.')
                            .addFields(
                                {
                                    name: '🏠 Servidor',
                                    value: 'Avisarei apenas neste servidor que você está offline.'
                                },
                                {
                                    name: '🌎 Global',
                                    value: 'Avisarei em todos os servidores que você está offline.'
                                },
                                {
                                    name: '❌ Cancelar',
                                    value: 'Cancela o comando.'
                                },
                                {
                                    name: `${e.Warn} | Atenção!`,
                                    value: '> 1. O \`Modo Global\` é desativado quando você mandar uma mensagem em qualquer servidor comigo.\n> 2. O \`Modo Servidor\` será desativado apenas se você mandar mensagem no servidor em que o sistema foi ativado.\n> 3. O \`Modo Global\` sobre põe o modo local.'
                                }
                            )
                    ],
                    components: [painel]
                }).catch(() => { })
            }

            async function HelpPainel(x) {

                let cots = [],
                    catts = [],

                    clientData = await Database.Client.findOne({ id: client.user.id }, 'ComandosBloqueados'),
                    cmdsBlocked = clientData.ComandosBloqueados || [],
                    formatedBlock = cmdsBlocked.map(data => data.cmd)?.flat() || []

                readdirSync("./src/commands/").forEach(dir => {
                    if (dir.toLowerCase() !== x.toLowerCase()) return
                    const commands = readdirSync(`./src/commands/${dir}/`).filter(file => file.endsWith(".js"))

                    const cmds = commands.map(command => {
                        let file = require(`../../commands/${dir}/${command}`),
                            name = file.name?.replace(".js", ""),
                            des = client.commands.get(name)?.description || "Sem descrição",
                            emo = client.commands.get(name)?.emoji || 'X',
                            format = `\`${prefix}${name}\``,
                            correctNameByAlias = formatedBlock.map(data => client.aliases.get(`${data}`))

                        if (correctNameByAlias.includes(name)) {
                            emo = '🔒'
                            des = 'Comando bloqueado pelo meu criador ou por algum bug.'
                        }

                        if (!name) {
                            emo = '🔴'
                            format = '\`Comando indisponível\`'
                            des = '---------------------------------'
                        }

                        return { cname: `${emo || '❔'} ${format}`, des: des }
                    })
                    cmds.map(co => catts.push({ name: `${cmds.length === 0 ? "Em andamento." : co.cname}`, value: co.des }))

                    cots.push(dir.toLowerCase())
                })

                if (cots.includes(x.toLowerCase()))
                    return msg.edit({
                        embeds: [
                            new MessageEmbed()
                                .setColor('#246FE0')
                                .setTitle(`Classe: ${x.charAt(0).toUpperCase() + x.slice(1)}`)
                                .setDescription(`Use \`${prefix}help [comando]\` para obter mais informações.`)
                                .addFields(catts)
                        ],
                        components: [painel]
                    }).catch(() => { })

                return message.reply(`${e.Deny} | Nada foi encontrado.`)
            }

            function atualization() {
                return msg.edit({
                    embeds: [
                        new MessageEmbed()
                            .setColor(client.blue)
                            .setTitle(`⭐ Notas da Última Atualização`)
                            .setDescription(`Aqui ficam informações da última atualização que eu recebi. Caso queria ver as atualizações antigas, acesse [meu servidor](${config.ServerLink}).`)
                            .addFields(
                                {
                                    name: '🆕 Novidades',
                                    value: `**${prefix}zeppelin** - Novo comando de apostas\n**${prefix}dados** - Consulte seus dados diretamente do banco de dados\n**${prefix}banner** - Faixa dos membros Nitro\n**${prefix}avatar** - Um pequeno upgrade\n**${prefix}signo** - Rework para melhor usabilidaade`
                                },
                                {
                                    name: '⛔ Remoção',
                                    value: '*Nada foi removido*'
                                },
                                {
                                    name: `${e.bug} Bugs`,
                                    value: `QUIZ COMMAND - Logical Skip End - ${e.Check} Fixed | \`Bug Found At: 03/03/2022\`\nLEVEL COMMAND - Infinity Loading - ${e.Check} Fixed | \`Bug Found At: 09/05/2022\``
                                }
                            )
                    ],
                    components: [painel]
                }).catch(() => { })
            }

        })

        function HelpWithArgs(x) {
            const command = client.commands.get(x.toLowerCase()) || client.commands.find((c) => c.aliases && c.aliases.includes(x.toLowerCase()))
            if (!command) { return message.reply(`${e.Deny} | Comando inválido! Use \`${prefix}help\` para todos os comandos.`) }

            return message.reply({
                embeds: [
                    new MessageEmbed()
                        .setColor('#246FE0')
                        .setTitle(`Detalhes do Comando: ${command.name ? `${command.name}` : "Sem nome definido."}`)
                        .addFields(
                            {
                                name: 'Comando:',
                                value: command.name ? `\`${prefix}${command.name}\`` : "Sem nome definido.",
                                inline: true
                            },
                            {
                                name: 'Atalhos',
                                value: command.aliases ? `\`${command.aliases?.map(data => `${prefix}${data}`)?.join(', ')}\`` : "Sem atalhos definido.",
                                inline: true
                            },
                            {
                                name: 'Uso',
                                value: command.usage ? `\`${command.usage}\`` : 'Nenhum dado definido'
                            },
                            {
                                name: 'Descrição',
                                value: command.description ? command.description : "Sem descrição definida"
                            }

                        )
                ]
            })
        }
    }
}