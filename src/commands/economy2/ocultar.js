const { e } = require('../../../database/emojis.json')

module.exports = {
    name: 'ocultar',
    aliases: ['ocult'],
    category: 'economy2',
    ClientPermissions: ['EMBED_LINKS'],
    emoji: `${e.Coin}`,
    usage: '<ocultar> [off]',
    description: 'Oculte o dinheiro do seu banco para todos',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        let oculto = sdb.get(`Users.${message.author.id}.Perfil.BankOcult`)
        if (args[1]) return message.reply(`${e.Deny} | Não diga nada além do comando em si.`)

        if (['off', 'desligar', 'no'].includes(args[0]?.toLowerCase())) {
            if (!oculto) {
                return message.reply(`${e.Deny} | O seu banco não está ocultado.`)
            } else {
                sdb.delete(`Users.${message.author.id}.Perfil.BankOcult`)
                return message.reply(`${e.Check} | O seu banco não está mais ocultado.`)
            }
        }

        if (oculto) {
            return message.reply(`${e.Deny} | O seu banco já está ocultado.`)
        } else {
            sdb.set(`Users.${message.author.id}.Perfil.BankOcult`, true)
            return message.reply(`${e.Check} | O seu banco está ocultado.`)
        }

    }
}
