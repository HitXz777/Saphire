const client = require('../../index'),
    Notify = require('../../modules/functions/plugins/notify'),
    Database = require('../../modules/classes/Database')

client.on('messageDelete', async message => {

    let giveaway = await Database.Giveaway.findOne({ MessageID: message.id })

    if (!giveaway) return

    Database.deleteGiveaway(message.id)
    return Notify(message.guild.id, 'Sorteio cancelado', `A mensagem do sorteio \`${message.id}\` foi deleta. Todas as informações deste sorteio foram deletadas.`)

})