const { DatabaseObj: { e } } = require('../../../modules/functions/plugins/database'),
    { Permissions } = require('discord.js')

module.exports = {
    name: 'say',
    aliases: ['dizer', 'falar', 'enviar'],
    category: 'moderation',
    emoji: '🗣️',
    usage: '<say> <conteúdo da sua mensagem>',
    description: 'Diga algo no chat atráves de mim',

    run: async (client, message, args, prefix, MessageEmbed, Database) => {

        let clientData = await Database.Client.findOne({ id: client.user.id }, 'Moderadores Administradores'),
            mods = clientData.Moderadores || [],
            adms = clientData.Administradores || []

        if (!mods.includes(message.author.id) && !adms.includes(message.author.id) && !message.member.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES))
            return message.reply(`${e.Deny} | Permissão necessária: \`Gerenciar Mensagens\``)

        let Message = args.join(' ')
        if (!Message) return message.reply(`${e.Deny} | Você precisa dizer algo para que eu envie.`)

        let porAuthor = mods.includes(message.author.id) || adms.includes(message.author.id) ? '' : ` \n \n*Por: ${message.author.tag}*`

        message.delete().catch(() => { })
        return message.channel.send(`${Message}${porAuthor}`)

    }
}