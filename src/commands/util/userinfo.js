const { e } = require('../../../database/emojis.json'),
    { Permissions } = require('discord.js'),
    { config } = require('../../../database/config.json'),
    Colors = require('../../../Routes/functions/colors')

module.exports = {
    name: 'userinfo',
    aliases: ['ui'],
    category: 'util',
    ClientPermissions: ['EMBED_LINKS', 'ADD_REACTIONS'],
    emoji: `${e.Info}`,
    usage: '<userinfo> [@user]',
    description: 'Informações de usuários no Discord',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        // TODO: Melhorar o designer da embed do userinfo

        let user = message.mentions.members.first() || message.guild.members.cache.find(user => user.displayName?.toLowerCase() == args[0]?.toLowerCase() || user.user.username?.toLowerCase() == args[0]?.toLowerCase()) || message.member,
            flags = { DISCORD_EMPLOYEE: 'Discord Employee', DISCORD_PARTNER: 'Discord Partner', BUGHUNTER_LEVEL_1: 'Bug Hunter (Level 1)', BUGHUNTER_LEVEL_2: 'Bug Hunter (Level 2)', HYPESQUAD_EVENTS: 'HypeSquad Events', HOUSE_BRAVERY: 'House of Bravery', HOUSE_BRILLIANCE: 'House of Brilliance', HOUSE_BALANCE: 'House of Balance', EARLY_SUPPORTER: 'Early Supporter', TEAM_USER: 'Team User', SYSTEM: 'System', VERIFIED_BOT: 'Verified Bot', VERIFIED_DEVELOPER: 'Verified Bot Developer' },
            userFlags = user.user.flags.toArray(),
            Bandeiras = `${userFlags.length ? userFlags.map(flag => flags[flag]).join(', ') : 'Nenhuma'}`,
            username = user.user.username,
            tag = user.user.tag,
            id = user.user.id,
            system = user.user.system ? "Sim" : "Não",
            avatar = user.user.avatarURL({ dynamic: true, format: "png", size: 1024 }),
            bot = user.user.bot ? "Sim" : "Não",
            data = user.user.createdAt,
            DataFormatada = data.getDate() + "/" + (data.getMonth() + 1) + "/" + data.getFullYear() + " ás " + data.getHours() + "h " + data.getMinutes() + 'm e ' + data.getSeconds() + 's',
            Entrou = user.joinedAt,
            DataFormatadaGuild = Entrou.getDate() + "/" + (Entrou.getMonth() + 1) + "/" + Entrou.getFullYear() + " ás " + Entrou.getHours() + "h " + Entrou.getMinutes() + 'm e ' + Entrou.getSeconds() + 's',
            dono = (message.guild.ownerId === user.id) ? "Sim" : "Não",
            User = message.guild.members.cache.get(`${user.id}`),
            adm = User.permissions.has(Permissions.FLAGS.ADMINISTRATOR) ? "Sim" : "Não",
            banivel = User.bannable ? "Sim" : "Não",
            kick = User.kickable ? "Sim" : "Não",
            color = User.displayHexColor,
            nick = User.displayName,
            associado = User.pending ? "Não" : "Sim",
            premiumSince = User.premiumSinceTimestamp !== null ? `\nBooster desde: ${Data(User.premiumSinceTimestamp)}` : '',
            MemberPermissions = user.permissions.toArray(),
            Emojis = ['⬅️', '➡️'],
            Control = 0,
            UserEmbed = new MessageEmbed()
                .setColor(Colors(User) || client.blue)
                .setTitle(`${e.Info} ${message.author.id === id ? 'Suas informações' : `Informações de ${tag}`}`)
                .setDescription(`Usuário: ${user}`)
                .setThumbnail(avatar)
                .addField(`👤 Usuário`, `Nome: ${tag}\nID: \`${id}\`\nBot: ${bot}\nBandeiras: ${Bandeiras}\nSistema: ${system}\nCriou a conta em: ${DataFormatada}`)
                .addField(`${e.ModShield} Servidor`, `Dono: ${dono}\nAdministrador: ${adm}\nEntrou em: ${DataFormatadaGuild}\nPosso banir/expulsar: ${banivel}/${kick}\nCor: ${color}\nNickname: ${nick}\nAssociado: ${associado}${premiumSince}`),
            MemberPermissionsEmbed = new MessageEmbed()
                .setColor(Colors(User) || client.blue)
                .setTitle(`${e.Info} ${message.author.id === id ? 'Suas permissões' : `Permissões de ${tag} no servidor`}`)
                .setDescription(`${MemberPermissions?.map(perm => `\`${config.Perms[perm]}\``)?.join(', ') || '`Nenhuma`'}`)
                .addField(`${e.SaphireObs} Observações`, `As permissões acima se referem as permissões de todos os cargos que ${message.author.id === id ? 'você' : username} tem no servidor.`),
            msg = await message.reply({ embeds: [UserEmbed] }),
            embed = UserEmbed

        // TODO: Fazer um userinfo por ID

        for (const Emoji of Emojis)
            msg.react(Emoji).catch(() => { })

        const collector = msg.createReactionCollector({
            filter: (reaction, user) => Emojis.includes(reaction.emoji.name) && user.id === message.author.id,
            idle: 30000
        })

        collector.on('collect', (reaction) => {

            if (reaction.emoji.name === Emojis[0]) {
                if (Control === 0) return
                Control = 0
                embed = UserEmbed
                return msg.edit({ embeds: [UserEmbed] }).catch(() => { })
            }

            if (reaction.emoji.name === Emojis[1]) {
                if (Control === 1) return
                Control = 1
                embed = MemberPermissionsEmbed
                return msg.edit({ embeds: [MemberPermissionsEmbed] }).catch(() => { })
            }

        })

        collector.on('end', () => {

            return msg.edit({ embeds: [embed.setColor('RED').setFooter('Sessão encerrada')] }).catch(() => { })

        })

        return
    }
}

function Data(DateInMs) {

    const date = new Date(DateInMs)
    date.setHours(date.getHours() - 3)

    let Mes = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"][date.getMonth()],
        DiaDaSemana = ["Domingo", "Segunda-Feira", "Terça-Feira", "Quarta-Feira", "Quinta-Feira", "Sexta-Feira", "Sábado"][date.getDay()],
        Dia = FormatNumber(date.getDate()),
        Hora = FormatNumber(date.getHours()),
        Seconds = FormatNumber(date.getSeconds()),
        Minutes = FormatNumber(date.getMinutes()),
        Ano = date.getFullYear()

    return `${DiaDaSemana}, ${Dia} de ${Mes} de ${Ano} ${Hora}:${Minutes}:${Seconds}`
}

function FormatNumber(data) {
    return data < 10 ? `0${data}` : data
}
