const { DatabaseObj: { e, config } } = require('../../../modules/functions/plugins/database')
const isMod = require('../../../modules/functions/config/ismod')

module.exports = {
    name: 'blacklist',
    aliases: ['listanegra', 'bloqueados', 'bl'],
    category: 'owner',
    emoji: `${e.OwnerCrow}`,
    usage: ['[Staff Private] <add/remove> [server/@user/id]'],
    description: 'Membros/Servidores bloqueados do meu sistema',

    run: async (client, message, args, prefix, MessageEmbed, Database) => {

        let clientData = await Database.Client.findOne({ id: client.user.id }, 'Blacklist'),
            data = clientData.Blacklist

        if (!args[0]) return message.reply(
            {
                embeds: [
                    new MessageEmbed()
                        .setColor(client.blue)
                        .setTitle(`🚫 Blacklist System`)
                        .setDescription(`O sistema de blacklist permite segurança e punições aos usuários, servidores e times da Saphire.`)
                        .addFields(
                            {
                                name: `${e.Info} Servidores e Usuários`,
                                value: `> \`Servidores\`: Servidores adicionados na blacklist não possuem permissão para me adicionar ou manter no servidor.\n> \`Usuários\`: Usuários na blacklist perdem o acesso total aos meus comandos`
                            },
                            {
                                name: `${e.Join} Adicionar na Blacklist`,
                                value: `\`${prefix}bl add @user/id\` | \`${prefix}bl addserver <ServerID>\``
                            },
                            {
                                name: `${e.Leave} Retirar da Blacklist`,
                                value: `\`${prefix}bl remove @user/id | all\` | \`${prefix}bl removeserver <ServerID> | all\``
                            },
                            {
                                name: `${e.Commands} Lista de Bloqueados`,
                                value: `\`${prefix}bl users\` | \`${prefix}bl servers\``
                            },
                            {
                                name: `${e.loss} Blacklist da Economia Global`,
                                value: `\`${prefix}bl <economy> <add/remove> <@user/id>\`\n\`${prefix}bl economy list\``
                            }
                        )
                ]
            }
        )

        if (['users', 'user', 'membros', 'usuários'].includes(args[0]?.toLowerCase())) return BlacklistRanking()
        if (['servers', 'server', 'servidores', 'servidor'].includes(args[0]?.toLowerCase())) return BlacklistRankingServer()

        let mod = await isMod(message.author.id)

        if (!mod)
            return message.reply(`${e.ModShield} | Este é um comando exclusivo da classe Moderador.`)

        let u = message.mentions.users.first() || message.mentions.repliedUser || client.users.cache.get(args[1]) || client.users.cache.get(args[2]) || client.guilds.cache.get(args[1]) || client.users.cache.find(user => user.username?.toLowerCase() === args[1]?.toLowerCase()),
            target = client.users.cache.get(u?.id) || client.guilds.cache.get(u?.id)

        if (await isMod(target?.id)) return message.reply(`${e.Deny} | Este usuário faz parte do time de moderação.`)

        let razao = args.slice(2).join(" ") || 'Nenhum motivo especificado'

        if (['remover', 'remove', 're', 'tirar', 'delete', 'deletar', 'del'].includes(args[0]?.toLowerCase())) return BlacklistRemove()
        if (['economy', 'economia'].includes(args[0]?.toLowerCase())) return economyBlacklist()
        if (['adicionar', 'add', 'colocar', 'new'].includes(args[0]?.toLowerCase())) return BlacklistAdd()
        if (['addserver', 'addservidor'].includes(args[0]?.toLowerCase())) return ServerBlacklistAdd()
        if (['removeserver', 'removerservidor', 'delservidor', 'delserver'].includes(args[0]?.toLowerCase())) return ServerBlacklistRemove()
        return message.reply(`${e.SaphireObs} | Opções: \`add\` | \`remover\` | \`addserver\` | \`removeserver\``)

        async function BlacklistAdd() {

            if (!args[1]) return message.reply(`${e.Deny} | \`${prefix}bl add <@user/id>\``)
            if (client.guilds.cache.get(args[1])) return message.reply(`${e.Info} | Este ID é de um servidor.`)
            if ((data.Users || [])?.some(Obj => Obj?.id === target?.id || Obj?.id === args[1])) return message.reply(`${e.Info} | Este usuário já está bloqueado.`)

            if (isNaN(args[1]) && !target && args[1].length >= 1 && args[1].length <= 18) return message.reply(`${e.Deny} | Este ID não é válido.`)

            if (target?.id === config.ownerId)
                return message.reply('Você é bobo, é?')

            await Database.Client.updateOne(
                { id: client.user.id },
                { $push: { 'Blacklist.Users': { $each: [{ id: target?.id || args[1], reason: razao }], $position: 0 } } }
            )
            return message.reply(`${e.Check} | O usuário "${target?.username || '**Não encontrado...**'} *\`${target?.id || args[1]}\`*" foi adicionado a Blacklist.`)
        }

        async function ServerBlacklistAdd() {

            let guild = client.guilds.cache.get(args[1])

            if (client.users.cache.get(args[1])) return message.reply(`${e.Info} | Este ID é de um membro.`)
            if ((data.Guilds || [])?.some(Obj => Obj?.id === args[1])) return message.reply(`${e.Info} | Este servidor já está bloqueado.`)

            await Database.Client.updateOne(
                { id: client.user.id },
                { $push: { 'Blacklist.Guilds': { $each: [{ id: args[1], reason: razao }], $position: 0 } } }
            )

            if (guild) guild.leave()
            return message.reply(`${e.Check} O servidor "${guild?.name || 'Nome não encontrado'} *\`${guild?.id || args[1]}\`*" foi adicionado a Blacklist.`)
        }

        async function ServerBlacklistRemove() {

            if (['all', 'todos', 'tudo'].includes(args[1]?.toLowerCase())) {
                if (!data || data.Guilds?.length === 0)
                    return message.reply(`${e.Info} | A blacklist de servidores está vazia.`)

                await Database.Client.updateOne(
                    { id: client.user.id },
                    { 'Blacklist.Guilds': [] }
                )
                return message.reply(`${e.Check} | A blacklist de servidores foi deletada.`)
            }

            if (!args[1]) return message.reply(`${e.Deny} | \`${prefix}bl removeserver ServerId\``)
            if (client.users.cache.get(args[1])) return message.reply(`${e.Info} | Este ID é de um membro.`)
            if (!(data.Guilds || [])?.some(Obj => Obj?.id === args[1])) return message.reply(`${e.Info} | Este servidor não está bloqueado.`)

            await Database.Client.updateOne(
                { id: client.user.id },
                { $pull: { 'Blacklist.Guilds': { id: args[1] } } }
            )

            return message.reply(`O servidor "${target?.name || 'Nome não encontrado'} *\`${target?.id || args[1]}\`*" foi removido da Blacklist.`)
        }

        async function BlacklistRemove() {

            if (['all', 'todos', 'tudo'].includes(args[1]?.toLowerCase())) {
                if (!data || data.Users?.length === 0)
                    return message.reply(`${e.Info} | A blacklist está vazia.`)

                await Database.Client.updateOne(
                    { id: client.user.id },
                    { 'Blacklist.Users': [] }
                )
                return message.reply(`${e.Check} | A blacklist foi deletada.`)
            }

            let id = target?.id || args[1]

            if (!id) return message.reply(`${e.Deny} | \`${prefix}bl remove @user/id\``)
            if (client.guilds.cache.get(id)) return message.reply(`${e.Info} | Este ID é de um servidor.`)
            if (!(data.Users || [])?.some(Obj => Obj.id === id)) return message.reply(`${e.Info} | Este usuário não está bloqueado.`)

            await Database.Client.updateOne(
                { id: client.user.id },
                { $pull: { 'Blacklist.Users': { id: id } } }
            )

            return message.reply(`O usuário "${target.username} *\`${target.id}\`*" foi removido da Blacklist.`)
        }

        async function BlacklistRanking() {

            let Users = data?.Users || []

            if (Users.length < 1)
                return message.reply(`${e.Info} | Não há nenhum usuário na blacklist`)

            let Embeds = EmbedGenerator(Users, 'user'),
                Control = 0,
                Emojis = ['⬅️', '➡️'],
                msg = await message.reply({ embeds: [Embeds[0]] }),
                AtualEmbed = Embeds[0]

            if (Embeds.length > 1)
                for (const Emoji of Emojis)
                    msg.react(Emoji).catch(() => { })

            else return

            const collector = msg.createReactionCollector({
                filter: (reaction, user) => Emojis.includes(reaction.emoji.name) && user.id === message.author.id,
                idle: 30000
            })

            collector.on('collect', (reaction) => {

                return reaction.emoji.name === Emojis[0]
                    ? (() => {

                        Control++
                        return Embeds[Control] ? (() => {
                            msg.edit({ embeds: [Embeds[Control]] }).catch(() => { return collector.stop() })
                            AtualEmbed = Embeds[Control]
                        })() : Control--

                    })()
                    : (() => {

                        Control--
                        return Embeds[Control] ? (() => {
                            msg.edit({ embeds: [Embeds[Control]] }).catch(() => { return collector.stop() })
                            AtualEmbed = Embeds[Control]
                        })() : Control++

                    })()

            })

            collector.on('end', () => {

                AtualEmbed.color = 'RED'
                AtualEmbed.footer.text = 'Sessão expirada'

                return msg.edit({ embeds: [AtualEmbed] }).catch(() => { })
            })

        }

        async function BlacklistRankingServer() {

            let Users = data?.Guilds || []

            if (Users.length < 1)
                return message.reply(`${e.Info} | Não há nenhum servidor na blacklist`)

            let Embeds = EmbedGenerator(Users, 'server'),
                Control = 0,
                Emojis = ['⬅️', '➡️'],
                msg = await message.reply({ embeds: [Embeds[0]] }),
                AtualEmbed = Embeds[0]

            if (Embeds.length > 1)
                for (const Emoji of Emojis)
                    msg.react(Emoji).catch(() => { })

            else return

            const collector = msg.createReactionCollector({
                filter: (reaction, user) => Emojis.includes(reaction.emoji.name) && user.id === message.author.id,
                idle: 30000
            })

            collector.on('collect', (reaction) => {

                return reaction.emoji.name === Emojis[0]
                    ? (() => {

                        Control++
                        return Embeds[Control] ? (() => {
                            msg.edit({ embeds: [Embeds[Control]] }).catch(() => { return collector.stop() })
                            AtualEmbed = Embeds[Control]
                        })() : Control--

                    })()
                    : (() => {

                        Control--
                        return Embeds[Control] ? (() => {
                            msg.edit({ embeds: [Embeds[Control]] }).catch(() => { return collector.stop() })
                            AtualEmbed = Embeds[Control]
                        })() : Control++

                    })()

            })

            collector.on('end', () => {

                AtualEmbed.color = 'RED'
                AtualEmbed.footer.text = 'Sessão expirada'

                return msg.edit({ embeds: [AtualEmbed] }).catch(() => { })
            })

        }

        function EmbedGenerator(array, userOrServer) {

            let amount = 7,
                Page = 1,
                embeds = [],
                length = array.length / 7 <= 1 ? 1 : parseInt((array.length / 7) + 1),
                economy = userOrServer === 'economy' ? ' | Global Economy' : '',
                SorU = userOrServer === 'server' ? 'servidores' : 'usuários'

            for (let i = 0; i < array.length; i += 7) {

                let current = array.slice(i, amount),
                    description = current.map(BlockObj => {

                        let u = client.users.cache.get(BlockObj.id) || client.guilds.cache.get(BlockObj.id)

                        if (!u)
                            return `Não Encontrado \`${BlockObj.id}\`\n`

                        return `:id: ${u?.tag || u?.name || u?.username || 'Indefinido'} \`${BlockObj.id}\`\n${e.BookPages} \`${BlockObj.reason}\`\n`

                    }).join('\n'),
                    PageCount = `${length > 1 ? `${Page}/${length}` : ''}`

                if (current.length > 0) {

                    embeds.push({
                        color: "#8B0000",
                        title: `🚫 Blacklist System${economy} ${PageCount}`,
                        description: `${description || 'Blacklist vázia'}`,
                        footer: {
                            text: `${array.length} ${SorU} bloqueados`
                        },
                    })

                    Page++
                    amount += 7

                }

            }

            return embeds;
        }

        function economyBlacklist() {

            if (['adicionar', 'add', 'colocar', 'new'].includes(args[1]?.toLowerCase())) return addMember()
            if (['remover', 'remove', 're', 'tirar', 'delete', 'deletar', 'del'].includes(args[1]?.toLowerCase())) return removeMember()
            if (['lista', 'list', 'rank'].includes(args[1]?.toLowerCase())) return listBlacklistEconomyMembers()
            return message.reply(`${e.Deny} | Comando não reconhecido. | add - remove - list |`)

            async function addMember() {

                let usersBlocked = data?.Economy

                if (!target?.id || !args[2])
                    return message.reply(`${e.Deny} | Você precisa mencionar um usuário ou dizer o ID para adicionar na blacklist.`)

                if (usersBlocked.some(Data => Data.id === target?.id || Data.id === args[2]))
                    return message.reply(`${e.Info} | Este usuário já está na blacklist.`)

                let razao = args.slice(3).join(" ") || 'Nenhum motivo especificado'

                await Database.Client.updateOne(
                    { id: client.user.id },
                    { $push: { 'Blacklist.Economy': { $each: [{ id: target?.id || args[2], reason: razao }], $position: 0 } } }
                )

                return message.reply(`${e.Check} | usuário adicionado a blacklist da Economia Global com sucesso!`)

            }

            async function removeMember() {

                let usersBlocked = data?.Economy

                if (!usersBlocked || usersBlocked.length === 0) return message.reply(`${e.Info} | Essa blacklist está vazia.`)

                if (!target?.id || !args[2])
                    return message.reply(`${e.Deny} | Você precisa mencionar um usuário ou dizer o ID para remove-lo da blacklist.`)

                if (!usersBlocked.some(Data => Data.id === target?.id || Data.id === args[2]))
                    return message.reply(`${e.Info} | Este usuário não já está na blacklist.`)

                let razao = args.slice(3).join(" ") || 'Nenhum motivo especificado'

                await Database.Client.updateOne(
                    { id: client.user.id },
                    { $pull: { 'Blacklist.Economy': { id: target?.id || args[2] } } }
                )

                return message.reply(`${e.Check} | usuário removido da blacklist da Economia Global com sucesso!`)

            }

            async function listBlacklistEconomyMembers() {

                let Users = data?.Economy

                if (Users.length < 1)
                    return message.reply(`${e.Info} | Não há nenhum usuário na blacklist da Economia Global`)

                let Embeds = EmbedGenerator(Users, 'economy'),
                    Control = 0,
                    Emojis = ['⬅️', '➡️'],
                    msg = await message.reply({ embeds: [Embeds[0]] }),
                    AtualEmbed = Embeds[0]

                if (Embeds.length > 1)
                    for (const Emoji of Emojis)
                        msg.react(Emoji).catch(() => { })

                else return

                const collector = msg.createReactionCollector({
                    filter: (reaction, user) => Emojis.includes(reaction.emoji.name) && user.id === message.author.id,
                    idle: 30000
                })

                collector.on('collect', (reaction) => {

                    return reaction.emoji.name === Emojis[0]
                        ? (() => {

                            Control++
                            return Embeds[Control] ? (() => {
                                msg.edit({ embeds: [Embeds[Control]] }).catch(() => { return collector.stop() })
                                AtualEmbed = Embeds[Control]
                            })() : Control--

                        })()
                        : (() => {

                            Control--
                            return Embeds[Control] ? (() => {
                                msg.edit({ embeds: [Embeds[Control]] }).catch(() => { return collector.stop() })
                                AtualEmbed = Embeds[Control]
                            })() : Control++

                        })()

                })

                collector.on('end', () => {

                    AtualEmbed.color = 'RED'
                    AtualEmbed.footer.text = 'Sessão expirada'

                    return msg.edit({ embeds: [AtualEmbed] }).catch(() => { })
                })

            }
        }

    }
}
