const { hasMagic } = require('glob');
const { DatabaseObj: { e, config } } = require('../../../Routes/functions/database'),
    DeleteUser = require('../../../Routes/functions/deleteUser')

module.exports = {
    name: 'blacklist',
    aliases: ['listanegra', 'bloqueados', 'bl'],
    emoji: `${e.OwnerCrow}`,
    usage: ['[Staff Private] <add/remove> [server/@user/id]'],
    description: 'Membros/Servidores bloqueados do meu sistema',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        if (!args[0]) return BlacklistRanking();
        if (['servers', 'server', 'servidores', 'servidor'].includes(args[0]?.toLowerCase())) return BlacklistRankingServer()

        if (message.author.id !== config.ownerId && !sdb.get(`Client.Moderadores.${message.author.id}`))
            return message.reply(`${e.Deny} | Este é um comando da classe Moderador.`)

        let u = message.mentions.members.first() || message.mentions.repliedUser || await client.users.cache.get(args[1]) || await client.guilds.cache.get(args[1]),
            target = await client.users.cache.get(u?.id) || await client.guilds.cache.get(u?.id)

        if (['remover', 'remove', 're', 'tirar', 'delete', 'deletar', 'del'].includes(args[0]?.toLowerCase())) return BlacklistRemove()

        if (!target) return message.reply(`${e.Deny} | Alvo não encontrado.`)
        if (sdb.get(`Client.Moderadores.${target.id}`)) return message.reply(`${e.Deny} | Este usuário é um Moderador.`)

        let razao = args.slice(2).join(" ") || 'Nenhum motivo especificado'

        if (['adicionar', 'add', 'colocar', 'new'].includes(args[0]?.toLowerCase())) return BlacklistAdd()
        if (['addserver', 'addservidor'].includes(args[0]?.toLowerCase())) return ServerBlacklistAdd()
        if (['removeserver', 'removerservidor', 'delservidor', 'delserver'].includes(args[0]?.toLowerCase())) return ServerBlacklistRemove()
        return message.reply(`${e.SaphireObs} | Opções: \`add\` | \`remover\` | \`addserver\` | \`removeserver\``)

        async function ServerBlacklistAdd() {

            if (!target) return message.reply(`${e.Deny} | \`${prefix}bl addserver ServerId razão\``)
            if (await client.users.cache.get(args[1])) return message.reply(`${e.Info} | Este ID é de um membro.`)
            if (db.get(`BlacklistServers_${args[1]}`)) return message.reply(`${e.Info} | Este servidor já está bloqueado.`)
            if (!await client.guilds.cache.get(args[1])) return message.reply(`${e.Info} | Este servidor não existe ou eu não estou nele.`)

            db.set(`BlacklistServers_${await client.guilds.cache.get(args[1]).id}`, true)
            sdb.set(`BlacklistServer.${await client.guilds.cache.get(args[1]).id}`, razao)
            return message.reply(`${e.Check} O servidor "${target.name || 'Nome não encontrado'} *\`${target.id}\`*" foi adicionado a Blacklist.`)
        }

        async function ServerBlacklistRemove() {

            if (!target) return message.reply(`${e.Deny} | \`${prefix}bl remove ServerId\``)
            if (await client.users.cache.get(args[1])) return message.reply(`${e.Info} | Este ID é de um membro.`)
            if (!db.get(`BlacklistServers_${await client.guilds.cache.get(args[1]).id}`)) return message.reply(`${e.Info} | Este servidor não está bloqueado.`)

            db.delete(`BlacklistServers_${await client.guilds.cache.get(args[1]).id}`)
            sdb.delete(`BlacklistServer.${await client.guilds.cache.get(args[1]).id}`)
            return message.reply(`O servidor "${target.name || 'Nome não encontrado'} *\`${target.id}\`*" foi removido da Blacklist.`)
        }

        async function BlacklistAdd() {

            if (!target) return message.reply(`${e.Deny} | \`${prefix}bl add @user razão\``)
            if (await client.guilds.cache.get(args[1])) return message.reply(`${e.Info} | Este ID é de um servidor.`)
            if (sdb.get('Client.Blacklist.Users')?.some(Obj => Obj?.id === target.id)) return message.reply(`${e.Info} | Este usuário já está bloqueado.`)

            if (target.id === config.ownerId) {
                sdb.delete(`Client.Moderadores.${message.author.id}`)
                return message.reply(`${e.SaphireRaivaFogo} | Por tentar bloquear meu criador, você perdeu seu cargo de Moderador!`)
            }

            sdb.push('Client.Blacklist.Users', { id: target.id, reason: razao })
            return message.reply(`${e.Check} | O usuário "${target.username} *\`${target.id}\`*" foi adicionado a Blacklist.`)
        }

        async function BlacklistRemove() {

            if (['all', 'todos', 'tudo'].includes(args[1]?.toLowerCase())) {
                if (!sdb.get('Client.Blacklist.Users')?.length < 1)
                    return message.reply(`${e.Info} | A blacklist está vazia.`)

                sdb.delete('Client.Blacklist.Users')
                return message.reply(`${e.Check} | A blacklist foi deletada.`)
            }

            if (!target) return message.reply(`${e.Deny} | \`${prefix}bl removeserver @user\``)
            if (await client.guilds.cache.get(args[1])) return message.reply(`${e.Info} | Este ID é de um servidor.`)
            if (!sdb.get('Client.Blacklist.Users')?.some(Obj => Obj?.id === target.id)) return message.reply(`${e.Info} | Este usuário não está bloqueado.`)

            let BlockObj = sdb.get('Client.Blacklist.Users'),
                array = [...BlockObj],
                Remove = array.filter(Objs => Objs.id === target.id),
                NewArray = []

            for (const Block of array)
                if (Block.id !== Remove.map(a => a.id).join(''))
                    NewArray.push(Block)

            sdb.set('Client.Blacklist.Users', NewArray)
            return message.reply(`O usuário "${target.username} *\`${target.id}\`*" foi removido da Blacklist.`)
        }

        async function BlacklistRanking() {

            let Users = sdb.get('Client.Blacklist.Users') || []

            if (Users.length < 1)
                return message.reply(`${e.Info} | Não há ninguém na blacklist`)

            let Embeds = EmbedGenerator(Users),
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
            let data = db.all().filter(i => i.ID.startsWith("BlacklistServers_")).sort((a, b) => b.data - a.data)
            if (data.length < 1) return message.reply("Não há nenhum servidor na blacklist por enquanto")

            data.length = 20
            let lb = []
            for (let i in data) {
                let id = data[i].ID.split("_")[1]
                let server = await client.guilds.cache.get(id) || `${id}`
                server = server ? server.name : "Servidor não encontrado"
                let BlacklistServers_ = data[i].data
                let razao = sdb.get(`BlacklistServers.${id}`) || 'Sem razão definida'
                lb.push({ server: { id, name: server }, BlacklistServers_, razao })
            }

            const embed = new MessageEmbed()
                .setColor("#8B0000")
                .setTitle("🚫 Blacklist System Servidores")
            lb.forEach(d => {
                embed.addField(`🆔 ${d.server.name} \`${d.server.id}\``, `📝 ${d.razao}`)
            })
            message.reply({ embeds: [embed] })
        }

        function EmbedGenerator(array) {

            let amount = 7,
                Page = 1,
                embeds = [],
                length = array.length / 7 <= 1 ? 1 : parseInt((array.length / 7) + 1)

            for (let i = 0; i < array.length; i += 7) {

                let current = array.slice(i, amount),
                    description = current.map(BlockObj => {

                        let u = client.users.cache.get(BlockObj.id)

                        if (!u)
                            return `Não Encontrado \`${BlockObj.id}\`\n`

                        return `:id: ${u.tag} \`${BlockObj.id}\`\n${e.BookPages} \`${BlockObj.reason}\`\n`

                    }).join('\n'),
                    PageCount = `${length > 1 ? `${Page}/${length}` : ''}`

                if (current.length > 0) {

                    embeds.push({
                        color: "#8B0000",
                        title: `🚫 Blacklist System ${PageCount}`,
                        description: `${description || 'Nenhum usuário bloqueado'}`,
                        footer: {
                            text: `${array.length} usuário bloqueados`
                        },
                    })

                    Page++
                    amount += 7

                }

            }

            return embeds;
        }

    }
}
