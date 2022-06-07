const { e } = require('../../../JSON/emojis.json')
const Notify = require('../../../modules/functions/plugins/notify')

module.exports = {
    name: 'serverpremium',
    aliases: ['addpremium', 'spremium', 'premiumserver'],
    category: 'admin',
    admin: true,
    emoji: e.Admin,
    usage: '<serverpremium> <add/remove/list> <serverId>',
    description: 'Comando de ativação de servidores premium',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {

        let data = await Database.Client.findOne({ id: client.user.id }, 'PremiumServers'),
            server = client.guilds.cache.get(args[1]),
            premiumServers = data.PremiumServers || []

        if (['add', 'adicionar', 'new'].includes(args[0]?.toLowerCase())) return newPremiumServer()
        if (['remove', 'del', 'delete'].includes(args[0]?.toLowerCase())) return removePremiumServer()
        if (['list', 'lista'].includes(args[0]?.toLowerCase())) return listPremiumServer()
        return message.reply(`${e.Deny} | Comando inválido: \`add | remove | list\``)

        async function newPremiumServer() {

            if (!server) return message.reply(`${e.Info} | Forneça o ID de um servidor para adiciona-lo na lista de Servidores Premium.`)

            if (premiumServers.includes(server.id))
                return message.reply(`${e.Info} | Este servidor já faz parte do sistema premium.`)

            await Database.Client.updateOne(
                { id: client.user.id },
                { $push: { PremiumServers: server.id } }
            )

            Notify(server.id, 'SERVER PREMIUM SYSTEM', 'Este servidor foi adicionado na lista de Servidores Premium.')
            return message.reply(`${e.Check} | O servidor **${server.name}** \`${server.id}\` foi adicionado a lista de Servidores Premium com sucesso!`)

        }

        async function removePremiumServer() {

            if (['all', 'todos'].includes(args[0]?.toLowerCase())) return removeAllServers()

            if (!server) return message.reply(`${e.Info} | Forneça o ID de um servidor para adiciona-lo na lista de Servidores Premium.`)

            if (!premiumServers.includes(server.id))
                return message.reply(`${e.Info} | Este servidor não faz parte do sistema premium.`)

            removeServer(server.id)

            Notify(server.id, 'SERVER PREMIUM SYSTEM', 'Este servidor foi removido da lista de Servidores Premium.')
            return message.reply(`${e.Check} | O servidor **${server.name}** \`${server.id}\` foi removido da lista de Servidores Premium com sucesso!`)

            async function removeAllServers() {

                if (premiumServers.length === 0) return message.reply(`${e.Deny} | Não há nenhum servidor na lista.`)

                await Database.Client.updateOne(
                    { id: client.user.id },
                    { $unset: { PremiumServers: 1 } }
                )

                for (const serverId of premiumServers)
                    Notify(serverId, 'SERVER PREMIUM SYSTEM', 'Este servidor foi removido da lista de Servidores Premium.')

                return message.reply(`${e.Check} | Todos os servidores foram removidos da lista Servidores Premium.`)
            }

        }

        async function listPremiumServer() {

            if (premiumServers.length === 0) return message.reply(`${e.Deny} | Não há nenhum servidor na lista.`)

            let embeds = EmbedGenerator(premiumServers),
                emojis = ['⬅️', '➡️', '❌'],
                control = 0

            const msg = await message.reply({ embeds: [embeds[0]] })

            if (embeds?.length > 1)
                for (let i of emojis) msg.react(i).catch(() => { })
            else return

            const collector = msg.createReactionCollector({
                filter: (reaction, user) => emojis.includes(reaction.emoji.name) && user.id === message.author.id,
                time: 30000,
                errors: ['time']
            })

            collector.on('collect', (reaction) => {

                if (reaction.emoji.name === emojis[2])
                    return collector.stop

                if (reaction.emoji.name === emojis[0]) {
                    control--
                    return embeds[control] ? msg.edit({ embeds: [embeds[control]] }).catch(() => { }) : control++
                }

                if (reaction.emoji.name === emojis[1]) {
                    control++
                    return embeds[control] ? msg.edit({ embeds: [embeds[control]] }).catch(() => { }) : control--
                }
                return
            })

            collector.on('end', () => msg.edit({ content: `${e.Deny} Comando cancelado.` }).catch(() => { }))

        }

        function EmbedGenerator(array) {

            let amount = 5,
                Page = 1,
                embeds = [],
                length = array.length / 5 <= 1 ? 1 : parseInt((array.length / 5) + 1)

            for (let i = 0; i < array.length; i += 5) {

                let current = array.slice(i, amount),
                    description = current.map(serverId => {

                        let guild = client.guilds.cache.get(serverId)

                        if (!guild) {
                            removeServer(serverId)
                            return `${e.Deny} | Servidor removido.`
                        }

                        return `${guild.name} - \`${guild.id}\``
                    }).join("\n"),
                    PageCount = `${length > 1 ? `${Page}/${length}` : ''}`

                if (current.length > 0) {

                    embeds.push({
                        color: client.blue,
                        title: `${e.CoroaDourada} Server Premium List ${PageCount}`,
                        description: `${description || 'Nenhum item encontrado'}`,
                        footer: {
                            text: `${array.length} servidores contabilizados`
                        },
                    })

                    Page++
                    amount += 5

                }

            }

            return embeds;
        }

        async function removeServer(serverId) {
            await Database.Client.updateOne(
                { id: client.user.id },
                { $pull: { PremiumServers: serverId } }
            )
            return
        }

    }
}