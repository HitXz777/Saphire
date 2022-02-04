const { e } = require('../../../database/emojis.json')

module.exports = {
    name: 'set',
    aliases: ['setar'],
    category: 'owner',
    emoji: `${e.OwnerCrow}`,
    usage: '<set> <class> <user> <value>',
    description: 'Permite meu criador setar valores nos meus sistemas',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        let user = client.users.cache.get(args[1]) || message.mentions.users.first() || message.mentions.repliedUser

        if (!user) return message.reply(`${e.Deny} | Nenhum usuário mencionado`)

        switch (args[0]) {
            case 'level': SetNewLevel(); break;
            case 'mod': SetNewMod(); break;

            default:
                message.reply(`${e.Info} | Comando não encontrado na lista de opções.`)
                break;
        }

        function SetNewLevel() {

            let NewLevel = args[2] || args[1]

            if (!NewLevel || isNaN(NewLevel))
                return message.reply(`${e.Deny} | O argumento "New Level" não foi dado ou não é um número.`)

            let LevelSeted = sdb.set(`Users.${user.id}.Level`, parseInt(NewLevel))
            return message.reply(`${e.Check} | O level de ${user.tag} foi reconfigurado para **${LevelSeted}**`)

        }

        function SetNewMod() {
            if (sdb.get(`Client.Moderadores.${user.id}`) === user.id)
                return message.channel.send(`${e.Info} | ${user.username} já é um moderador*(a)*.`)

            sdb.set(`Client.Moderadores.${user.id}`, user.id)
            user.send(`Parabéns! Você agora é um **${e.ModShield} Official Moderator** no meu sistema.`).catch(err => {
                if (err.code === 50007)
                    return message.reply(`${e.Deny} | Não foi possível contactar este usuário.`)

                Error(message, err)
            })
            return message.channel.send(`${e.Check} | ${user.username} agora é um moderador*(a)*.`)
        }

    }
}