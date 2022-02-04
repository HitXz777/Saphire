const { e } = require('../../../database/emojis.json')

module.exports = {
    name: 'setavatar',
    aliases: ['botavatar', 'botfoto'],
    category: 'owner',
    emoji: `${e.OwnerCrow}`,
    usage: ' <link>',
    description: 'Permite meu criador mudar minha foto de perfil.',
    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        if (!args[0]) { return message.reply(`\`${prefix}setavatar https://www.linkdafoto.com\``) }
        let link = args[0]

        function is_url(str) {
            let regexp = /^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/
            if (regexp.test(str)) { return true } else { return false }
        }
        if (is_url(link) === false) { return message.reply('Isso não é um link!') }

        if (args[1]) {
            return message.reply('Nada além do link!')
        } else {
            client.user.setAvatar(link).then(() => {
                return message.reply(`${e.Check} Foto de perfil trocada com sucesso!`)
            }).catch(err => {
                return message.reply(`Ocorreu um erro ao mudar a foto de perfil.\n\`${err}\``)
            })
        }
    }
}