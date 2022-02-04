const { Message } = require('discord.js')
const { sdb, ServerDb, db, DatabaseObj } = require('./database')
const { e, config } = DatabaseObj
const Notify = require('./notify')
const Error = require('./errors')
const client = require('../../index')

/**
 * @param { Message } message 
 */

async function RegisterUser(message) {

    if (message.author.bot || sdb.get('Client.Blacklist.Users')?.some(Obj => Obj?.id === message.author.id)) return

    message.channel.send(`${e.Loading} | Saphire's Database...`).then(async msg => {

        if (db.get(`Moderadores.${message.author.id}`)) {
            sdb.set(`Client.Moderadores.${message.author.id}`, message.author.id)
            db.delete(`Moderadores.${message.author.id}`)
        }

        if (db.get(`${message.author.id}.Perfil.OfficialTitles`)) {
            sdb.set(`Users.${message.author.id}.Perfil.OfficialTitles`, db.get(`${message.author.id}.Perfil.OfficialTitles`))
            db.delete(`${message.author.id}.Perfil.OfficialTitles`)
        }

        if (db.get(`Developer.${message.author.id}`)) {
            sdb.set(`Client.Developer.${message.author.id}`, true)
            db.delete(`Developer.${message.author.id}`)
        }

        if (db.get(`BugHunter.${message.author.id}`)) {
            sdb.set(`Client.BugHunter.${message.author.id}`, true)
            db.delete(`BugHunter.${message.author.id}`)
        }

        if (db.get(`OfficialDesigner.${message.author.id}`)) {
            sdb.set(`Client.OfficialDesigner.${message.author.id}`, true)
            db.delete(`OfficialDesigner.${message.author.id}`)
        }

        const RegisterObj = {
            Name: message.author.tag,
            Timeouts: {
                Preso: db.get(`${message.author.id}.Timeouts.Preso`) || undefined,
                Bug: db.get(`${message.author.id}.Timeouts.Bug`) || undefined,
                Daily: db.get(`${message.author.id}.Timeouts.Daily`) || undefined,
                Monthly: db.get(`${message.author.id}.Timeouts.Monthly`) || undefined,
                Weekly: db.get(`${message.author.id}.Timeouts.Weekly`) || undefined,
                Cu: db.get(`${message.author.id}.Timeouts.Cu`) || undefined,
                Roleta: db.get(`${message.author.id}.Timeouts.Roleta`) || undefined,
                Helpier: db.get(`${message.author.id}.Slot.Helpier`) || undefined,
                Esmola: db.get(`esmolatimeout_${message.author.id}`) || undefined,
                Duelo: db.get(`${message.author.id}.Timeouts.Duelo`) || undefined,
                Roubo: db.get(`${message.author.id}.Timeouts.Roubo`) || undefined,
                Work: db.get(`${message.author.id}.Timeouts.Work`) || undefined,
                Gif: db.get(`${message.author.id}.Timeouts.Gif`) || undefined,
                Ideiasaphire: db.get(`${message.author.id}.Timeouts.Ideiasaphire`) || undefined,
                Cantada: db.get(`${message.author.id}.Timeouts.Cantada`) || undefined,
                Assalto: db.get(`${message.author.id}.Timeouts.Assalto`) || undefined,
                Bitcoin: db.get(`${message.author.id}.Timeouts.Bitcoin`) || undefined,
                Porquinho: db.get(`${message.author.id}.Timeouts.Porquinho`) || undefined,
                Rep: db.get(`${message.author.id}.Timeouts.Rep`) || undefined,
                Buscar: db.get(`${message.author.id}.Timeouts.Buscar`) || undefined,
                Crime: db.get(`${message.author.id}.Timeouts.Crime`) || undefined,
                Bolsa: db.get(`${message.author.id}.Timeouts.Bolsa`) || undefined,
            },
            Cache: {
                ComprovanteOpen: db.get(`${message.author.id}.Cache.ComprovanteOpen`) || undefined,
                Assalto: db.get(`${message.author.id}.Cache.Assalto`) || undefined,
                BetPrize: db.get(`${message.author.id}.BetPrize`) || undefined,
                BingoPrize: db.get(`${message.author.id}.BingoPrize`) || undefined,
                Resgate: db.get(`${message.author.id}.Cache.Resgate`) || undefined,
                Bolsa: db.get(`${message.author.id}.Cache.Bolsa`) || undefined,
                LancePrize: db.get(`${message.author.id}.Prize`) || undefined,
                Pay: db.get(`${message.author.id}.Cache.Pay`) || undefined,
                Duelo: db.get(`${message.author.id}.Cache.Duelo`) || undefined,
                Pix: db.get(`${message.author.id}.Cache.Pix`) || undefined,
                ValueAll: db.get(`${message.author.id}.Cache.ValueAll`) || undefined,
                Roleta: db.get(`${message.author.id}.Cache.Roleta`) || undefined,
            },
            Color: {
                Perm: db.get(`${message.author.id}.Color.Perm`) || undefined,
                Set: db.get(`${message.author.id}.Color.Set`) || undefined,
            },
            Perfil: {
                TitlePerm: db.get(`${message.author.id}.Perfil.TitlePerm`) || undefined,
                Titulo: db.get(`${message.author.id}.Perfil.Titulo`) || undefined,
                Status: db.get(`${message.author.id}.Perfil.Status`) || undefined,
                Sexo: db.get(`${message.author.id}.Perfil.Sexo`) || undefined,
                Signo: db.get(`${message.author.id}.Perfil.Signo`) || undefined,
                Aniversario: db.get(`${message.author.id}.Perfil.Aniversario`) || undefined,
                Trabalho: db.get(`${message.author.id}.Perfil.Trabalho`) || undefined,
                BankOcult: db.get(`${message.author.id}.Perfil.BankOcult`) || undefined,
                Family: {
                    Um: db.get(`${message.author.id}.Perfil.Family.1`) || undefined,
                    Dois: db.get(`${message.author.id}.Perfil.Family.2`) || undefined,
                    Tres: db.get(`${message.author.id}.Perfil.Family.3`) || undefined,
                },
                Marry: db.get(`${message.author.id}.Perfil.Marry`) || undefined,
                Bits: db.get(`${message.author.id}.Bits`) || undefined,
                Estrela: {
                    Um: db.get(`${message.author.id}.Perfil.Estrela.1`) || undefined,
                    Dois: db.get(`${message.author.id}.Perfil.Estrela.2`) || undefined,
                    Tres: db.get(`${message.author.id}.Perfil.Estrela.3`) || undefined,
                    Quatro: db.get(`${message.author.id}.Perfil.Estrela.4`) || undefined,
                    Cinco: db.get(`${message.author.id}.Perfil.Estrela.5`) || undefined,
                    Seis: db.get(`${message.author.id}.Perfil.Estrela.6`) || undefined,
                },
            },
            Slot: {
                Medalha: {
                    Medalha: db.get(`${message.author.id}.Slot.Medalha`) || undefined,
                    Acess: db.get(`${message.author.id}.Slot.MedalhaAcess`) || undefined,
                    Code1: db.get(`${message.author.id}.Slot.Medalha.Code1`) || undefined,
                },
                Machado: {
                    Machado: true,
                    Usos: db.get(`${message.author.id}.Slot.Machado.Usos`) || undefined,
                },
                Picareta: {
                    Picareta: true,
                    Usos: db.get(`${message.author.id}.Slot.Picareta.Usos`) || undefined,
                },
                Arma: db.get(`${message.author.id}.Slot.Arma`) || undefined,
                DiamanteNegro: db.get(`${message.author.id}.Slot.DiamanteNegro`) || undefined,
                Cachorro: db.get(`${message.author.id}.Slot.Cachorro`) || undefined,
                Remedio: db.get(`${message.author.id}.Slot.Remedio`) || undefined,
                Helpier: db.get(`${message.author.id}.Slot.Helpier`) || undefined,
                Balaclava: db.get(`${message.author.id}.Slot.Balaclava`) || undefined,
                Dogname: db.get(`${message.author.id}.Slot.Dogname`) || undefined,
                Vara: db.get(`${message.author.id}.Slot.Vara`) || undefined,
                Anel: db.get(`${message.author.id}.Slot.Anel`) || undefined,
                Faca: db.get(`${message.author.id}.Slot.Faca`) || undefined,
                Loli: db.get(`${message.author.id}.Slot.Loli`) || undefined,
                Comidas: db.get(`${message.author.id}.Slot.Comidas`) || undefined,
                Bola: db.get(`${message.author.id}.Slot.Bola`) || undefined,
                Ossos: db.get(`${message.author.id}.Slot.Ossos`) || undefined,
                Fichas: db.get(`${message.author.id}.Slot.Fichas`) || undefined,
                Cartas: db.get(`${message.author.id}.Slot.Cartas`) || undefined,
                Iscas: db.get(`${message.author.id}.Slot.Iscas`) || undefined,
                Aguas: db.get(`${message.author.id}.Slot.Aguas`) || undefined,
                Minerios: db.get(`${message.author.id}.Slot.Minerios`) || undefined,
                Diamante: db.get(`${message.author.id}.Slot.Diamante`) || undefined,
                Fossil: db.get(`${message.author.id}.Slot.Fossil`) || undefined,
                Mamute: db.get(`${message.author.id}.Slot.Mamute`) || undefined,
                Apple: db.get(`${message.author.id}.Slot.Apple`) || undefined,
                Rosas: db.get(`${message.author.id}.Slot.Rosas`) || undefined,
                Peixes: db.get(`${message.author.id}.Slot.Peixes`) || undefined,
                Camarao: db.get(`${message.author.id}.Slot.Camarao`) || undefined,
            },
            NoReact: db.get(`${message.author.id}.NoReact`) || undefined,
            Baka: db.get(`${message.author.id}.Baka`) || undefined,
            Bolsa: db.get(`${message.author.id}.Bolsa`) || undefined,
            Bank: sdb.get(`Users.${message.author.id}.Bank`) || undefined,
            Balance: sdb.get(`Users.${message.author.id}.Balance`) || undefined,
            Likes: sdb.get(`Users.${message.author.id}.Likes`) || undefined,
            Xp: sdb.get(`Users.${message.author.id}.Xp`) || undefined

        }

        sdb.set(`Users.${message.author.id}`, RegisterObj)

        if (db.get(`Titulos.${message.author.id}.Halloween`)) {
            sdb.push(`Titulos.Halloween`, message.author.id)
            db.delete(`Titulos.${message.author.id}.Halloween`)
        }

        if (db.get(`Vip_${message.author.id}`))
            sdb.set(`Users.${message.author.id}.Timeouts.Vip`, { DateNow: Date.now(), TimeRemaing: 2592000000 })

        try {

            const array = ['Timeouts', 'Balance', 'Cache', 'Color', 'Perfil.Family', 'Perfil.Estrela', 'Slot.Medalha', 'Perfil']

            for (const key of array) {

                if (!Object.keys(key))
                    sdb.delete(`Users.${message.author.id}.${key}`)

                if (!sdb.get(`Users.${message.author.id}.${key}`)) {
                    sdb.delete(`Users.${message.author.id}.${key}`)
                }
            }

        } catch (err) {
            Error(message, err)
            sdb.delete(`Users.${message.author.id}`)
            msg.delete().catch(() => { })
            return message.channel.send(`${e.Deny} | Falha ao configurar o usuário \`${message.author.id}\` na database.\n\`${err}\``)
        }

        db.delete(`${message.author.id}`)
        db.delete(`Client.AfkSystem.${message.author.id}`)
        db.delete(`Vip_${message.author.id}`)
        db.delete(`Request.${message.author.id}`)
        db.delete(`Bank_${message.author.id}`)
        db.delete(`Balance_${message.author.id}`)
        msg.delete().catch(() => { })

    }).catch(err => {
        Error(message, err)
        sdb.delete(`Users.${message.author.id}`)
        msg.delete().catch(() => { })
        return message.channel.send(`${e.Deny} | Falha ao configurar o usuário \`${message.author.id}\` na database.\n\`${err}\``)
    })
}

async function RegisterServer(guild) {

    if (db.get(`Servers.${guild.id}.Prefix`) === "-")
        db.delete(`Servers.${guild.id}.Prefix`)

    const ServerObj = {
        Name: guild.name || undefined,
        Owner: guild.members.cache.get(guild.ownerId)?.user.tag || undefined,
        OwnerId: guild.ownerId || undefined,
        Prefix: db.get(`Servers.${guild.id}.Prefix`) || undefined,
        Tsundere: db.get(`Server.${guild.id}.Tsundere`) || undefined,
        LogChannel: db.get(`Servers.${guild.id}.LogChannel`) || undefined,
        IdeiaChannel: db.get(`Servers.${guild.id}.IdeiaChannel`) || undefined,
        Moeda: db.get(`Servers.${guild.id}.Moeda`) || undefined,
        XPChannel: db.get(`Servers.${guild.id}.XPChannel`) || undefined,
        ReportChannel: db.get(`Servers.${guild.id}.ReportChannel`) || undefined,
        Farm: {
            BuscaChannel: db.get(`Servers.${guild.id}.BuscaChannel`) || undefined,
            PescaChannel: db.get(`Servers.${guild.id}.PescaChannel`) || undefined,
            MineChannel: db.get(`Servers.${guild.id}.MineChannel`) || undefined,
        },
        LeaveChannel: {
            Canal: db.get(`Servers.${guild.id}.LeaveChannel`) || undefined,
            Emoji: db.get(`Servers.${guild.id}.LeaveChannel.Emoji`) || undefined,
            Mensagem: db.get(`Servers.${guild.id}.LeaveChannel.Mensagem`) || undefined,
        },
        WelcomeChannel: {
            Canal: db.get(`Servers.${guild.id}.WelcomeChannel.Canal`) || undefined,
            Emoji: db.get(`Servers.${guild.id}.WelcomeChannel.Emoji`) || undefined,
            Mensagem: db.get(`Servers.${guild.id}.WelcomeChannel.Mensagem`) || undefined,
        },
        Autorole: {
            First: db.get(`Servers.${guild.id}.Autorole1`) || undefined,
            Second: db.get(`Servers.${guild.id}.Autorole2`) || undefined,
        },
    }

    ServerDb.set(`Servers.${guild.id}`, ServerObj)

    try {

        let DatabaseKeys = ['LeaveChannel.Canal', 'LeaveChannel.Emoji', 'LeaveChannel.Mensagem', 'WelcomeChannel.Canal', 'WelcomeChannel.Emoji', 'WelcomeChannel.Mensagem', 'Autorole.First', 'Autorole.Second', 'Autorole', 'Farm', 'LeaveChannel', 'WelcomeChannel']

        for (const key of DatabaseKeys) {

            let DataKey = ServerDb.get(`Servers.${guild.id}.${key}`) || {}

            if (!Object.keys(DataKey))
                ServerDb.delete(`Servers.${guild.id}.${key}`)

            if (!ServerDb.get(`Servers.${guild.id}.${key}`))
                ServerDb.delete(`Servers.${guild.id}.${key}`)

        }

    } catch (err) {
        await client.users.cache.get(config.ownerId)?.send(`${e.Deny} | Falha ao configurar o servidor \`${guild.id}\` na database.\n\`${err}\``)
        ServerDb.delete(`Servers.${guild.id}`)
        return message?.channel.send(`${e.Deny} | Falha ao configurar o servidor \`${guild.id}\` na database.\n\`${err}\``)
    }

    await client.channels.cache.get(config.LogChannelId)?.send(`${e.Check} | O servidor **${guild.name}** foi registrado com sucesso!`).catch(() => { })
    Notify(guild.id, 'Atualização', 'A troca do banco de dados deste servidor foi concluída com sucesso!')
    return db.delete(`Servers.${guild.id}`)
}

async function UpdateUserName(message) {

    if (sdb.get('Client.Blacklist.Users')?.some(Obj => Obj?.id === message.author.id))
        return

    if (sdb.get(`Users.${message.author.id}.Name`) !== message.author.tag) {
        sdb.set(`Users.${message.author.id}.Name`, message.author.tag)
        return message.react(e.Check).catch(() => { })
    } else { return }
}

async function UpdateServerName(oldGuild, newGuild) {
    ServerDb.set(`Servers.${newGuild.id}.Name`, newGuild.name)

    return Notify(newGuild.id, 'Atualização', `O nome do servidor foi atualizado no meu banco de dados de **${oldGuild.name}** para **${newGuild.name}**`)
}

module.exports = { RegisterUser, RegisterServer, UpdateUserName, UpdateServerName }