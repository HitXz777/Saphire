const { DatabaseObj: { e, config } } = require('../../../Routes/functions/database'),
    Moeda = require('../../../Routes/functions/moeda'),
    Colors = require('../../../Routes/functions/colors'),
    ms = require('parse-ms'),
    GetTimeout = require('../../../Routes/functions/gettimeout'),
    Timeout = require('../../../Routes/functions/Timeout')

module.exports = {
    name: 'balance',
    aliases: ['b', 'bal', 'money', 'banco', 'dinheiro', 'conta', 'saldo', 'sp', 'coins', 'coin', 'atm', 'carteira', 'bank'],
    category: 'economy2',
    emoji: `${e.Coin}`,
    ClientPermissions: ['ADD_REACTIONS'],
    usage: '<bal> [@user]',
    description: 'Confira as finanças',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        if (['info', 'help', 'ajuda'].includes(args[0]?.toLowerCase())) return BalInfo()

        let user = message.mentions.users.first() || await client.users.cache.get(args[0]) || await message.mentions.repliedUser || client.users.cache.find(user => user.username?.toLowerCase() == args[0]?.toLowerCase() || user.tag?.toLowerCase() == args[0]?.toLowerCase()) || message.guild.members.cache.find(user => user.displayName?.toLowerCase() == args[0]?.toLowerCase() || user.user.username?.toLowerCase() == args[0]?.toLowerCase())?.user || message.author,
            Bolsa = Timeout(172800000, sdb.get(`Users${user.id}.Timeouts.Bolsa`))
                ? `${e.Loading} \`${GetTimeout(172800000, sdb.get(`Users${user.id}.Timeouts.Bolsa`))}\``
                : `${parseInt(sdb.get(`Users.${user.id}.Cache.BolsaLucro`)) || 0} ${Moeda(message)}`,
            bal = parseInt(sdb.get(`Users.${user.id}.Balance`)) || 0,
            bank = parseInt(sdb.get(`Users.${user.id}.Bank`)) || 0,
            oculto = sdb.get(`Users.${user.id}.Perfil.BankOcult`),
            cache = parseInt(sdb.get(`Users.${user.id}.Cache.Resgate`)) || 0,
            avatar = user?.displayAvatarURL({ dynamic: true }),
            NameOrUsername = user.id === message.author.id ? 'Suas finanças' : `Finanças de ${user?.username}`,
            control = true,
            embed = new MessageEmbed()
                .setColor(Colors(user))
                .setAuthor(`${NameOrUsername}`, avatar)
                .addField('👝 Carteira', `${bal} ${Moeda(message)}`)
                .addField('🏦 Banco', `${bank} ${Moeda(message)}`)
                .addField('📦 Cache', `${cache} ${Moeda(message)}`)
                .addField('📊 Bolsa de Valores', `${Bolsa}`)
                .setFooter(`Dúvidas? ${prefix}bal info`),
            OcultEmbed = new MessageEmbed()
                .setColor(Colors(user))
                .setAuthor(`${NameOrUsername}`, avatar)
                .addField('👝 Carteira', `||Ocultado ${Moeda(message)}||`)
                .addField('🏦 Banco', `||Ocultado ${Moeda(message)}||`)
                .addField('📦 Cache', `||Ocultado ${Moeda(message)}||`)
                .addField('📊 Bolsa de Valores', `||Ocultado||`)
                .setFooter(`Dúvidas? ${prefix}bal info`),
            msg = await message.reply({ embeds: [oculto ? OcultEmbed : embed] })

        msg.react('❌').catch(() => { })
        if (oculto) msg.react('👁️').catch(() => { })

        const collector = msg.createReactionCollector({
            filter: (reaction, user) => ['❌', '👁️'].includes(reaction.emoji.name),
            idle: 30000
        })

        .on('collect', (reaction, u) => {

            if (reaction.emoji.name === '❌' && u.id === message.author.id)
                return msg.delete().catch(() => { })

            if (reaction.emoji.name === '👁️' && u.id === config.ownerId || u.id === user.id) {

                return control
                    ? (() => {
                        control = false
                        return msg.edit({ embeds: [embed] }).catch(() => { })
                    })()
                    : (() => {
                        control = true
                        return msg.edit({ embeds: [OcultEmbed] }).catch(() => { })
                    })()

            }

        })

    return;

    function BalInfo() {
    return message.reply({
        embeds: [
            new MessageEmbed()
                .setColor(Colors(message.member))
                .setTitle(`${e.MoneyWings} ${client.user.username} Balance Info`)
                .setDescription(`No balance você pode ver quantas ${Moeda(message)} você ou alguém tem`)
                .addFields(
                    {
                        name: '👝 Carteira',
                        value: `A carteira é responsável por girar a economia. Você paga e utiliza o dinheiro que está na carteira. Porém, a carteira abre espaço para os comandos \`${prefix}roubar/assaltar\`, onde tomar dinheiro dos outros é possível. Então, tome cuidado com dinheiro na carteira.`
                    },
                    {
                        name: '🏦 Banco',
                        value: `O banco garante segurança. Você não pode utilizar o dinheiro no banco, ninguém pode roubar ou tomar seu dinheiro do banco. O banco também é a base para o \`${prefix}rank money\``
                    },
                    {
                        name: '📦 Cache',
                        value: `Todo o dinheiro que você no games da ${client.user.username} vão para o cache. Isso garante a sua segurança contra roubos.\n \n${e.QuestionMark} **Por que do Cache?**\nO cache foi criado para armazenar o dinheiro ganho nos jogos. Tornando o banco totalmente administrado pelo dono da conta. O cache garante segurança contra assaltos e roubos, impedindo que você perca seu dinheiro ganho nos games ou até mesmo na loteria.\n \n${e.QuestionMark} **Por que não adicionar direto no banco?**\nO banco é de total controle do dono da conta! Valores ganhos em games ir direto para a conta, pode confundir a cabeça dos jogadores. *Eu recebi o dinheiro? / Eu não lembro quanto eu tinha*.\nEnfim, isso evita muito problemas.\nObs: Para tirar dinheiro do cache, use \`${prefix}resgate\``
                    },
                    {
                        name: `${e.Gear} Comandos refentes ao balance`,
                        value: `\`${prefix}balance\` \`-b\` \`${prefix}bal\` \`${prefix}money\` \`${prefix}banco\` \`${prefix}dinheiro\` \`${prefix}conta\` \`${prefix}saldo\` \`${prefix}sp\` \`${prefix}coins\` \`${prefix}coin\` \`${prefix}atm\` \`${prefix}carteira\` \`${prefix}bank\`\n \n**${e.Info} Comandos Externos**\n\`${prefix}pix\` \`${prefix}pay\` \`${prefix}sacar\` \`${prefix}roubar\` \`${prefix}assaltar\` \`${prefix}resgatar\``
                    },
                    {
                        name: '📊 Bolsa de Valores',
                        value: `Você pode ver todos os dados da bolsa de valores utilizando: \`${prefix}bolsa info\``
                    }
                )
        ]
    })
}
    }
}