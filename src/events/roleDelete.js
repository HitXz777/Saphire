const
    client = require('../../index'),
    { sdb, ServerDb } = require('../../Routes/functions/database'),
    Notify = require('../../Routes/functions/notify')

client.on('roleDelete', async (role) => {

    switch (role.id) {
        case ServerDb.get(`Servers.${role.guild.id}.Autorole.First`): Autorole1(); break;
        case ServerDb.get(`Servers.${role.guild.id}.Autorole.Second`): Autorole2(); break;
        case ServerDb.get(`Servers.${role.guild.id}.Roles.Muted`): MuteRole(); break;
        default: break;
    }

    function Autorole1() {
        ServerDb.delete(`Servers.${role.guild.id}.Autorole.First`)
        return Notify(role.guild.id, 'Autorole Desabilitado', `O cargo **${role.name}** configurado como **Autorole 1** foi deletado.`)
    }

    function Autorole2() {
        ServerDb.delete(`Servers.${role.guild.id}.Autorole.Second`)
        return Notify(role.guild.id, 'Autorole Desabilitado', `O cargo **${role.name}** configurado como **Autorole 2** foi deletado.`)
    }

    function MuteRole() {
        ServerDb.delete(`Servers.${role.guild.id}.Roles.Muted`)
        sdb.delete(`Client.MuteSystem.${role.guild.id}`)
        return Notify(role.guild.id, 'Mute System', `O cargo **${role.name}** configurado como **Mute Role** foi deletado e o sistema de Mute foi desativado.`)
    }

})