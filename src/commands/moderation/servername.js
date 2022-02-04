const { e } = require('../../../database/emojis.json')

module.exports = {
    name: 'servername',
    aliases: ['setservername'],
    category: 'moderation',
    UserPermissions: ['ADMINISTRATOR'],
    ClientPermissions: ['MANAGE_GUILD'],
    emoji: `${e.ModShield}`,
    usage: '<servername> <Novo Nome>',
    description: 'Mude o nome do servidor',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        let Name = args.join(' ')
        if (!Name) return message.reply(`${e.Deny} | Escolha um nome para o seu servidor`)
        if (Name.length > 100 || Name.length < 2) { return message.reply(`${e.Deny} | O nome do servidor deve estar entre **2~100 caracteres**`) }

        message.guild.setName(Name, [`${message.author.tag} foi o autor deste comando.`]).then(() => {
            return message.reply(`${e.Check} | Nome alterado com sucesso.`)
        }).catch(err => { return message.channel.send(`${e.Warn} | Houve um erro na execução deste comando.\n\`${err}\``) })
    }
}