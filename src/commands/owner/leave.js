const { e } = require('../../../database/emojis.json')

module.exports = {
    name: 'leave',
    aliases: ['sair', 'kitar'],
    category: 'owner',
    emoji: `${e.OwnerCrow}`,
    usage: '<leave> <GuildID>',
    description: 'Permite meu criador me tirar de qualquer servidor',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        if (!args[0]) return message.reply(`${e.Deny} | Informe o ID do servidor para que eu possa sair.`)

        let Guild = await client.guilds.cache.get(`${args[0]}`)

        if (!Guild) return message.reply(`${e.Deny} | Servidor não encontrado`)

        return Guild ? GuildExit() : message.channel.send(`${e.Deny} | Este servidor não existe ou eu não estou nele.`)

        function GuildExit() {
            Guild.leave().then(guild => {
                message.channel.send(`${e.Check} | Eu saí do servidor **${guild.name}** com sucesso!`)
            }).catch(err => {
                message.channel.send(`${e.Deny} | Este servidor não existe ou eu não estou nele.`)
            })
        }

    }
}