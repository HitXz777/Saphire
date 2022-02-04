const client = require('../../index'),
    { Giveaway } = require('../../Routes/functions/database'),
    Notify = require('../../Routes/functions/notify')

client.on('messageDelete', async message => {

    if (!Giveaway.get(`Giveaways.${message.guild.id}.${message.id}`))
        return

    Giveaway.delete(`Giveaways.${message.guild.id}.${message.id}`)
    return Notify(message.guild.id, 'Sorteio cancelado', `A mensagem do sorteio \`${message.id}\` foi deleta. Todas as informações deste sorteio foram deletadas.`)

})