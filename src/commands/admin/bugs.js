const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'bugs',
    aliases: ['erros'],
    category: 'admin',
    emoji: `${e.Warn}`,
    usage: '<bugs>',
    admin: true,
    description: 'Permite meus administradores ver a lista de comandos bugados',

    run: async (client, message, args, prefix, MessageEmbed, Database) => {

        let clientData = await Database.Client.findOne({ id: client.user.id }, 'ComandosBloqueados')
        let bugs = clientData.ComandosBloqueados || []

        if (bugs.length === 0 || !clientData) return message.reply(`${e.Database} | Database | Nenhum dado foi encontrado.`)

        const BugsMapped = bugs.map(bug => `**${bug.cmd}**\n\`${bug.error}\``).join('\n'),
            Embed = new MessageEmbed()
                .setColor(client.blue)
                .setTitle(`${e.Gear} Lista de Bugs`)
                .setDescription(`${BugsMapped}`)
                .setFooter({ text: `${bugs.length || 0} Bugs` })

        return message.channel.send({ embeds: [Embed] })
    }
}