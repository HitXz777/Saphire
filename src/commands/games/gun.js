const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'gun',
    aliases: ['gunfight', 'tiro'],
    category: 'games',
    emoji: ':gun:',
    usage: '<gun> <@user>',
    description: 'Quem atirar primeiro leva',

    run: async (client, message, args, prefix, MessageEmbed, Database) => {

        const opponent = message.mentions.members.first() || message.mentions.repliedUser
        if (!opponent || opponent.id === message.author.id) return message.reply(`${e.Deny} | Mencione um oponente ou use o comando respondendo a mensagem do seu oponente.`)
        if (opponent.user.bot) return message.reply(`${e.Deny} | Bots não podem brincar.`)

        const positions = {
            three: '**3** | PREPARE-SE...',
            two: '**2** | PREPARE-SE...',
            one: '**1** | PREPARE-SE...',
            go: '**GO!** | ATACAR!!!',
            ended1: `🏆 | ${opponent} ganhou!`,
            ended2: `🏆 | ${message.author} ganhou!`,
        }

        const componentsArray = [
            {
                type: 1,
                components: [
                    {
                        type: 2,
                        label: `${message.author.tag}`,
                        custom_id: 'shoot1',
                        style: 'PRIMARY',
                        disabled: true,
                    },
                    {
                        type: 2,
                        label: `${opponent.user.tag}`,
                        custom_id: 'shoot2',
                        style: 'DANGER',
                        disabled: true,
                    },
                ],
            },
        ]

        const msg = await message.channel.send({
            content: positions.three,
            components: componentsArray,
        }).catch(() => { })

        function countdown() {
            setTimeout(() => { msg.edit({ content: positions.two, components: componentsArray, }).catch(() => { }); }, 1000);
            setTimeout(() => { msg.edit({ content: positions.one, components: componentsArray, }).catch(() => { }); }, 2000);
            setTimeout(() => { componentsArray[0].components[0].disabled = false; componentsArray[0].components[1].disabled = false; msg.edit({ content: positions.go, components: componentsArray, }).catch(() => { }); }, 3000);
        }
        countdown();

        const button = await msg.awaitMessageComponent({
            filter: button => button.user.id == message.author.id || button.user.id == opponent.id,
            componentType: 'BUTTON',
            max: 1,
            time: 10000
        })

        componentsArray[0].components[0].disabled = true;
        componentsArray[0].components[1].disabled = true;

        try {

            if (button.customId === 'shoot1' && button.user.id == message.author.id)
                return msg.edit({ content: positions.ended2, components: [] }).catch(() => { })

            if (button.customId === 'shoot2' && button.user.id == opponent.id)
                return msg.edit({ content: positions.ended1, components: [] }).catch(() => { })

            if (button.customId === 'shoot1' && button.user.id == opponent.id)
                return msg.edit({ content: `${e.Deny} | ${opponent} clicou errado!`, components: [] }).catch(() => { })

            if (button.customId === 'shoot2' && button.user.id == message.author.id)
                return msg.edit({ content: `${e.Deny} | ${message.author} clicou errado!`, components: [] }).catch(() => { })

        } catch (err) { }
    }
}
