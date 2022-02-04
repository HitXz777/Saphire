const { e } = require('../../../database/emojis.json')

module.exports = {
    name: 'bugs',
    aliases: ['erros'],
    category: 'owner',
    emoji: `${e.Warn}`,
    usage: '<bugs>',
    description: 'Permite meu criador ver uma lista de bugs decorrentes.',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        let bugs = sdb.get('ComandosBloqueados') || []
        if (!bugs.length) return message.reply(`${e.Check} | Nenhum bug na lista.`)

        const BugsMapped = bugs.map(bug => `**${bug.cmd}**\n\`${bug.error}\``).join('\n'),
            Embed = new MessageEmbed()
                .setColor(client.blue)
                .setTitle(`${e.Gear} Lista de Bugs`)
                .setDescription(`${BugsMapped}`)
                .setFooter(`${bugs.length || 0} Bugs`)

        return message.channel.send({ embeds: [Embed] })
    }
}