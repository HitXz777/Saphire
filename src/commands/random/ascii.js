const ascii = require('figlet')
const { e } = require('../../../database/emojis.json')

module.exports = {
    name: 'ascii',
    aliases: ['asci'],
    category: 'random',
    
    
    emoji: '/\\/--',
    usage: '<ascii> <texto>',
    description: 'Transforme textos em ASCII',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        if (!args[0]) { return message.reply(`${e.Deny} | Diga algo para que eu posso transformar em ASCII, algo entre **1~12 Caracteres**.`) }
        if (args.join(' ').length >= 13) { return message.reply(`${e.Deny} | A mensagem não pode ultrapassar **12 caracteres**.`) }

        ascii(args.join(" "), function (err, data) {
            message.channel.send(`\`\`\`${data}\`\`\``).catch(err => { return message.channel.send(`${e.Deny} | Aconteceu um erro...\n\`${err}\``) })
        })
    }
}