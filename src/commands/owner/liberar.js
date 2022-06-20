const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'liberar',
    aliases: ['destravar', 'open'],
    category: 'owner',
    owner: true,
    emoji: `${e.OwnerCrow}`,
    usage: '<Nome do Comando> | <All>',
    description: 'Permite meu criador liberar comandos bloqueados pelo meu sistema',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {

        let clientData = await Database.Client.findOne({ id: client.user.id }, 'ComandosBloqueados')
        if (!clientData) return message.reply(`${e.Database} | Database | Nenhum dado foi encontrado.`)

        const comandosBloqueados = clientData?.ComandosBloqueados || []

        if (comandosBloqueados.length === 0)
            return message.reply(`${e.Deny} | Não há nenhum comando bloqueado.`)

        if (!args[0]) return message.reply(`${e.Info} | Apenas o nome do comando que deseja desbloquear.\nExemplo: \`${prefix}liberar botinfo\``)

        if (['tudo', 'all'].includes(args[0]?.toLowerCase())) {

            await Database.Client.updateOne(
                { id: client.user.id },
                { $unset: { ComandosBloqueados: 1 } }
            )

            return message.reply(`${e.Check} | Todos os comandos foram liberados.`)
        }

        let cmd = client.commands.get(args[0]) || client.commands.get(client.aliases.get(args[0]))

        if (!cmd) return message.reply(`${e.Deny} | Esse comando não existe.`)

        const CommandSearch = comandosBloqueados?.find(Cmd => Cmd.cmd === cmd?.name)

        if (!CommandSearch)
            return message.reply(`${e.Deny} | Comando não encontrado na lista de comandos bloqueados.`)

        await Database.Client.updateOne(
            { id: client.user.id },
            { $pull: { ComandosBloqueados: { cmd: cmd.name } } }
        )

        return message.reply(`${e.Check} | O comando \`${cmd.name}\` foi liberado com sucesso!`)

    }
}

