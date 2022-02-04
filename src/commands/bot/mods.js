const { e } = require('../../../database/emojis.json')

module.exports = {
    name: 'mods',
    aliases: ['moderadores'],
    category: 'bot',
    emoji: `${e.ModShield}`,
    usage: '<mods>',
    description: 'Moderadores da Saphire',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        let mods = Object.entries(sdb.get('Client.Moderadores') || [])
        if (!mods.length) return message.reply(`${e.Check} | Nenhum mod na lista.`)

        const Embed = new MessageEmbed()
            .setColor('#246FE0')
            .setTitle(`${e.ModShield} Lista de Moderadores`)
            .setDescription(`${mods.map(([a, b]) => `**${client.users.cache.get(a)?.tag || 'Não encontrei este usuário'}**\n\`${b}\``).join('\n')}`)
        return message.channel.send({ embeds: [Embed] })
    }
}