const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'mods',
    aliases: ['moderadores'],
    category: 'bot',
    emoji: `${e.ModShield}`,
    usage: '<mods>',
    description: 'Moderadores da Saphire',

    run: async (client, message, args, prefix, MessageEmbed, Database) => {

        let clientData = await Database.Client.findOne({ id: client.user.id }, 'Moderadores'),
            mods = clientData?.Moderadores || []

        if (mods.length < 1) return message.reply(`${e.Check} | Nenhum mod na lista.`)

        return message.channel.send({
            embeds: [
                new MessageEmbed()
                    .setColor('#246FE0')
                    .setTitle(`${e.ModShield} Lista de Moderadores`)
                    .setDescription(`${mods.map(modId => `**${client.users.cache.get(modId)?.tag || 'Não encontrei este usuário'}**\n\`${modId}\``).join('\n')}`)
            ]
        })
    }
}