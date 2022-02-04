const { e } = require('../../../database/emojis.json')
const { Permissions } = require('discord.js')

module.exports = {
    name: 'entrar',
    aliases: ['selecionar', 'seletor', 'escolher', 'Team'],
    category: 'servidor',
    ClientPermissions: ['MANAGE_ROLES'],
    emoji: '@',
    usage: '<entrar>',
    description: 'Pegue um cargo aleatório',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        return message.reply(`${e.Loading} Em construção...`)

        let Cargo1 = sdb.get(`Servers.${message.guild.id}.Roles.1`)
        let Cargo2 = sdb.get(`Servers.${message.guild.id}.Roles.2`)
        let Cargo3 = sdb.get(`Servers.${message.guild.id}.Roles.3`)
        let Cargo4 = sdb.get(`Servers.${message.guild.id}.Roles.4`)
        let Cargo5 = sdb.get(`Servers.${message.guild.id}.Roles.5`)

        let Role1 = message.guild.roles.cache.get(Cargo1); Role1 ? true : false
        let Role2 = message.guild.roles.cache.get(Cargo2); Role2 ? true : false
        let Role3 = message.guild.roles.cache.get(Cargo3); Role3 ? true : false
        let Role4 = message.guild.roles.cache.get(Cargo4); Role4 ? true : false
        let Role5 = message.guild.roles.cache.get(Cargo5); Role5 ? true : false

        let Random = ''
        let Roles = [Role1, Role2, Role3, Role4, Role5]
        do {
            Random = Roles[Math.floor(Math.random() * Roles.length)]
        } while (Random !== false)

        const embed = new MessageEmbed()
            .setColor('#246FE0')
            .setTitle('Receba um cargo aleatório')
            .setDescription(`${e.Info} | Receba um cargo aleatório configurado pela Staff do servidor`)
            .addField(`Comando`, `\`${prefix}entrar\``, true)
            .addField(`${e.On} Configure`, `\`${prefix}escolher 1 off/@cargo\`\n\`${prefix}escolher 2 off/@cargo\`\n\`${prefix}escolher 3 off/@cargo\`\n\`${prefix}escolher 4 off/@cargo\`\n\`${prefix}escolher 5 off/@cargo\``, true)
            .addField(`${e.Gear} Cargos configurados`, `1. ${Cargo1}\n2. ${Cargo2}\n3. ${Cargo3}\n4. ${Cargo4}\n5. ${Cargo5}`)

        if (['info', 'help'].includes(args[0]?.toLowerCase())) return message.reply({ embeds: [embed] })
        if (args[0] === '1') return SetRole1()
        if (args[0] === '2') return SetRole2()
        if (args[0] === '3') return SetRole3()
        if (args[0] === '4') return SetRole4()
        if (args[0] === '5') return SetRole5()
        if (!message.guild.me.permissions.has(Permissions.FLAG.MANAGE_ROLES))
            return message.reply(`${e.Deny} | Eu não tenho a permissão **GERENCIAR CARGOS**.`)

        if (!args[0]) return PickRandom()

        function PickRandom() {

            if (message.member.roles.has(Role1 || Role2 || Role3 || Role4 || Role5)) return message.reply(`${e.Deny} | Você já possui um dos cargos configurados. Caso queira trocar, peça para algum staff remover seu cargo.`)
            if (!Random) return message.reply(`${e.Deny} | Não tem nenhum cargo configurado para ser pego de forma aleatória.`)

            switch (Random) {
                case Role1:
                    message.member.roles.add(Role1).then(() => {
                        return message.channel.send(`${e.Check} | ${message.author} recebeu o cargo ${Role1}`)
                    }).catch(err => {
                        return message.channel.send(`${e.Warn} | Houve um problema ao adicionar o cargo ${Role1}.\n\`${err}\``)
                    })
                    break;
                case Role2:
                    message.member.roles.add(Role2).then(() => {
                        return message.channel.send(`${e.Check} | ${message.author} recebeu o cargo ${Role2}`)
                    }).catch(err => {
                        return message.channel.send(`${e.Warn} | Houve um problema ao adicionar o cargo ${Role2}.\n\`${err}\``)
                    })
                    break;
                case Role3:
                    message.member.roles.add(Role3).then(() => {
                        return message.channel.send(`${e.Check} | ${message.author} recebeu o cargo ${Role3}`)
                    }).catch(err => {
                        return message.channel.send(`${e.Warn} | Houve um problema ao adicionar o cargo ${Role3}.\n\`${err}\``)
                    })
                    break;
                case Role4:
                    message.member.roles.add(Role4).then(() => {
                        return message.channel.send(`${e.Check} | ${message.author} recebeu o cargo ${Role4}`)
                    }).catch(err => {
                        return message.channel.send(`${e.Warn} | Houve um problema ao adicionar o cargo ${Role4}.\n\`${err}\``)
                    })
                    break;
                case Role5:
                    message.member.roles.add(Role5).then(() => {
                        return message.channel.send(`${e.Check} | ${message.author} recebeu o cargo ${Role5}`)
                    }).catch(err => {
                        return message.channel.send(`${e.Warn} | Houve um problema ao adicionar o cargo ${Role5}.\n\`${err}\``)
                    })
                    break;
                default:
                    break;
            }
        }

        function SetRole1() {

        }

        function SetRole2() {

        }


        function SetRole3() {

        }

        function SetRole4() {

        }

        function SetRole5() {

        }

        switch (Check) {
            case Cargo1:

                break;
            case Cargo2:

                break;
            case Cargo3:

                break;
            case Cargo4:

                break;
            case Cargo5:

                break;

            default:
                return message.author.role(x).add().catch(err => {

                })
                break;
        }

    }
}