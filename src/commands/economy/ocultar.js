const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'ocultar',
    aliases: ['ocult'],
    category: 'economy',
    ClientPermissions: ['EMBED_LINKS'],
    emoji: `${e.Coin}`,
    usage: '<ocultar> [off]',
    description: 'Oculte o seu dinheiro para todos',

    run: async (client, message, args, prefix, MessageEmbed, Database) => {

        let data = await Database.User.findOne({ id: message.author.id }, 'Perfil.BalanceOcult'),
            oculto = data?.Perfil?.BalanceOcult

        return oculto
            ? (() => {
                Database.delete(message.author.id, 'Perfil.BalanceOcult')
                return message.reply(`${e.Check} | O seu dinheiro não está mais ocultado.`)
            })()
            : (() => {
                Database.updateUserData(message.author.id, 'Perfil.BalanceOcult', true)
                return message.reply(`${e.Check} | O seu dinheiro está ocultado.`)
            })()


    }
}
