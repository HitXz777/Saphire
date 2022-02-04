const { lotery, DatabaseObj: { e, config }, Clan, Transactions, Reminders } = require('../../../Routes/functions/database'),
    DeleteUser = require('../../../Routes/functions/deleteUser'),
    Vip = require('../../../Routes/functions/vip')

module.exports = {
    name: 'delete',
    aliases: ['del'],
    usage: '<item/class/Cache> [@user]',
    ClientPermissions: ['ADD_REACTIONS'],
    emoji: `${e.OwnerCrow}`,
    description: 'permite meu criador deletar qualquer coisa de qualquer um dentro do meu sistema',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        if (message.author.id !== config.ownerId) return message.reply(`${e.OwnerCrow} | Este é um comando exclusivo do Owner/Developer.`)
        if (!config.ownerId) return message.reply(`${e.Deny} | Comando bloqueado.`)

        if (!args[0]) { return message.reply({ embeds: [new MessageEmbed().setColor('#246FE0').setTitle('📋 Comandos Exclusivos de Delete (OWNER)').setDescription('Com este comando, o meu criador torna possível a opção de Deletar qualquer item de qualquer pessoa.').addField('Comando', '`' + prefix + 'del Item @user`').setFooter(`${prefix}itens`)] }) }

        if (['request', 'requests'].includes(args[0]?.toLowerCase())) {
            sdb.delete('Request')
            return message.reply(`${e.Check} Todas as request de todos os servidores foram apagadas.`)
        }

        if (['servers', 'servidores'].includes(args[0]?.toLowerCase())) {
            ServerDb.delete('Servers')
            return message.reply(`${e.Check} Todas as informações de todos os servidores foram apagadas.`)
        }

        if (['users', 'usuários', 'usuarios'].includes(args[0]?.toLowerCase())) {
            sdb.delete('Users')
            return message.reply(`${e.Check} Todas as informações de todos os usuários foram apagadas.`)
        }

        if (['xpall'].includes(args[0]?.toLowerCase())) {
            let i
            message.channel.send(`${e.Loading} | Deletando todo o banco de dados referente a classe **Experiência**`).then(async msg => {
                await client.users.cache.forEach(user => {
                    i++
                    sdb.delete(`Users.${user.id}.Level`)
                    sdb.delete(`Users.${user.id}.Xp`)
                })
                message.channel.send(`${e.Check} | O Sistema de Experiência deletou ${i || 0} usuários com sucesso.`)
            })
        }

        if (['lotery', 'loteria'].includes(args[0]?.toLowerCase())) {
            lotery.clear()
            return message.reply(`${e.Check} | Feito!`)
        }

        let u = message.mentions.members.first() || message.mentions.repliedUser || await client.users.cache.get(args[1])
        if (!u) return message.reply(`${e.Deny} | Não achei ninguém.`)
        let user = await client.users.cache.get(u.id)

        if (['cache'].includes(args[0]?.toLowerCase())) {
            sdb.delete(`Users.${user.id}.Cache`)
            return message.reply(`${e.Check} | Feito!`)
        }

        if (['bl', 'blacklist'].includes(args[0]?.toLowerCase())) {
            db.delete(`Blacklist_${args[1]}`)
            sdb.pull('Client.Blacklist.Users', args[1])
            sdb.delete(`Blacklist.${args[1]}`)
            db.delete(`BlacklistServers_${args[1]}`)
            sdb.delete(`BlacklistServers.${args[1]}`)
            return message.reply(`${e.Check} | Feito!`)
        }

        if (['bitcoin', 'bitcoins'].includes(args[0]?.toLowerCase())) {
            db.delete(`Bitcoin_${user.id}`)
            return message.reply(`${e.Check} | Feito!`)
        }

        if (['user', 'usuário'].includes(args[0]?.toLowerCase())) {

            if (!sdb.get(`Users.${user.id}`))
                return message.reply(`${e.Info} | Este usuário não existe na minha database.`)

            DeleteUser(user.id)
            return message.reply(`${e.Check} | Todos os dados de ${user?.tag || '**Usuário não encontrado**'} foram deletados.`)
        }

        if (['vip'].includes(args[0]?.toLowerCase())) {

            if (!Vip(`${user.id}`))
                return message.reply(`${e.Deny} | Este usuário não é vip.`)

            sdb.delete(`Users.${user.id}.Timeouts.Vip`)
            return message.reply(`${e.Check} O vip de ${user} foi deletado.`)
        }

        if (['banco', 'bank'].includes(args[0]?.toLowerCase())) {
            sdb.delete(`Users.${user.id}.Bank`)
            return message.reply(`${e.Check} | Feito!`)
        }

        if (['resgate'].includes(args[0]?.toLowerCase())) {
            sdb.delete(`Users.${user.id}.Cache.Resgate`)
            return message.reply(`${e.Check} | Feito!`)
        }

        if (['cachorro', 'doguinho', 'dog'].includes(args[0]?.toLowerCase())) {
            sdb.delete(`Users.${user.id}.Slot.Cachorro`)
            return message.reply(`${e.Check} | Feito!`)
        }

        if (['money', 'coins', 'moedas', 'dinheiro'].includes(args[0]?.toLowerCase())) {
            sdb.delete(`Users.${user.id}.Bank`)
            sdb.delete(`Users.${user.id}.Balance`)
            sdb.delete(`Users.${user.id}.Cache.Resgate`)
            return message.reply(`${e.Check} | Feito!`)
        }

        if (['medalha'].includes(args[0]?.toLowerCase())) {
            sdb.delete(`Users.${user.id}.Slot.Medalha`)
            return message.reply(`${e.Check} | Feito!`)
        }

        if (['estrelas', 'estrela'].includes(args[0]?.toLowerCase())) {
            sdb.delete(`Users.${user.id}.Slot.Estrela`)
            return message.reply(`${e.Check} | Feito!`)
        }

        if (['status'].includes(args[0]?.toLowerCase())) {
            sdb.delete(`Users.${user.id}.Perfil.Status`)
            return message.reply(`${e.Check} | Feito!`)
        }

        if (['xp', 'level'].includes(args[0]?.toLowerCase())) {
            sdb.delete(`Users.${user.id}.Xp`)
            sdb.delete(`Users.${user.id}.Level`)
            return message.reply(`${e.Check} | Feito!`)
        }

        if (['clan'].includes(args[0]?.toLowerCase())) {

            if (!args[1])
                return message.reply(`${e.Info} | Forneça um Clan-KeyCode para a exclução.`)

            if (!Clan.get(`Clans.${args[1]}`))
                return message.reply(`${e.Deny} | Este clan não existe.`)

            Clan.delete(`Clans.${args[1]}`)
            return message.reply(`${e.Check} | Clan deletado com sucesso!`)
        }

        if (['marry', 'casal', 'casamento'].includes(args[0]?.toLowerCase())) {
            sdb.delete(`Users.${sdb.get(`Users.${user.id}.Perfil.Marry`)}.Perfil.Marry`)
            sdb.delete(`Users.${user.id}.Perfil.Marry`)
            return message.reply(`${e.Check} | Feito!`)
        }

        if (['family1'].includes(args[0]?.toLowerCase())) {
            if (!sdb.get(`Users.${user.id}.Perfil.Family.Um`))
                return message.reply(`${e.Deny} | ${user.tag} não possui um familiar na posição um.`)
            sdb.delete(`Users.${sdb.get(`Users.${user.id}.Perfil.Family.Um`)}.Perfil.Family.Um`)
            sdb.delete(`Users.${user.id}.Perfil.Family.Um`)
            return message.reply(`${e.Check} | Feito!`)
        }

        if (['family2'].includes(args[0]?.toLowerCase())) {
            if (!sdb.get(`Users.${user.id}.Perfil.Family.Dois`))
                return message.reply(`${e.Deny} | ${user.tag} não possui um familiar na posição dois.`)
            sdb.delete(`Users.${sdb.get(`Users.${user.id}.Perfil.Family.Dois`)}.Perfil.Family.Dois`)
            sdb.delete(`Users.${user.id}.Perfil.Family.Dois`)
            return message.reply(`${e.Check} | Feito!`)
        }

        if (['family3'].includes(args[0]?.toLowerCase())) {
            if (!sdb.get(`Users.${user.id}.Perfil.Family.Tres`))
                return message.reply(`${e.Deny} | ${user.tag} não possui um familiar na posição três.`)
            sdb.delete(`Users.${sdb.get(`Users.${user.id}.Perfil.Family.Tres`)}.Perfil.Family.Tres`)
            sdb.delete(`Users.${user.id}.Perfil.Family.Tres`)
            return message.reply(`${e.Check} | Feito!`)
        }

        if (['title', 'titulo', 'título'].includes(args[0]?.toLowerCase())) {
            sdb.delete(`Users.${user.id}.Perfil.TitlePerm`)
            return message.reply(`${e.Check} | Feito!`)
        }

        if (['timing', 'timeout', 'cooldown', 't'].includes(args[0]?.toLowerCase())) {
            if (args[1] === 'divida') {
                sdb.delete(`Client.Timeouts.RestoreDividas`)
                return message.reply(`${e.Check} | Feito!`)
            }

            const VipObj = {
                DateNow: sdb.get(`Users.${user.id}.Timeouts.Vip.DateNow`),
                TimeRemaing: sdb.get(`Users.${user.id}.Timeouts.Vip.TimeRemaing`)
            }

            if (Vip(`${user.id}`)) {
                sdb.set(`Users.${user.id}.Timeouts`, { Vip: VipObj })
            } else {
                sdb.delete(`Users.${user.id}.Timeouts`)
            }

            return message.reply(`${e.Check} | Feito!`)
        }

        if (['remedio', 'remédio'].includes(args[0]?.toLowerCase())) {
            sdb.delete(`Users.${user.id}.Slot.Remedio`)
            return message.reply(`${e.Check} | Feito!`)
        }

        if (['niver', 'aniversário', 'aniversario'].includes(args[0]?.toLowerCase())) {
            sdb.delete(`Users.${user.id}.Perfil.Aniversario`)
            return message.reply(`${e.Check} | Feito!`)
        }

        return message.reply(`${e.Deny} Comando não encontrado no registro.`)
    }
}