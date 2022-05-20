const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'bloquear',
    category: 'admin',
    admin: true,
    emoji: e.Admin,
    usage: '<bloquear> <command>',
    description: 'Permite os administradores da Saphire bloquear qualquer comando',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {

        let Command = args[0],
            Reason = args.slice(1).join(' ') || 'Sem razão definida'

        if (!Command)
            return message.reply(`${e.Info} | Diga um comando para que eu possa bloquear.`)

        let commandClient = client.commands.get(Command) || client.commands.get(client.aliases.get(Command))

        if (!commandClient) return message.reply(`${e.Deny} | Comando não encontrado.`)

        let data = await Database.Client.findOne({ id: client.user.id }, 'ComandosBloqueados'),
            comandosBloqueados = data?.ComandosBloqueados || []

        if (comandosBloqueados?.some(cmds => cmds.cmd === commandClient.name))
            return message.reply(`${e.Info} | Este comando já está bloqueado.`)

        await Database.Client.updateOne(
            { id: client.user.id },
            { $push: { ComandosBloqueados: { $each: [{ cmd: commandClient.name, error: Reason }], $position: 0 } } }
        )

        return message.reply(`${e.Check} | O comando **${prefix}${commandClient.name}** foi bloqueado com a razão **${Reason}**`)
    }
}