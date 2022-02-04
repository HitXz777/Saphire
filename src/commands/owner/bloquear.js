const { e } = require('../../../database/emojis.json')

// #246FE0 - Azul Saphire
module.exports = {
    name: 'bloquear',
    category: 'owner',
    emoji: `${e.OwnerCrow}`,
    usage: '<bloquear> <command>',
    description: 'Permite meu criador bloquear qualquer comando',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        let Command = args[0],
            Reason = args.slice(1).join(' ') || 'Sem razão definida'

        if (!Command)
            return message.reply(`${e.Info} | Diga um comando para que eu possa bloquear.`)

        if (sdb.get('ComandosBloqueados')?.find(cmds => cmds.cmd === Command))
            return message.reply(`${e.Info} | Este comando já está bloqueado.`)

        sdb.push('ComandosBloqueados', { cmd: Command, error: Reason })
        return message.reply(`${e.Check} | O comando **${prefix}${Command}** foi bloqueado com a razão **${Reason}**`)
    }
}