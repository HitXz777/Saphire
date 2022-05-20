const { DatabaseObj: { config, e, f }, conf } = require('../../../modules/functions/plugins/database')
const Data = require("../../../modules/functions/plugins/data")

module.exports = {
    name: 'eval',
    aliases: ['code', 'test', 'e'],
    category: 'owner',
    owner: true,
    emoji: `${e.OwnerCrow}`,
    usage: '<eval> <code>',
    description: 'Permite meu criador testar códigos',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {

        let code = args.join(" "),
            result,
            N = Database.Names

        if (!code) return message.reply({ content: "... Código." })

        try {
            result = eval(code)
            const EvalEmbed = new MessageEmbed().setColor('GREEN').addField('📥 Input', '```' + code + '```').addField('📤 Output', '```' + await result + '```')
            return message.reply({ embeds: [EvalEmbed] }).catch(err => message.channel.send(`${e.Deny} | Erro na resolução do código\n\`${err}\``))
        } catch (err) {
            const ErrorEmbed = new MessageEmbed().setColor('RED').addField('📥 Input', '```' + code + '```').addField('📤 Output', '```' + err + '```')
            return message.reply({ embeds: [ErrorEmbed] }).catch(err => message.channel.send(`${e.Deny} | Erro na resolução do código\n\`${err}\``))
        }
    }
}