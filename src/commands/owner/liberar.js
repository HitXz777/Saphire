const { e } = require('../../../database/emojis.json')

module.exports = {
    name: 'liberar',
    aliases: ['destravar', 'open'],
    category: 'owner',
    emoji: `${e.OwnerCrow}`,
    usage: '<Nome do Comando> | <All>',
    description: 'Permite meu criador liberar comandos bloqueados pelo meu sistema',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        if (!args[0]) return message.reply(`${e.Info} | Apenas o nome do comando que deseja desbloquear.\nExemplo: \`${prefix}liberar botinfo\``)

        if (['tudo', 'all'].includes(args[0]?.toLowerCase())) {
            sdb.delete('ComandosBloqueados')
            return message.reply(`${e.Check} | Todos os comandos foram liberados.`)
        }

        const BlockCommands = sdb.get('ComandosBloqueados') || [],
            Command = BlockCommands.find(cmd => cmd.cmd === args[0])

        if (!BlockCommands.length > 0)
            return message.reply(`${e.Deny} | Não há nenhum comando bloqueado.`)

        if (!Command)
            return message.reply(`${e.Deny} | Comando não encontrado na lista de comandos bloqueados.`)

        sdb.delete('ComandosBloqueados')

        for (const cmd of BlockCommands)
            if (cmd.cmd !== Command.cmd)
                sdb.push('ComandosBloqueados', cmd)

        return message.reply(`${e.Check} | O comando \`${args[0]}\` foi liberado com sucesso!`)

    }
}