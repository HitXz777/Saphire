const { e } = require('../../../database/emojis.json')
const { Permissions } = require('discord.js')
const { ServerDb } = require('../../../Routes/functions/database')

module.exports = {
    name: 'channel',
    aliases: ['setchannel', 'canal', 'channels'],
    category: 'moderation',
    UserPermissions: ['MANAGE_CHANNELS'],
    ClientPermissions: ['MANAGE_CHANNELS'],
    emoji: `${e.ModShield}`,
    usage: '<channel>',
    description: 'Configure os canais rapidamente',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        if (!message.guild.me.permissions.has(Permissions.FLAGS.MANAGE_CHANNELS)) return message.reply(`${e.SadPanda} | Eu preciso da permissão \`GERENCIAR CANAIS\` para executar este comando.`)

        const noargs = new MessageEmbed()
            .setColor('#246FE0')
            .setTitle('🛠️ Gerenciamento de Canais')
            .setDescription('Com este comando você pode gerenciar os canais rapidamente.\n<opicional>')
            .addField('Mude o Nome', `\`${prefix}channel name <#canal> NomeDoCanal\``)
            .addField('Mude o Tópico', `\`${prefix}channel topic <#canal> O novo tópico irado do canal\``)
            .addField('Crie Canais', `\`${prefix}channel create text/voice NomeDoCanal\``)
            .addField('Delete Canais', `\`${prefix}channel delete <#canal>\``)
            .addField('Clone', `\`${prefix}channel clone <#canal>\``)
            .addField('Pegue o ID', `\`${prefix}channel id <#canal>\``)
            .addField('Crie um convite', `\`${prefix}channel invite <#canal>\``)
            .addField('Sincrozine as permissiões com a categoria', `\`${prefix}channel sync [#canal]\``)
            .addField('Crie canais Farming', `\`${prefix}channel farm buscar/pescar/mine\``)
            .addField('Crie o canal de level up', `\`${prefix}channel levelup\``)

        const canal = message.mentions.channels.first() || message.channel
        if (!args[0]) return message.reply({ embeds: [noargs] })

        switch (args[0]) {
            case 'name': case 'nome':
                SetName();
                break;
            case 'tópico': case 'topic': case 'topica':
                canal.isText() ? SetTopic() : message.reply(`${e.Deny} | Canais de voz não possuem tópicos.`)
                break;
            case 'create': case 'criar':
                CreateChannel()
                break;
            case 'delete': case 'deletar':
                ChannelDelete()
                break;
            case 'clone': case 'clonar': case 'duplicar':
                ChannelClone()
                break;
            case 'id':
                ChannelId()
                break;
            case 'invite': case 'convite': case 'inv': case 'link':
                canal.permissionsFor(message.guild.me).has(Permissions.FLAGS.CREATE_INSTANT_INVITE) ? ChannelInvite() : message.reply(`${e.Deny} | Eu não tenho permissão para criar convites neste canal.`)
                break;
            case 'sync': case 'sincronize': case 'sincronizar':
                Sync()
                break;
            case 'farm': case 'farmin': case 'farming':
                Farm()
                break;
            case 'level': case 'levelchannel': case 'xpchannel': case 'levelup':
                LevelChannel()
                break;
            default: message.reply(`${e.Deny} | **${args[0]}** | Não está na lista de sub-comandos do comando \`${prefix}channel\`. <- Use este comando que te mando tudinho sobre o comando.`)
                break;
        }

        function Sync() {
            if (args[2]) return message.reply(`${e.Deny} | Não diga nada além do canal. Mencione o #canal ou digite \`${prefix}sync\` no canal no qual deseja sincronizar com sua categoria.`)

            if (!canal.parent) return message.reply(`${e.Deny} | Este canal não está em nenhuma categoria.`)
            if (canal.permissionsLocked === true) return message.reply(`${e.Check} | Este canal já está sincronizado.`)

            canal.lockPermissions().then(() => {
                return message.reply(`${e.Check} | Prontinho, o canal ${canal} foi sincronizado com as permissões da categoria **${canal.parent.name.toUpperCase()}**`)
            }).catch(err => {
                return message.reply(`${e.Warn} | Ocorreu um erro na execução da sincronização.\n\`${err}\``)
            })
        }

        function ChannelInvite() {
            if (!message.member.permissions.has(Permissions.FLAGS.CREATE_INSTANT_INVITE)) return message.reply(`${e.Deny} | Você não tem a permissão "Criar convite".`)
            canal.createInvite().then(invite => {
                return message.reply(`${e.Check} | Ok ok, está aqui o link.\nhttps://discord.gg/${invite.code}`)
            }).catch(err => {
                return message.channel.send(`${e.Deny} | Eu não tenho permissão para criar convites.`)
            });
        }

        function CreateChannel() {
            if (!args[1]) return message.reply(`${e.Deny} | Por favor, siga o formato correto.\n\`${prefix}channel create text/voice NomeDoCanal\``)

            if (['texto', 'text'].includes(args[1])) {

                const NomeDoCanal = args.slice(2).join(" ").toLowerCase()
                if (!NomeDoCanal) return message.reply(`${e.Deny} | Você se esqueceu do nome do canal.\n\`${prefix}channel create text NomeDoCanal\``)
                if (NomeDoCanal.length > 40) return message.reply(`${e.Deny} | O nome do canal não pode ultrapassar **40 caracteres**`)

                message.guild.channels.create(NomeDoCanal, {
                    type: 'GUILD_TEXT',
                    topic: `Para definir um tópico, use ${prefix}channel topic <O novo tópico>`
                }).then(channel => {
                    return message.reply(`${e.Check} | Canal de texto criado com sucesso. | ${channel}`)
                }).catch(err => {
                    if (err.code === 30013)
                        return message.reply(`${e.Info} | O servidor atingiu o limite de **500 canais**.`)
                    return message.channel.send(`${e.Deny} | Ocorreu um erro ao criar um novo canal.\n\`${err}\``)
                })

            } else if (['voice', 'voz'].includes(args[1])) {

                const NomeDoCanal = args.slice(2).join(" ").toLowerCase()
                if (!NomeDoCanal) { return message.reply(`${e.Deny} | Você se esqueceu do nome do canal.\n\`${prefix}channel create voice NomeDoCanal\``) }
                if (NomeDoCanal.length > 40) { return message.reply(`${e.Deny} | O nome do canal não pode ultrapassar **40 caracteres**`) }
                message.guild.channels.create(NomeDoCanal, {
                    type: 'GUILD_VOICE',
                    reason: `Canal criador por: ${message.author.tag}`,
                }).then(channel => {
                    return message.reply(`${e.Check} | Canal de voz criado com sucesso. ${channel}`)
                }).catch(err => {
                    return message.channel.send(`${e.Deny} | Ocorreu um erro ao criar um novo canal.\n\`${err}\``)
                })

            } else {
                return message.reply(`${e.Deny} | Por favor, siga o formato correto.\n\`${prefix}channel create text/voice NomeDoCanal\``)
            }
        }

        function ChannelId() {
            return message.reply(`${e.Info} | ${canal.name} | :id: *\`${canal.id}\`*`)
        }

        function ChannelClone() {
            canal.clone().then(channel => {
                return message.channel.send(`${e.Check} | Feito! O canal tá aqui: ${channel}`)
            }).catch(err => {
                return message.channel.send(`${e.Deny} | Houve um erro ao clonar o canal.\n\`${err}\``)
            })
        }

        function ChannelDelete() {
            if (request) return message.reply(`${e.Deny} | ${f.Request}${sdb.get(`Request.${message.author.id}`)}`)
            if (args[2]) return message.reply(`${e.Deny} | Tenta usar assim.\n\`${prefix}channel delete [#Canal(opcional)]\``)

            return message.reply(`${e.QuestionMark} | Este comando vai literalmente deletar o canal ${canal}, deseja prosseguir?`).then(msg => {
                sdb.set(`Request.${message.author.id}`, `${msg.url}`)
                msg.react('✅').catch(() => { }) // Check
                msg.react('❌').catch(() => { }) // X

                const filter = (reaction, user) => { return ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id }

                msg.awaitReactions({ filter, max: 1, time: 15000, errors: ['time'] }).then(collected => {
                    const reaction = collected.first()

                    if (reaction.emoji.name === '✅') {
                        sdb.delete(`Request.${message.author.id}`)
                        canal.delete().catch(err => {
                            if (err.code === 50074)
                                return message.channel.send(`${e.Info} | Não é possível deletar um canal do tipo **Comunidade.**`)

                            return message.reply(`${e.Warn} | Ocorreu um erro na exclusão do canal.\n \n\`${err}\``)
                        })
                        return msg.edit(`${e.Check} | Canal deletado com sucesso!`).catch(() => { })
                    } else {
                        sdb.delete(`Request.${message.author.id}`)
                        return msg.edit(`${e.Deny} | Request cancelada.`).catch(() => { })
                    }
                }).catch(() => {
                    sdb.delete(`Request.${message.author.id}`)
                    return msg.edit(`${e.Deny} | Request cancelada por tempo expirado.`).catch(() => { })
                })
            })
        }

        function SetTopic() {
            const TopicoDoCanal = args.slice(1).join(" ")
            if (!TopicoDoCanal) { return message.reply(`${e.Deny} | Você não disse o novo tópico do canal.\n\`${prefix}channel topic O tópico do canal em diante.\``) }
            if (TopicoDoCanal.length > 1024) { return message.reply(`${e.Deny} | O novo tópico do canal não pode ultrapassar **1024 caracteres**`) }
            canal.setTopic(TopicoDoCanal).then(NewTopic => {
                return message.reply(`${e.Check} | Tópico do Canal alterado para - **${NewTopic}** - com sucesso.`)
            }).catch(err => {
                return message.channel.send(`${e.Deny} | Ocorreu um erro ao trocar o tópico do canal.\n\`${err}\``)
            })
        }

        function SetName() {
            if (!message.mentions.channels.first()) return message.reply(`${e.Deny} | Você não me disse o canal.\n\`${prefix}channel name #canal NomeDoCanal\``)
            const NovoNome = args.slice(2).join(" ").toLowerCase()
            if (!NovoNome) return message.reply(`${e.Deny} | Você não me disse o novo nome do canal.\n\`${prefix}channel name #canal NomeDoCanal\``)
            if (NovoNome.length > 40) { return message.reply(`${e.Deny} | O nome do canal não pode ultrapassar **40 caracteres**`) }
            canal.setName(NovoNome, [`Author: ${message.author.tag}`]).then(NewName => {
                return message.reply(`${e.Check} | Canal renomeado para **${NewName}**`)
            }).catch(err => { return message.channel.send(`${e.Deny} | Ocorreu um erro ao trocar o nome do canal.\n\`${err}\``) })
        }

        async function Farm() {

            switch (args[1]) {
                case 'busca': case 'buscar':
                    BuscaChannel()
                    break;
                case 'pesca': case 'pescar':
                    PescaChannel()
                    break;
                case 'mine': case 'minerar':
                    MineChannel()
                    break;
                default:
                    message.reply(`${e.Deny} | Opções válidas para criação de canais farming: \`busca\` \`pesca\` \`minerar\``)
                    break;
            }

            function BuscaChannel() {
                if (ServerDb.get(`Servers.${message.guild.id}.Farm.BuscaChannel`))
                    message.reply(`${e.Info} | O canal <#${ServerDb.get(`Servers.${message.guild.id}.Farm.BuscaChannel`)}> foi deletado da minha database.`)

                message.guild.channels.create('floresta-cammum', {
                    type: 'GUILD_TEXT', topic: `Use "${prefix}busca" para farmar`, rateLimitPerUser: 1, reason: `${message.author.tag} solicitou a criação deste canal.`
                }).then(channel => {
                    ServerDb.set(`Servers.${message.guild.id}.Farm.BuscaChannel`, channel.id)
                    channel.send(`${e.Nagatoro} | Neste canal está liberado a farming \`${prefix}busca\`. Boa sorte!`).catch(() => { })
                    return message.reply(`${e.Check} | Canal farming criado com sucesso! | ${channel}`)
                }).catch(err => { message.channel.send(`${e.Deny} | Ocorreu um erro ao criar o canal farming.\n\`${err}\``) })
            }

            function PescaChannel() {
                if (ServerDb.get(`Servers.${message.guild.id}.Farm.PescaChannel`))
                    message.reply(`${e.Info} | O canal <#${ServerDb.get(`Servers.${message.guild.id}.Farm.PescaChannel`)}> foi deletado da minha database.`)

                message.guild.channels.create('farm-pesca', {
                    type: 'GUILD_TEXT', topic: `Use "${prefix}pesca" para farmar`, rateLimitPerUser: 1, reason: `${message.author.tag} solicitou a criação deste canal.`
                }).then(channel => {
                    ServerDb.set(`Servers.${message.guild.id}.Farm.PescaChannel`, channel.id)
                    channel.send(`${e.Nagatoro} | Neste canal está liberado a farming \`${prefix}pesca\`. Boa sorte!`).catch(() => { })
                    return message.reply(`${e.Check} | Canal farming criado com sucesso! | ${channel}`)
                }).catch(err => { message.channel.send(`${e.Deny} | Ocorreu um erro ao criar o canal farming.\n\`${err}\``) })
            }

            function MineChannel() {
                if (ServerDb.get(`Servers.${message.guild.id}.Farm.MineChannel`))
                    return message.reply(`${e.Info} | Já existe um canal farming neste servidor. -> <#${ServerDb.get(`Servers.${message.guild.id}.Farm.MineChannel`)}>`)

                message.guild.channels.create('mineração', {
                    type: 'GUILD_TEXT', topic: `Use "${prefix}mine" para farmar`, rateLimitPerUser: 1, reason: `${message.author.tag} solicitou a criação deste canal.`
                }).then(channel => {
                    ServerDb.set(`Servers.${message.guild.id}.Farm.MineChannel`, channel.id)
                    channel.send(`${e.Nagatoro} | Neste canal está liberado a farming \`${prefix}mine\`. Boa sorte!`).catch(() => { })
                    return message.reply(`${e.Check} | Canal farming criado com sucesso! | ${channel}`)
                }).catch(err => { message.channel.send(`${e.Deny} | Ocorreu um erro ao criar o canal farming.\n\`${err}\``) })
            }
        }

        async function LevelChannel() {
            let CanalAtual = await message.guild.channels.cache.get(ServerDb.get(`Servers.${message.guild.id}.XPChannel`))

            if (ServerDb.get(`Servers.${message.guild.id}.XPChannel`) && !CanalAtual)
                ServerDb.delete(`Servers.${message.guild.id}.XPChannel`)

            if (CanalAtual)
                return message.reply(`${e.Deny} | Não é possível criar outro canal de Level Up. Canal atual: ${CanalAtual}`)

            message.guild.channels.create(`${client.user.username}'s level-up`, {
                topic: `Canal de Level up da Bot ${client.user.username}`,
                permissionOverwrites: [
                    {
                        id: message.guild.id,
                        deny: [Permissions.FLAGS.SEND_MESSAGES],
                    },
                ],
                reason: `${message.author.tag} solicitou a criação deste canal.`
            }).then(channel => {
                ServerDb.set(`Servers.${message.guild.id}.XPChannel`, channel.id)
                channel.send(`${e.NezukoDance} O canal de level-up foi ativado e configurado com sucesso! Eu fechei o canal para @.everyone, mas se quiser abrir, só digitar \`${prefix}unlock\``)
                message.channel.send(`${e.Check} | Canal criado com sucesso! Ele está aqui: ${channel}`)
            }).catch(err => {
                return message.channel.send(`${e.Deny} | Ocorreu um erro na criação do canal de level up. Caso não saiba resolver sozinho*(a)*, reporte o bug usando \`${prefix}bug\` que a minha equipe te dará o suporte necessário.\n\`${err}\``)
            })

        }
    }
}