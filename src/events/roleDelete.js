const
    client = require('../../index'),
    Notify = require('../../modules/functions/plugins/notify'),
    Database = require('../../modules/classes/Database');

client.on('roleDelete', async (role) => {

    let guild = await Database.Guild.findOne({ id: role.guild.id }, 'Autorole')
    if (!guild?.Autorole || guild.Autorole.length < 1) return

    if (!guild.Autorole.includes(role.id))
        return

    await Database.Guild.updateOne(
        { id: role.guild.id },
        { $pull: { Autorole: role.id } }
    )

    return Notify(role.guild.id, 'Autorole Desabilitado', `O cargo **${role.name}** configurado como **Autorole** foi deletado.`)
})