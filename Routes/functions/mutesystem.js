const
    client = require('../../index'),
    { sdb, ServerDb, DatabaseObj: { e } } = require('./database'),
    Notify = require('./notify')

async function MuteSystem() {

    let Guilds = Object.keys(sdb.get('Client.MuteSystem') || {})

    if (Guilds.length === 0) return

    for (const GuildId of Guilds) {

        let guild = await client.guilds.cache.get(GuildId),
            UsersId = Object.keys(sdb.get(`Client.MuteSystem.${GuildId}`) || {})

        if (!guild) {

            sdb.delete(`Client.MuteSystem.${GuildId}`)
            ServerDb.delete(`Servers.${GuildId}`)

        } else {

            UsersId.length === 0
                ? sdb.delete(`Client.MuteSystem.${GuildId}`)
                : (() => {
                    for (const user of UsersId) {

                        guild.members.cache.get(user)
                            ? CheckIfThisUserIsMuted(guild, `${user}`)
                            : (async () => {
                                sdb.delete(`Client.MuteSystem.${GuildId}.${user}`)

                                if (!await client.users.cache.get(user))
                                    sdb.delete(`Users.${user}`)
                            })()

                            continue

                    }
                })()
        }

        continue

    }

}

async function CheckIfThisUserIsMuted(Guild, userId) {

    let MuteData = sdb.get(`Client.MuteSystem.${Guild.id}.${userId}`),
        Member = Guild.members.cache.get(`${userId}`),
        IsMuted = MuteData.DateSet !== null && MuteData.Timeout - (Date.now() - MuteData.DateSet) > 0,
        Role = Guild.roles.cache.get(ServerDb.get(`Servers.${Guild.id}.Roles.Muted`))

    if (!Role) {
        sdb.delete(`Client.MuteSystem.${Guild.id}`)
        ServerDb.delete(`Servers.${Guild.id}.Roles.Muted`)
        return Notify(Guild.id, 'Sistema de Mute Desabilitado', 'Eu não encontrei o cargo de Mute presente na minha database neste servidor. Eu deletei todo o histórico de mute deste servidor.')
    }

    if (!Guild)
        return sdb.delete(`Client.MuteSystem.${Guild.id}`)

    if (!Member)
        return sdb.delete(`Client.MuteSystem.${Guild.id}.${userId}`)

    if (!IsMuted) {

        let LogChannel = Guild.channels.cache.get(ServerDb.get(`Servers.${Guild.id}.LogChannel`))

        return Member.roles.cache.has(Role?.id)
            ? (() => {
                Member.roles.remove(Role, 'Fim do mute').catch(() => { })
                sdb.delete(`Client.MuteSystem.${Guild.id}.${userId}`)
                return LogChannel?.send(`${e.Check} | O membro ${Member} foi desmutado com sucesso!`)
            })()
            : (() => {
                return sdb.delete(`Client.MuteSystem.${Guild.id}.${userId}`)
            })()

    }

    return

}

module.exports = MuteSystem