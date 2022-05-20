const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'admins',
    aliases: ['administradores', 'adms', 'admin', 'adm'],
    category: 'bot',
    emoji: `${e.Admin}`,
    usage: '<admin>',
    description: 'Administradores da Saphire/Servidor',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {

        if (['servidor', 'local', 'server', 'guild'].includes(args[0]?.toLowerCase())) return localAdminsGuild()

        let clientData = await Database.Client.findOne({ id: client.user.id }, 'Administradores'),
            admins = clientData?.Administradores || []

        if (admins.length < 1) return message.reply(`${e.Check} | Nenhum adm na lista.`)

        return message.channel.send({
            embeds: [
                new MessageEmbed()
                    .setColor('#FF0000')
                    .setTitle(`${e.Admin} Lista de Administradores | Saphire's Team`)
                    .setDescription(`${admins.map(adminId => `**${client.users.cache.get(adminId)?.tag || 'Não encontrei este usuário'}**\n\`${adminId}\``).join('\n')}`)
                    .setFooter({ text: `${prefix}adm local` })
            ]
        })

        async function localAdminsGuild() {

            let members = message.guild.members.cache,
                membersFilterToAdmin = members.filter(member => member.permissions.toArray().includes('ADMINISTRATOR')),
                admins = []

            membersFilterToAdmin.forEach(admin => admins.push(admin))

            if (!admins || admins.length < 1) return message.reply(`${e.Deny} | Nenhum administrador foi encontrado.`)
            let embeds = EmbedGenerator(),
                control = 0,
                msg = await message.reply({ embeds: [embeds[0]] }),
                emojis = ['⬅️', '➡️', '❌']

            if (embeds.length <= 1) return

            for (let i of emojis) msg.react(i).catch(() => { })

            const collector = msg.createReactionCollector({
                filter: (reaction, user) => emojis.includes(reaction.emoji.name) && user.id === message.author.id,
                idle: 30000
            })

            collector.on('collect', (reaction) => {

                if (reaction.emoji.name === emojis[2]) return collector.stop()

                if (reaction.emoji.name === emojis[0]) {
                    control--
                    return embeds[control] ? msg.edit({ embeds: [embeds[control]] }).catch(() => { }) : control++
                }

                if (reaction.emoji.name === emojis[1]) {
                    control++
                    return embeds[control] ? msg.edit({ embeds: [embeds[control]] }).catch(() => { }) : control--
                }
            })

            collector.on('end', () => msg.edit({ content: `${e.Deny} | Comando cancelado.` }).catch(() => { }))

            function EmbedGenerator() {

                let amount = 5,
                    Page = 1,
                    embeds = [],
                    array = admins,
                    length = admins.length / 5 <= 1 ? 1 : parseInt((array.length / 5) + 1)

                for (let i = 0; i < array.length; i += 5) {

                    let current = array.slice(i, amount),
                        description = current.map(admin => `> ${admin.user.tag} \`${admin.id}\``).join("\n"),
                        PageCount = `${length > 1 ? `- ${Page}/${length}` : ''}`

                    if (current.length > 0) {

                        embeds.push({
                            color: 'GREEN',
                            title: `${e.Admin} ${message.guild.name} Administradores ${PageCount}`,
                            description: `${description || 'Nenhum sorteio encontrado'}`,
                            footer: {
                                text: `${array.length} administradores contabilizados`
                            },
                        })

                        Page++
                        amount += 5

                    }

                }

                return embeds;
            }

        }

    }
}