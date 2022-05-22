const { DatabaseObj: { e, config } } = require('../../../modules/functions/plugins/database'),
    Moeda = require('../../../modules/functions/public/moeda'),
    atalhos = ['b', 'bal', 'money', 'banco', 'dinheiro', 'conta', 'saldo', 'coins', 'coin', 'atm', 'carteira', 'bank']

module.exports = {
    name: 'balance',
    aliases: atalhos,
    category: 'economy',
    emoji: `${e.Coin}`,
    ClientPermissions: ['ADD_REACTIONS'],
    usage: '<bal> [@user]',
    description: 'Confira as finanças',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {

        let MoedaCustom = await Moeda(message)

        if (['info', 'help', 'ajuda'].includes(args[0]?.toLowerCase())) return BalInfo()

        let user = client.getUser(client, message, args, 'user') || message.author

        if (user.id === client.user.id) return message.reply(`👝 | ${user.username} possui **∞ ${MoedaCustom}**`)

        let userData = await Database.User.findOne(user.id, 'Balance Perfil')

        if (!userData) return message.reply(`${e.Database} | DATABASE | Não foi possível obter os dados de **${user.tag}** *\`${user.id}\`*`)

        let bal = parseInt(userData?.Balance) || 0,
            oculto = userData?.Perfil?.BalanceOcult,
            balance = oculto ? `||oculto ${MoedaCustom}||` : `${bal} ${MoedaCustom}`,
            NameOrUsername = user.id === message.author.id ? 'O seu saldo é de' : `${user?.username} possui`,
            msg = await message.reply(`👝 | ${NameOrUsername} **${balance}**`)

        if (oculto) msg.react('👁️').catch(() => { })

        return msg.createReactionCollector({
            filter: (reaction, u) => reaction.emoji.name === '👁️' && u.id === config.ownerId || u.id === user.id,
            idle: 30000
        })
            .on('collect', (reaction, u) => {

                let BalanceAtEmbed = `👝 | ${NameOrUsername} **${bal} ${MoedaCustom}**`,
                    oculted = `👝 | ${NameOrUsername} **||oculto ${MoedaCustom}||**`

                editMessage = msg.content === BalanceAtEmbed ? oculted : BalanceAtEmbed

                return msg.edit(`${editMessage}`).catch(() => { })

            })

        function BalInfo() {
            return message.reply({
                embeds: [
                    new MessageEmbed()
                        .setColor(client.blue)
                        .setTitle(`${e.MoneyWings} ${client.user.username} Balance Info`)
                        .setDescription(`No balance você pode ver quantas ${MoedaCustom} você ou alguém tem`)
                        .addFields(
                            {
                                name: '👝 Saldo',
                                value: 'O saldo é toda a quantia de dinheiro que você ou alguém possui.'
                            },
                            {
                                name: '👁️ Oculto',
                                value: `Membros que ocultaram o saldo não é visível para outros players a não ser que aperte no olho. Você pode ocultar seu saldo utilizando o comando \`${prefix}ocultar\``
                            },
                            {
                                name: `${e.Gear} Atalhos`,
                                value: atalhos.map(alias => `\`${prefix}${alias}\``).join(', ')
                            }
                        )
                ]
            })
        }
    }
}