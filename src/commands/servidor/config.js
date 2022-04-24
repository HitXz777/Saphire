const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'config',
    aliases: ['serverstatus', 'serverconfig', 'configserver', 'configstatus'],
    category: 'servidor',
    emoji: `${e.ModShield}`,
    usage: '<configstats>',
    description: 'Status da configuração do servidor',

    run: async (client, message, args, prefix, MessageEmbed, Database) => {

        let server = client.guilds.cache.get(args[0]) || message.guild

        const msg = await message.reply({
            embeds: [
                new MessageEmbed()
                    .setColor('BLUE')
                    .setDescription(`${e.Loading} | Buscando e construindo...`)
            ]
        })

        let guildData = await Database.Guild.findOne({ id: server.id })

        const ConfigEmbed = new MessageEmbed()
            .setColor('GREEN')
            .setTitle(`${e.ModShield} Configurações ${server.name}`)
            .setDescription(`Dica: Você pode ver todos os comandos de ativação no painel \`configuração\` no comando \`${prefix}help\``)
            .addFields(
                {
                    name: `🛰️ Global System Notification`,
                    value: await GetChannel('LogChannel')
                },
                {
                    name: '🗣️ Antifake Premium System',
                    value: guildData.Antifake ? `${e.Check} Ativado` : `${e.Deny} Desativado`
                },
                {
                    name: `${e.antlink} Antilink Premium System`,
                    value: guildData.AntLink ? `${e.Check} Ativado` : `${e.Deny} Desativado`
                },
                {
                    name: `${e.Verify} Autorole System`,
                    value: await GetAutorole()
                },
                {
                    name: '💬 Canal de Ideias',
                    value: await GetChannel('IdeiaChannel')
                },
                {
                    name: `${e.Leave} Canal de Saida`,
                    value: await GetChannel('LeaveChannel', 'Canal')
                },
                {
                    name: `${e.Join} Canal de Boas-Vindas`,
                    value: await GetChannel('WelcomeChannel', 'Canal')
                },
                {
                    name: `${e.RedStar} Canal de XP`,
                    value: await GetChannel('XpSystem', 'Canal')
                },
                {
                    name: `${e.Report} Canal de Reports`,
                    value: await GetChannel('ReportChannel')
                },
                {
                    name: `📝 Confessionário`,
                    value: await GetChannel('ConfessChannel')
                },
                {
                    name: `${e.Tada} Canal de Sorteios`,
                    value: await GetChannel('GiveawayChannel')
                }
            )

        return msg.edit({ embeds: [ConfigEmbed] }).catch(() => { })

        async function GetAutorole() {

            let roles = await Database.Guild.findOne({ id: server.id }, 'Autorole')

            if (!roles.Autorole || roles.Autorole.length === 0) return 'Sistema desativado'

            let rolesMapped = roles.Autorole.map(roleId => {

                let role = server.roles.cache.get(roleId)

                if (!role) {
                    removeRoleFromAutorole(roleId)
                    return `${e.Deny} | Cargo não encontrado`
                }

                return `${role} *\`${roleId}\`*`
            }).join('\n')

            return rolesMapped || 'Indefinido'
        }

        async function GetChannel(a, b) {

            if (b) {

                let data = await Database.Guild.findOne({ id: server.id }, `${a}`),
                    route = `${a}.${b}`

                if (!data[a])
                    return 'Desativado'

                let Channel = server.channels.cache.get(data[a][b])

                if (!Channel)
                    await Database.Guild.updateOne(
                        { id: server.id },
                        { $unset: { [route]: 1 } }
                    )

                return Channel ? `Ativado: ${Channel} - ${Channel?.name || '\`Nome indefinido\`'}` : 'Desativado'

            } else {

                let data = await Database.Guild.findOne({ id: server.id }, `${a}`)

                if (!data[a])
                    return 'Desativado'

                let Channel = server.channels.cache.get(data[a])

                if (!Channel)
                    await Database.Guild.updateOne(
                        { id: server.id },
                        { $unset: { [a]: 1 } }
                    )

                return Channel ? `Ativado: ${Channel} - ${Channel?.name || '\`Nome indefinido\`'}` : 'Desativado'

            }

        }

        async function removeRoleFromAutorole(roleId) {

            await Database.Guild.updateOne(
                { id: server.id },
                { $pull: { Autorole: roleId } }
            )
            return
        }

    }
}