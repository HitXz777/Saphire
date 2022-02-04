const { e } = require('../../../database/emojis.json')

// #246FE0 - Azul Saphire
module.exports = {
    name: 'serverlist',
    aliases: ['listserver'],
    category: 'owner',
    ClientPermissions: ['ADD_REACTIONS'],
    emoji: `${e.OwnerCrow}`,
    usage: 'serverlist',
    description: 'Lista de todos os servidores',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        const Servers = await client.guilds.cache

        const ServersArray = []

        Servers.forEach(server => {
            ServersArray.push({ name: server.name, id: server.id, members: server.members.cache.size })
        })

        function EmbedGenerator() {

            let amount = 10,
                Page = 1,
                embeds = [],
                length = ServersArray.length / 10 <= 1 ? 1 : parseInt((ServersArray.length / 10) + 1)

            for (let i = 0; i < ServersArray.length; i += 10) {

                let current = ServersArray.slice(i, amount),
                    description = current.map(server => `**${server.members}.** ${server.name} - \`${server.id}\``).join("\n")

                embeds.push({
                    color: client.blue,
                    title: `🛡️ Lista de todos os servidores | ${Page}/${length}`,
                    description: `${description}`,
                    footer: {
                        text: `${Servers?.size || 0} Servidores`
                    }
                })

                Page++
                amount += 10

            }

            return embeds;
        }

        let embed = EmbedGenerator(),
            msg = await message.reply({ embeds: [embed[0]] }),
            collector = msg.createReactionCollector({
                filter: (reaction, user) => ['⬅️', '➡️', '❌'].includes(reaction.emoji.name) && user.id === message.author.id,
                idle: 60000
            }),
            control = 0

        if (embed.length > 1)
            for (const emoji of ['⬅️', '➡️', '❌'])
                msg.react(emoji).catch(() => { })

        collector.on('collect', (reaction) => {


            if (reaction.emoji.name === '❌')
                return collector.stop()

            if (reaction.emoji.name === '⬅️') {
                control--
                return embed[control] ? msg.edit({ embeds: [embed[control]] }).catch(() => { }) : control++
            }

            if (reaction.emoji.name === '➡️') {
                control++
                return embed[control] ? msg.edit({ embeds: [embed[control]] }).catch(() => { }) : control--
            }

        });

        collector.on('end', () => {
            msg.reactions.removeAll().catch(() => { })
            return msg.edit(`${e.Deny} | Comando cancelado.`)
        });

    }
}