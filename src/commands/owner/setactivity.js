const { e } = require('../../../database/emojis.json')
const Error = require('../../../Routes/functions/errors')

module.exports = {
    name: 'setactivity',
    aliases: ['activity', 'botstatus'],
    category: 'owner',
    emoji: `${e.OwnerCrow}`,
    usage: '<status> <NOVOSTATUS> | <activity> <Nova atividade> | <online/idle/dnd/invisible>',
    description: 'Permite meu criador alterar as informações no meu perfil',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        if (['atividade', 'activity', 'atv'].includes(args[0]?.toLowerCase())) return SetActivity()
        if (['action', 'ação'].includes(args[0]?.toLowerCase())) return SetAction()
        if (['status'].includes(args[0]?.toLowerCase())) return SetStatus()
        return message.reply(`${e.SaphireObs} | Aqui vai os comandos deste comando:\n\`${prefix}setactivity <atividade> No atividade (35 carac max)\`\n\`${prefix}setactivity <action> Opções: PLAYING, STREAMING, LISTENING, WATCHING, CUSTOM, COMPETING\`\n\`${prefix}setactivity <status> Opções: online, idle, invisible, dnd\``)

        function SetActivity() {
            if (args.slice(1).join(' ').length > 35) return message.reply(`${e.Deny} | Limite máx: 35 caracteres.`)
            try {
                client.user.setActivity(args.slice(1).join(' '))
                sdb.set('Client.Status.SetActivity', args.slice(1).join(' '))
                return message.reply(`${e.Check} | Minha nova atividade é: **${args.slice(1).join(' ')}**`)
            } catch (err) {
                Error(message, err)
                sdb.delete('Client.Status.SetActivity')
                message.reply(`${e.Deny} | Error: \`${err}\``)
            }
        }

        function SetAction() {
            if (['PLAYING', 'STREAMING', 'LISTENING', 'WATCHING', 'COMPETING'].includes(args[1])) {
                try {
                    let Action = args[1].toUpperCase()
                    client.user.setActivity(`${sdb.get('Client.Status.SetActivity') || 'WATCHING'}`, { type: `${Action}` })
                    sdb.set('Client.Status.SetAction', Action)
                } catch (err) {
                    Error(message, err)
                    sdb.delete('Client.Status.SetAction');
                    message.reply(`${e.Deny} | Error: \`${err}\``)
                }
            } else {
                sdb.delete('Client.Status.SetAction')
                return message.reply(`${e.SaphireObs} | Opções: PLAYING, STREAMING, LISTENING, WATCHING, COMPETING`)
            }
        }

        function SetStatus() {
            if (['online', 'idle', 'invisible', 'dnd'].includes(args[1]?.toLowerCase())) {
                try {
                    let Status = args[1]?.toUpperCase()
                    client.user.setStatus(`${Status}`)
                    sdb.set('Client.Status.setStatus', Status)
                    return message.reply(`${e.Check} | Feito! Meu novo status agora é: ${Status}`)
                } catch (err) {
                    Error(message, err)
                    sdb.delete('Client.Status.setStatus');
                    message.reply(`${e.Deny} | Error: \`${err}\``)
                }
            } else {
                sdb.delete('Client.Status.setStatus')
                return message.reply(`${e.SaphireObs} | Opções: online, idle, invisible, dnd`)
            }
        }
    }
}