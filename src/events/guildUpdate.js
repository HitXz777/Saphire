const client = require('../../index')
const { ServerDb } = require('../../Routes/functions/database')
const Notify = require('../../Routes/functions/notify')
const { UpdateServerName, RegisterServer } = require('../../Routes/functions/register')

client.on('guildUpdate', async (oldGuild, newGuild) => {

    if (!ServerDb.has(`Servers.${newGuild.id}`))
        return RegisterServer(newGuild)

    const { Owner, OwnerId, Name } = {
        Owner: ServerDb.get(`Servers.${newGuild.id}.Owner`) || 'Indefinido',
        OwnerId: ServerDb.get(`Servers.${newGuild.id}.OwnerId`) || 'Indefinido',
        Name: ServerDb.get(`Servers.${newGuild.id}.Name`) || 'Indefinido',
    }

    let Guild = await client.guilds.cache.get(newGuild.id) || false
    let owner = Guild.members.cache.get(Guild?.ownerId)?.user || false

    if (Owner !== owner?.tag || OwnerId !== owner.id) {
        if (!owner) return

        ServerDb.set(`Servers.${newGuild.id}.OwnerId`, owner?.id || undefined)
        ServerDb.set(`Servers.${newGuild.id}.Owner`, owner?.tag || undefined)
        Notify(newGuild.id, 'Atualização', `Os dados do*(a)* dono*(a)* do servidor foram alterado e atualizado no meu banco de dados.`)
    }

    if (Name !== newGuild.name)
        return UpdateServerName(oldGuild, newGuild)

})