const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'createinvite', // Ideia parcial do comando: Dspofu#1648
    aliases: ['join'],
    category: 'owner',
    emoji: `${e.OwnerCrow}`,
    owner: true,
    usage: '<createinvite> <GuildID>',
    description: 'Permite meu criador criar um convite de qualquer servidor',

    run: async (client, message, args, prefix, MessageEmbed, Database) => {

        if (!args[0]) return message.reply(`${e.Deny} | Informe o ID do servidor para que eu possa criar o convite.`)

        let Guild = client.guilds.cache.get(`${args[0]}`)
        if (!Guild) return message.reply(`${e.Deny} | Servidor não encontrado`)

        let channel = await Guild.channels.cache.find(channel => channel.type === 'GUILD_TEXT' && channel.permissionsFor(channel.guild.me).has('CREATE_INSTANT_INVITE'))

        if (!channel)
            return message.reply(`${e.Deny} | Nenhum canal foi encontrado para a criação do convite.`)

        return channel.createInvite({ maxAge: 0 })
            .then(invite => message.reply({ content: `${e.Check} | Convite criado com sucesso!\n🔗 | ${invite}` }))
            .catch(err => message.reply(`${e.Warn} | Deu ruim.\n> \`${err}\``))

    }
}