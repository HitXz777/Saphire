const { f } = require('../../../database/frases.json')
const { Permissions, MessageActionRow, MessageSelectMenu } = require('discord.js')
const { DatabaseObj } = require('../../../Routes/functions/database')
const { e, config, N } = DatabaseObj

module.exports = {
    name: 'faq',
    aliases: ['support', 'suporte', 'saphire'],
    category: 'bot',
    emoji: `${e.SaphireHi}`,
    usage: '<faq>',
    description: 'Obtenha ajuda com a Saphire nas perguntas frequentes',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {
        if (request) return message.reply(`${e.Deny} | ${f.Request}${sdb.get(`Request.${message.author.id}`)}`)

        const link1Real = 'https://mpago.la/2YbvxZd'
        const LinkServidor = `${config.ServerLink}`
        
        const FaqEmbed = new MessageEmbed()
            .setColor('#246FE0')
            .setTitle(`${e.Info} Perguntas Frequentes`)
            .setURL(`https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=applications.commands%20bot`)
            .setDescription(`${e.SaphireHi} Oie! Aqui é mais ou menos uma Central de Atendimento ao Cliente. Mas não aquelas chatas, ok?\nAqui estão listadas todas as perguntas frequentes que fazem sobre a mim`)
            .addField(`${e.QuestionMark} | Eu não achei o que eu queria`, `Não tem problemas! Você pode acessar [meu servidor](${config.ServerLink}) e a minha equipe é capaz de te ajudar em tudo! E se for necessário, você pode contactar meu criador.`)

        const FaqPainel = new MessageActionRow()
            .addComponents(new MessageSelectMenu()
                .setCustomId('faq')
                .setPlaceholder('Perguntas Frequentes') // Mensagem estampada
                .addOptions([
                    {
                        label: 'Início',
                        value: 'home',
                    },
                    {
                        label: `A ${client.user.username} me mandou fechar uma request.`,
                        value: 'request'
                    },
                    {
                        label: 'Eu tenho um sugestão, Como eu envio?',
                        value: 'sugest'
                    },
                    {
                        label: `Como adicionar a ${client.user.username} no meu servidor?`,
                        value: 'invite'
                    },
                    {
                        label: 'Entrei temporariamente na Blacklist',
                        value: 'blacklist'
                    },
                    {
                        label: 'Como eu posso obter o vip?',
                        value: 'vip'
                    },
                    {
                        label: 'Como eu consigo os itens do slot que não podem ser comprados?',
                        value: 'itens'
                    },
                    {
                        label: 'Como eu posso pegar os títulos no perfil?',
                        value: 'titulos'
                    },
                    {
                        label: `A ${client.user.username} não responde aos meus comandos`,
                        value: 'nocommands'
                    },
                    {
                        label: `A ${client.user.username} relogou e não me devolveu meu dinheiro`,
                        value: 'moneyback'
                    },
                    {
                        label: 'Como posso divulgar meu servidor na comunidade da Saphire?',
                        value: 'div'
                    },
                    {
                        label: `Posso entrar pra ${client.user.username}'s Team?`,
                        value: 'st'
                    },
                    {
                        label: 'Eu fiz uma doação pra Saphire, como eu comprovo?',
                        value: 'comprovante'
                    },
                    {
                        label: `É possível deixa a economia da ${client.user.username} local?`,
                        value: 'ecolocal'
                    },
                    {
                        label: 'Fechar FAQ',
                        value: 'close'
                    },
                ])
            );

        return message.reply({ embeds: [FaqEmbed], components: [FaqPainel] }).then(msg => {

            const filtro = (interaction) => interaction.customId === 'faq' && interaction.user.id === message.author.id
            const collector = msg.createMessageComponentCollector({ filtro, idle: 60000 });

            collector.on('end', async (collected) => {
                sdb.delete(`Request.${message.author.id}`)
                msg.edit({ components: [] }).catch(() => { })
            })

            collector.on('collect', async (collected) => {
                if (collected.user.id !== message.author.id) return

                let valor = collected.values[0]
                collected.deferUpdate().catch(() => { })

                switch (valor) {
                    case 'home':
                        msg.edit({ embeds: [FaqEmbed] }).catch(() => { })
                        break;
                    case 'request':
                        Request()
                        break;
                    case 'sugest':
                        Sugest()
                        break;
                    case 'invite':
                        Invite()
                        break;
                    case 'blacklist':
                        Blacklist()
                        break;
                    case 'vip':
                        Vip()
                        break;
                    case 'itens':
                        Itens()
                        break;
                    case 'titulos':
                        Titulos()
                        break;
                    case 'comprovante':
                        Comprovante()
                        break;
                    case 'div':
                        Div()
                        break;
                    case 'nocommands':
                        NoCommands()
                        break;
                    case 'moneyback':
                        Moneyback()
                        break;
                    case 'st':
                        St()
                        break;
                    case 'ecolocal':
                        EconomyLocal()
                        break;
                    case 'close':
                        collector.stop()
                        break;
                    default:
                        collector.stop()
                        break;
                }
            })

            function Request() {

                const RequestEmbed = new MessageEmbed()
                    .setColor('#246FE0')
                    .setTitle(`${e.Info} | ${client.user.username} Requests`)
                    .setDescription(`O sistema de Request foi implementado pelo ${N.Rody} no dia 10/09/2021, visando o flood de requests envolvendo reações(emojis) e spamms de mensagem que acessam diretamente as configurações do Discord.`)
                    .addField(`${e.QuestionMark} O que é Request?`, `Requests são chamados que os Bots fazem diretamente ao Discord para executar alguma atividade, por exemplo, adicionar reações nas mensagens ou adicionar cargos.`)
                    .addField(`${e.Info} Aviso de Request Aberta`, `${e.Deny} | ${f.Request}\n \nSe você já viu a mensagem acima, indica que você tem alguma tarefa pendente/em aberto com a ${client.user.username}. Basta concluir o comando que você abriu que o bloqueio some.`)
                    .addField(`${e.QuestionMark} Eu fechei o comando mas continuo com o aviso`, `Não se preocupe. Em caso de "bugs" no fechamento do comando, por padrão, a ${client.user.username} exclui as requests abertas de 2 em 2 minutos.`)
                    .addField(`${e.QuestionMark} Tenho outra dúvida`, `Você pode acessar o \`${prefix}faq\` ou entrar no [meu servidor](${config.ServerLink})`)
                    .setFooter(`Em casos de bugs extremos, existe o comando "${prefix}del request" que deleta todas as requests.`)

                return msg.edit({ embeds: [RequestEmbed] }).catch(() => { })
            }

            function Sugest() {
                const SugestEmbed = new MessageEmbed()
                    .setColor('#246FE0')
                    .setTitle(`${e.CoolDoge} Teve uma ideia daora?`)
                    .setDescription('Você pode mandar na minha central de suporte')
                    .addField(':link: Olha o link:', `${e.SaphireFeliz} | Você pode mandar suas ideias no meu formulário! [Só clicar aqui](${config.GoogleForm})`)

                return msg.edit({ embeds: [SugestEmbed] }).catch(() => { })
            }

            function Invite() {

                const invite = client.generateInvite({ scopes: ['bot', 'applications.commands'], permissions: [Permissions.FLAGS.SEND_MESSAGES, Permissions.FLAGS.USE_EXTERNAL_EMOJIS, Permissions.FLAGS.ADD_REACTIONS, Permissions.FLAGS.ADMINISTRATOR, Permissions.FLAGS.USE_APPLICATION_COMMANDS] })
                const EmbedInvite = new MessageEmbed().setColor('#246FE0').setDescription(`${e.SaphireHi} [Clique aqui pra me convidar no seu servidor](${invite})`)

                return msg.edit({ embeds: [EmbedInvite] }).catch(() => { })
            }

            function Blacklist() {
                msg.edit({
                    embeds: [
                        new MessageEmbed()
                            .setColor('#246FE0')
                            .setTitle(`${e.Deny} | Blacklist`)
                            .setDescription('Caso você tenha entrado na blacklist, isso quer dizer que você abusou/forçou usar um comando que não é aberto ao público. Comandos testes ou em fase BETA. Por não ser um comando 100% pronto, a blacklist garante a segurança dos servidores adicionando os usuários que forçam a entrada em certos comandos.\n \nSe você ver um aviso dizendo "Este comando é de classe Moderador/Beta/Owner-Desenvolvedor" e você não puder usa-lo, não force a entrada do mesmo.')
                    ]
                }).catch(() => { })
            }

            function Vip() {

                const VipEmbed = new MessageEmbed()
                    .setColor('#FDFF00')
                    .setTitle(`${e.VipStar} VIP System ${client.user.username}`)
                    .setDescription(`*Antes de tudo, fique ciente de que o VIP System não dá previlégios ou vantagens a ninguém. O VIP System é uma forma de agradecimento e libera funções que não dão vantagens, apenas é legal tê-las, como bônus em alguns comandos.*`)
                    .addField(`${e.QuestionMark} O que eu ganho com o VIP?`, 'Acesso a comandos restritos para vips, que por sua vez, não dão vantagens em nenhum sistema.')
                    .addField(`${e.QuestionMark} Como obter o VIP?`, `Simples! Você pode fazer uma doação de [R$1,00](${link1Real}) no Mercado Pago ou fazer um PIX para o meu criador, basta digitar \`${prefix}donate\` para mais informações. A cada real doado, você ganha 1 semana de vip.`)
                    .addField(`${e.QuestionMark} Como comprovar o pagamento?`, `Simples! Entre no [meu servidor](${LinkServidor}) e use o comando \`${prefix}comprovante\`. Tudo será dito a você.`)
                    .addField(`${e.QuestionMark} Tem mais perguntas?`, `Entre no [meu servidor](${LinkServidor}) e tire suas dúvidas`)
                msg.edit({ embeds: [VipEmbed] }).catch(() => { })
            }

            function Itens() {

                const ItensEmbed = new MessageEmbed()
                    .setColor('#246FE0')
                    .setTitle('📋 Itens e suas funções')
                    .setDescription('Todos os dados de todos os itens aqui em baixo')
                    .addField('Itens Únicos', `Itens únicos são aqueles que você consegue comprar apenas um.\n \n🎣 \`Vara de Pesca\` Use para pescar \`${prefix}pescar\`\n🔫 \`Arma\` Use para assaltar e se proteger \`${prefix}assaltar @user\`\n${e.Balaclava} \`Balaclava\` Use no comando \`${prefix}crime\`\n${e.Helpier} \`Ajudante\` Te dá +5% de chance de sucesso no \`${prefix}crime\` por 7 dias.`)
                    .addField('Itens Consumiveis', `Itens consumiveis são aqueles que são gastos a cada vez que é usado\n \n⛏️ \`Picareta\` Use para minerar \`${prefix}cavar\`\n🪓 \`Machado\` Use na floresta \`${prefix}floresta\`\n🎫 \`Ticket\` Aposte na loteria \`${prefix}buy ticket\`\n🎟️ \`Fichas\` Use na roleta \`${prefix}roleta\`\n💌 \`Cartas\` Use para conquistar alguém \`${prefix}carta\`\n🥘 \`Comida\` Use na floresta\` ${prefix}buscar\`\n🪱 \`Iscas\` Use para pescar \`${prefix}pescar\`\n🥤 \`Água\` Use para minerar \`${prefix}minerar\``)
                    .addField('Itens Especiais', `Itens especiais são aqueles que são pegos na sorte nos mini-games\n \n${e.Star} \`Vip\` Mais informações no comando \`${prefix}vip\`\n${e.Loli} \`Loli\` Adquira na pesca \`${prefix}pescar\`\n🔪 \`Faca\` Adquira na pesca \`${prefix}pescar\`\n${e.Fossil} \`Fossil\` Adquira na mineração \`${prefix}minerar\`\n🦣 \`Mamute\` Adquira na mineração \`${prefix}minerar\`\n🐶 \`Brown\` Adquira na Floresta Cammum \`${prefix}floresta\`\n🥎 \`Bola do Brown\` Adquira na Floresta Cammum \`${prefix}floresta\`\n💊 \`Remédio do Velho Welter\` Adquira na Floresta Cammum \`${prefix}floresta\`\n${e.Doguinho} \`Cachorrinho/a\` Adquira no Castelo Heslow \`${prefix}medalha\`\n🏅 \`Medalha\` Adquira no Castelo Heslow \`${prefix}medalha\``)
                    .addField('Perfil', 'Itens de perfil são aqueles que melhora seu perfil\n \n⭐ `Estrela` Estrelas no perfil')
                    .addField('Itens Coletaveis', 'Itens coletaveis são aqueles que você consegue nos mini-games, você pode vende-los para conseguir mais dinheiro.\n \n🍤 `Camarões` - Baú do Tesouro `' + prefix + 'pescar`\n🐟 `Peixes` - Baú do Tesouro `' + prefix + 'pescar`\n🌹 `Rosas` - Floresta Cammum `' + prefix + 'floresta`\n🍎 `Maças` - Floresta Cammum `' + prefix + 'floresta`\n🦴 `Ossos` - Mineração `' + prefix + 'minerar`\n🪨 `Minérios` - Mineração `' + prefix + 'minerar`\n💎 `Diamantes` - Mineração `' + prefix + 'minerar`')
                    .addField('Permissões', `Permissões libera comandos bloqueados\n \n🔰 \`Título\` Mude o título no perfil \`${prefix}titulo <Novo Título>\`\n🎨 \`Cores\` Mude as cores das suas mensagens \`${prefix}setcolor <#CódigoHex>\``)

                msg.edit({ embeds: [ItensEmbed] }).catch(() => { })
            }

            function Titulos() {
                const TitulosEmbed = new MessageEmbed()
                    .setColor('#246FE0')
                    .setTitle('Títulos')
                    .setDescription(`${e.SaphireObs} Os títulos são bem díficeis de conseguir. Atualmente, os membros que possuem títulos não passam de 10. Os títulos pode ser obtidos estando em primeiro lugar do ranking, participando de eventos no [servidor principal](${config.ServerLink}) ou sendo da parte da ${client.user.username}'s Team.`)
                msg.edit({ embeds: [TitulosEmbed] }).catch(() => { })
            }

            function NoCommands() {

                const NoCommandsEmbed = new MessageEmbed()
                    .setColor('#246FE0')
                    .setTitle(`${e.SaphireCry} | Aaah nããão!! A ${client.user.username} não responde meus comandos.`)
                    .setDescription('Calma calma jovem ser, não se preocupe!')
                    .addFields(
                        {
                            name: `${e.Loading} Rebooting...`,
                            value: `A ${client.user.username} está relogando. Ou pra adicionar coisas novas ou pra corrigir. Mas nunca passa de 10 minutos. ||Ou não deveria... O-O||`
                        },
                        {
                            name: `${client.user.username} offline`,
                            value: `Manutenções que envolvem a parte crítica da ${client.user.username} são feitas com ela offline. Para evitar bugs extremos e proteger o banco de dados`
                        },
                        {
                            name: `${client.user.username}'s Blacklist`,
                            value: 'Se você foi tão mal a ponto de entrar na blacklist... Não preciso nem responder, não é?'
                        }
                    )

                msg.edit({ embeds: [NoCommandsEmbed] }).catch(() => { })
            }

            function Moneyback() {
                const MoneybackEmbed = new MessageEmbed()
                    .setColor('#246FE0')
                    .setTitle(`${client.user.username} SAPHIRE BANDIDAAAA`)
                    .setDescription('Use o mesmo comando que o seu dinheiro está no cache do comando. O Sistema de Proteção da Saphire garante o extorno do dinheiro ao usar o comando novamente.')
                msg.edit({ embeds: [MoneybackEmbed] }).catch(() => { })
            }

            function Div() {
                const DivEmbed = new MessageEmbed()
                    .setColor('#246FE0')
                    .setTitle(`${e.SaphireFeliz} Comunidade Saphiry`)
                    .setDescription(`É fácil fácil! Configure seu servidor usando a Saphire e mostre no [meu servidor](${config.ServerLink}). A minha equipe adicionará seu servidor a minha lista de comunidades.`)
                msg.edit({ embeds: [DivEmbed] }).catch(() => { })
            }

            function St() {
                const StEmbed = new MessageEmbed()
                    .setDescription(`**NOP!** A ${client.user.username}'s Team é uma equipe restrita onde só entram pessoas convidadas pela própria ${client.user.username}'s Team.\nOu seja, se você não recebeu o convite, você não pode entrar.`)
                msg.edit({ embeds: [StEmbed] }).catch(() => { })
            }

            function Comprovante() {
                const ComprovanteEmbed = new MessageEmbed()
                    .setTitle(`${e.SaphireObs} Comprovante`)
                    .setDescription(`Isso é MUITO fácil! Primeiro entre no [meu servidor](${config.ServerLink}) e use o comando \`${prefix}comprovante\` em qualquer canal. O resto vai ser dito a você.`)
                msg.edit({ embeds: [ComprovanteEmbed] }).catch(() => { })
            }

            function EconomyLocal() {
                const EconomyLocalEmbed = new MessageEmbed()
                    .setTitle(`${e.MoneyWings} Economia Local`)
                    .setDescription(`Não. Não é possível deixar a economia da ${client.user.username} local. Ela foi projetada em um sistema global. Foi maal, vou ficar te devendo essa.`)
                msg.edit({ embeds: [EconomyLocalEmbed] }).catch(() => { })
            }

        })
    }
}