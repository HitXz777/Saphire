const { DatabaseObj: { e, config } } = require('../../../modules/functions/plugins/database'),
    Vip = require('../../../modules/functions/public/vip')

module.exports = {
    name: 'delete',
    aliases: ['del', 'remove', 'remover'],
    usage: '<item/class/Cache> [@user]',
    ClientPermissions: ['ADD_REACTIONS'],
    emoji: `${e.OwnerCrow}`,
    admin: true,
    category: 'owner',
    description: 'Permite meu criador deletar qualquer coisa de qualquer lugar dentro do meu sistema',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {

        if (!args[0]) return message.reply({ embeds: [new MessageEmbed().setColor('#246FE0').setTitle('📋 Comandos Exclusivos de Delete (OWNER)').setDescription('Com este comando, o meu criador torna possível a opção de Deletar qualquer item de qualquer pessoa.').addField('Comando', '`' + prefix + 'del Item @user`').setFooter({ text: `${prefix}itens` })] })

        let user = message.mentions.users.first() || message.mentions.repliedUser || await client.users.cache.get(args[1])
        if (!user) return message.reply(`${e.Deny} | Não achei ninguém.`)

        if (['admins', 'administrador', 'administrator', 'admin', 'adm'].includes(args[0]?.toLowerCase())) {

            let clientData = await Database.Client.findOne({ id: client.user.id }, 'Administradores'),
                admins = clientData?.Administradores || []

            if (!admins || admins.length === 0) return message.reply(`${e.Info} | Não tem ninguém com a permissão "Administrador" ativada.`)

            if (!admins.includes(user.id))
                return message.reply(`${e.Deny} | Este usuário não se encontra na lista de Administradores.`)

            await Database.Client.updateOne(
                { id: client.user.id },
                { $pull: { Administradores: user.id } }
            )
            return message.reply(`${e.Check} | Usuário removido da lista de Administradores.`)
        }

        if (['bgacess'].includes(args[0]?.toLowerCase())) {

            let data = await Database.Client.findOne({ id: client.user.id }, 'BackgroundAcess')

            if (!data || !data.BackgroundAcess || data.BackgroundAcess.length === 0)
                return message.reply(`${e.Info} | Não a ninguém na lista de acesso dos backgrounds.`)

            if (!data.BackgroundAcess?.includes(user.id))
                return message.reply(`${e.Deny} | Este usuário não está na lista de usuários de backgrounds.`)

            await Database.Client.updateOne(
                { id: client.user.id },
                { $pull: { BackgroundAcess: user.id } }
            )

            return message.reply(`${e.Check} | Feito!`)
        }

        if (['mods', 'moderador', 'moderator', 'mod'].includes(args[0]?.toLowerCase())) {

            let clientData = await Database.Client.findOne({ id: client.user.id }, 'Moderadores'),
                mods = clientData?.Moderadores || []

            if (!mods || mods.length === 0) return message.reply(`${e.Info} | Não tem ninguém com a permissão "Moderador" ativada.`)

            if (!mods.includes(user.id))
                return message.reply(`${e.Deny} | Este usuário não se encontra na lista de Moderadores.`)

            await Database.Client.updateOne(
                { id: client.user.id },
                { $pull: { Moderadores: user.id } }
            )
            return message.reply(`${e.Check} | Usuário removido da lista de Moderadores.`)
        }

        if (['bl', 'blacklist'].includes(args[0]?.toLowerCase())) {

            let clientData = await Database.Client.findOne({ id: client.user.id }, 'Blacklist.Users'),
                blacklist = clientData.Blacklist?.Users || []

            if (!blacklist.includes(user.id))
                return message.reply(`${e.Deny} | Este usuário não se encontra na blacklist.`)

            await Database.Client.updateOne(
                { id: client.user.id },
                { $pull: { 'Blacklist.Users': user.id } }
            )

            return message.reply(`${e.Check} | Feito!`)
        }

        if (['bitcoin', 'bitcoins'].includes(args[0]?.toLowerCase())) {
            Database.delete(user.id, 'Perfil.Bits')
            return message.reply(`${e.Check} | Feito!`)
        }

        if (['user', 'usuário'].includes(args[0]?.toLowerCase())) {

            let u = await Database.User.findOne({ id: user.id })

            if (!u)
                return message.reply(`${e.Info} | Este usuário não existe na minha database.`)

            Database.deleteUser(user.id)
            return message.reply(`${e.Check} | Todos os dados de ${user?.tag || '**Usuário não encontrado**'} foram deletados.`)
        }

        if (['vip'].includes(args[0]?.toLowerCase())) {

            if (!Vip(`${user.id}`))
                return message.reply(`${e.Deny} | Este usuário não é vip.`)

            Database.delete(user.id, 'Vip')
            return message.reply(`${e.Check} O vip de ${user} foi deletado.`)
        }

        if (['money', 'coins', 'moedas', 'safira', 'safiras', 'dinheiro'].includes(args[0]?.toLowerCase())) {
            Database.delete(user.id, 'Balance')
            Database.PushTransaction(user.id, `${e.Admin} Dinheiro resetado por um Administrador.`)
            return message.reply(`${e.Check} | Feito!`)
        }

        if (['estrelas', 'estrela'].includes(args[0]?.toLowerCase())) {
            Database.delete(user.id, 'Perfil.Estrela')
            return message.reply(`${e.Check} | Feito!`)
        }

        if (['status'].includes(args[0]?.toLowerCase())) {
            Database.delete(user.id, 'Perfil.Status')
            return message.reply(`${e.Check} | Feito!`)
        }

        if (['xp', 'level'].includes(args[0]?.toLowerCase())) {
            Database.delete(user.id, 'Xp')
            Database.delete(user.id, 'Level')
            return message.reply(`${e.Check} | Feito!`)
        }

        if (['clan'].includes(args[0]?.toLowerCase())) {

            if (!args[1])
                return message.reply(`${e.Info} | Forneça um Clan-KeyCode para a exclução.`)

            let clan = await Database.Clan.findOne({ id: args[1] })

            if (!clan)
                return message.reply(`${e.Deny} | Este clan não existe.`)

            Database.Clan.deleteOne({ id: args[1] })
            return message.reply(`${e.Check} | Clan deletado com sucesso!`)
        }

        if (['marry', 'casal', 'casamento'].includes(args[0]?.toLowerCase())) {

            let u = await Database.User.findOne({ id: user.id }, 'Perfil.Marry')

            if (!u)
                return message.reply(`${e.Deny} | Este usuário não existe na minha database.`)

            Database.delete(u.Perfil?.Marry?.Conjugate, 'Perfil.Marry')
            Database.delete(user.id, 'Perfil.Marry')

            return message.reply(`${e.Check} | Feito!`)
        }

        if (['title', 'titulo', 'título'].includes(args[0]?.toLowerCase())) {
            Database.delete(user.id, 'Perfil.TitlePerm')
            Database.delete(user.id, 'Perfil.Titulo')
            return message.reply(`${e.Check} | Feito!`)
        }

        if (['timing', 'timeout', 'cooldown', 't'].includes(args[0]?.toLowerCase())) {
            Database.delete(user.id, 'Timeouts')
            return message.reply(`${e.Check} | Feito!`)
        }

        if (['niver', 'aniversário', 'aniversario'].includes(args[0]?.toLowerCase())) {
            Database.delete(user.id, 'Perfil.Aniversario')
            return message.reply(`${e.Check} | Feito!`)
        }

        return message.reply(`${e.Deny} Comando não encontrado no registro.`)
    }
}