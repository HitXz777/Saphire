const Notify = require('./notify'),
    Database = require('../../classes/Database')

async function disableAntLinkSystem(message, end = false) {

    let data = await Database.Guild.findOne({ id: message.guild.id }, 'Prefix')

    await Database.Guild.updateOne(
        { id: message.guild.id },
        { $unset: { AntLink: 1 } }
    )

    return end
        ? Notify(message.guild.id, 'SISTEMA DESATIVADO | ANTILINK', 'Este servidor não é mais premium no meu sistema.')
        : Notify(message.guild.id, 'SISTEMA DESATIVADO | ANTILINK', `Verifique se eu realmente tenho a permissão \`"GERENCIAR MENSAGENS"\`. O sistema foi desativado, religue usando o comando \`${data.prefix || '-'}antilink on\` após a correção.`)

}

module.exports = disableAntLinkSystem