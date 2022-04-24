const { e } = require('../../../JSON/emojis.json'),
    Moeda = require('../../../modules/functions/public/moeda'),
    { Util } = require('discord.js')

module.exports = {
    name: 'setmoeda',
    aliases: ['nomemoeda', 'editmoeda', 'setmoedaname'],
    category: 'config',
    UserPermissions: ['MANAGE_GUILD'],
    emoji: `${e.ModShield}`,
    usage: '<setmoeda> [emoji] [NomeDaMoeda]',
    description: 'Configure a moeda do jeito que você quiser',

    run: async (client, message, args, prefix, MessageEmbed, Database) => {

        let guildData = await Database.Guild.findOne({ id: message.guild.id }, 'Moeda')
        let moedaAtual = guildData.Moeda

        if (!args[0]) return message.reply({
            embeds: [
                new MessageEmbed()
                    .setColor('#246FE0')
                    .setTitle(`${e.Info} Edite a moeda do servidor`)
                    .setDescription(`${e.SaphireObs} Com este comando você pode editar o Emoji e o nome da Moeda no servidor.`)
                    .addFields(
                        {
                            name: `${e.PandaProfit} Moeda Atual`,
                            value: await Moeda(message)
                        },
                        {
                            name: `${e.On} Edite a Moeda`,
                            value: `\`${prefix}setmoeda [EmojiCustom] [NomeDaMoeda]\``
                        },
                        {
                            name: `${e.Off} Resete a Moeda`,
                            value: `\`${prefix}setmoeda reset\``
                        }
                    )
                    .setFooter('Não pode ter espaços no nome da moeda')
            ]
        })

        if (args[2]) return message.reply(`${e.Deny} | Nada além do emoji e do nome da moeda.\n${e.SaphireObs} | O nome da moeda não pode conter espaços.\n${e.Gear} | Comando: \`${prefix}setmoeda [Emoji(opcional)] NomeDaMoeda\``)
        if (['reset', 'del', 'deletar', 'off'].includes(args[0]?.toLowerCase())) return ResetMoeda()

        let Emoji = Util.parseEmoji(args[0])
        let NomeDaMoeda = args[1]
        if (!args[1]) return message.reply(`${e.Deny} | Primeiro um emoji customizado, depois o nome da moeda.\n${e.Gear} | Comando: \`${prefix}setmoeda [Emoji] NomeDaMoeda\``)

        if (Emoji.id) {
            Emoji = message.guild.emojis.cache.find(emoji => emoji.id === Emoji.id)
            if (!Emoji) return message.reply(`${e.Deny} | Eu não consegui encontrar o emoji, tenta denovo.\n${e.Gear} | Comando: \`${prefix}setmoeda [Emoji] NomeDaMoeda\``)
        } else {
            return message.reply(`${e.Deny} | Primeiro um emoji customizado, depois o nome da moeda.\n${e.Gear} | Comando: \`${prefix}setmoeda [Emoji] NomeDaMoeda\``)
        }

        if (!NomeDaMoeda || NomeDaMoeda.length > 15) return message.reply(`${e.Deny} | O nome da moeda não deve estar entre **15 caracteres.**\n${e.Gear} | Comando: \`${prefix}setmoeda [Emoji] NomeDaMoeda\``)
        if (Emoji && NomeDaMoeda) return SetMoeda()
        return message.reply(`${e.Info} | Certifique-se de que você está usando o comando corretamente.\n${e.Gear} | Comando: \`${prefix}setmoeda [Emoji] NomeDaMoeda\``)

        async function SetMoeda() {

            await Database.Guild.updateOne(
                { id: message.guild.id },
                { Moeda: `${Emoji} ${NomeDaMoeda}` }
            )

            return message.channel.send(`${e.Check} | ${message.author} trocou minha moeda para "${Emoji} ${NomeDaMoeda}"`)
        }

        async function ResetMoeda() {
            if (!moedaAtual)
                return message.reply(`${e.Deny} | A moeda atual já é o padrão.`)

            await Database.Guild.updateOne(
                { id: message.guild.id },
                { $unset: { Moeda: 1 } }
            )

            return message.channel.send(`${e.Check} | ${message.author} resetou minha moeda para "${e.Coin} Safiras".`)

        }
    }
}
