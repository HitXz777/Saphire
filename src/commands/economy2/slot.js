const
    { e } = require('../../../database/emojis.json'),
    Colors = require('../../../Routes/functions/colors'),
    { DatabaseObj } = require('../../../Routes/functions/database')

module.exports = {
    name: 'slot',
    aliases: ['inventario', 'inve'],
    category: 'economy2',
    emoji: '📦',
    usage: '<slot> [user]',
    description: 'Confira todo o seu inventário',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        let u = message.mentions.users.first() || await client.users.cache.get(args[0]) || await client.users.cache.get(args[1]) || message.mentions.repliedUser || client.users.cache.find(user => user.username?.toLowerCase() == args[0]?.toLowerCase() || user.tag?.toLowerCase() == args[0]?.toLowerCase()) || message.author,
            user = await client.users.cache.get(u.id),
            avatar = user?.displayAvatarURL({ dynamic: true }),
            color = Colors(user),
            { Cores, Um, Dois, Tres, Quatro, Cinco, Seis, Helpier, TitlePerm, Peixes, Iscas, Comidas, Cartas, Aguas, Fichas, Camarao, Diamante, Minerios, Ossos, Apple, Rosas, Arma, Anel, Picareta, Machado, Balaclava, Remedio, Vara, Faca, Loli, Cachorro, Dogname, Medalha, Bola, Fossil, DiamanteNegro, Mamute } = {
                TitlePerm: sdb.get(`Users.${user.id}.Perfil.TitlePerm`),
                Peixes: sdb.get(`Users.${user.id}.Slot.Peixes`),
                Helpier: sdb.get(`Users.${user.id}.Timeouts.Helpier`),
                Um: sdb.get(`Users.${user.id}.Perfil.Estrela.Um`),
                Dois: sdb.get(`Users.${user.id}.Perfil.Estrela.Dois`),
                Tres: sdb.get(`Users.${user.id}.Perfil.Estrela.Tres`),
                Quatro: sdb.get(`Users.${user.id}.Perfil.Estrela.Quatro`),
                Cinco: sdb.get(`Users.${user.id}.Perfil.Estrela.Cinco`),
                Seis: sdb.get(`Users.${user.id}.Perfil.Estrela.Seis`),
                Iscas: sdb.get(`Users.${user.id}.Slot.Iscas`),
                Comidas: sdb.get(`Users.${user.id}.Slot.Comidas`),
                Cartas: sdb.get(`Users.${user.id}.Slot.Cartas`),
                Aguas: sdb.get(`Users.${user.id}.Slot.Aguas`),
                Fichas: sdb.get(`Users.${user.id}.Slot.Fichas`),
                Camarao: sdb.get(`Users.${user.id}.Slot.Camarao`),
                Diamante: sdb.get(`Users.${user.id}.Slot.Diamante`),
                Minerios: sdb.get(`Users.${user.id}.Slot.Minerios`),
                Ossos: sdb.get(`Users.${user.id}.Slot.Ossos`),
                Apple: sdb.get(`Users.${user.id}.Slot.Apple`),
                Rosas: sdb.get(`Users.${user.id}.Slot.Rosas`),
                Arma: sdb.get(`Users.${user.id}.Slot.Arma`),
                Anel: sdb.get(`Users.${user.id}.Slot.Anel`),
                Picareta: {
                    Picareta: sdb.get(`Users.${user.id}.Slot.Picareta.Picareta`),
                    Usos: sdb.get(`Users.${user.id}.Slot.Picareta.Usos`),
                },
                Machado: {
                    Machado: sdb.get(`Users.${user.id}.Slot.Machado.Machado`),
                    Usos: sdb.get(`Users.${user.id}.Slot.Machado.Usos`),
                },
                Balaclava: sdb.get(`Users.${user.id}.Slot.Balaclava`),
                Remedio: sdb.get(`Users.${user.id}.Slot.Remedio`),
                Vara: sdb.get(`Users.${user.id}.Slot.Vara`),
                Faca: sdb.get(`Users.${user.id}.Slot.Faca`),
                Loli: sdb.get(`Users.${user.id}.Slot.Loli`),
                Cachorro: sdb.get(`Users.${user.id}.Slot.Cachorro`),
                Dogname: sdb.get(`Users.${user.id}.Slot.Dogname`),
                Medalha: {
                    Medalha: sdb.get(`Users.${user.id}.Slot.Medalha.Medalha`),
                    Acess: sdb.get(`Users.${user.id}.Slot.Medalha.Acess`),
                },
                Bola: sdb.get(`Users.${user.id}.Slot.Bola`),
                Fossil: sdb.get(`Users.${user.id}.Slot.Fossil`),
                DiamanteNegro: sdb.get(`Users.${user.id}.Slot.DiamanteNegro`),
                Mamute: sdb.get(`Users.${user.id}.Slot.Mamute`),
                Cores: sdb.get(`Users.${user.id}.Color.Perm`)
            }

        let cartas, picareta, arma, anel, machado, title, balaclava, remedio, vara, faca, loli, cachorro, dogname, medalha, cores, bola, fossil, diamante, mamute, nada, nada2, star

        Helpier = Helpier !== null && 604800000 - (Date.now() - Helpier) > 0 ? `\n${e.Helpier} Ajudante` : ''
        title = TitlePerm ? "\n🔰 Título" : ''
        cartas = Cartas ? `\n💌 Cartas: ${Cartas}` : ''
        picareta = Picareta.Picareta ? `\n⛏️ Picareta | ${Picareta.Usos || 0} usos restantes` : ''
        arma = Arma ? "\n🔫 Arma" : ''
        anel = Anel ? "\n💍 Anel de Casamento" : ''
        machado = Machado.Machado ? `\n🪓 Machado | ${Machado.Usos || 0} usos restantes` : ''
        balaclava = Balaclava ? `\n${e.Balaclava} Balaclava` : ''
        remedio = Remedio ? "\n💊 Remédio do Velho Welter" : ''
        vara = Vara ? "\n🎣 Vara de pesca" : ''
        faca = Faca ? "\n🔪 Faca" : ''
        loli = Loli ? `\n${e.Loli} Loli` : ''
        cachorro = Cachorro ? "\n🐶 Cachorro Brown" : ''
        dogname = Dogname ? `\n${e.Doguinho} ${sdb.get(`Users.${user.id}.Slot.Dogname`)}` : `\n${e.Doguinho} Doguinho sem nome`
        medalha = Medalha.Medalha ? "\n🏅 Medalha Cammum" : ''
        cores = Cores ? '\n🎨 Cores' : ''
        bola = Bola ? "\n🥎 Bola" : ''
        fossil = Fossil ? `\n${e.Fossil} Fossil` : ''
        diamante = DiamanteNegro ? `\n${e.DarkDiamond} Diamante Negro` : ''
        mamute = Mamute ? "\n🦣 Mamute" : ''
        if (Medalha.Acess) cachorro = '', bola = '', remedio = ''
        nada = !Helpier && !balaclava && !arma && !picareta && !vara && !machado && cartas <= 0 ? 'Não há nada aqui' : ''
        nada2 = !sdb.get(`Users.${user.id}.Color.Perm`) && !title && !faca && !loli && !fossil && !mamute && !diamante && !Medalha.Medalha && !bola && !cachorro && !remedio ? 'Não há nada aqui' : ''
        LevelBgAtual = !sdb.get(`Users.${user.id}.Slot.Walls.Set`) ? 'Padrão: bg0' : 'Indefinido'
        Um ? star = `${e.Star}${e.GrayStar}${e.GrayStar}${e.GrayStar}${e.GrayStar}` : star = `${e.GrayStar}${e.GrayStar}${e.GrayStar}${e.GrayStar}${e.GrayStar}`
        Dois ? star = `${e.Star}${e.Star}${e.GrayStar}${e.GrayStar}${e.GrayStar}` : star = star
        Tres ? star = `${e.Star}${e.Star}${e.Star}${e.GrayStar}${e.GrayStar}` : star = star
        Quatro ? star = `${e.Star}${e.Star}${e.Star}${e.Star}${e.GrayStar}` : star = star
        Cinco ? star = `${e.Star}${e.Star}${e.Star}${e.Star}${e.Star}` : star = star
        Seis ? star = `${e.Star}${e.Star}${e.Star}${e.Star}${e.Star}${e.Star}` : star = star

        if (['safari', 'zoo', 'pet', 'pets'].includes(args[0]?.toLowerCase()))
            return SlotZoo()

        if (['bg', 'wallpaper', 'w', 'fundo', 'level'].includes(args[0]?.toLowerCase()))
            return SlotBackgrouds()

        if (['vip', 'premium'].includes(args[0]?.toLowerCase()))
            return SlotVip()

        if (['info', 'help', 'ajuda'].includes(args[0]?.toLowerCase())) {
            return message.reply({
                embeds: [
                    new MessageEmbed()
                        .setColor(Colors(message.member))
                        .setTitle(`${e.SaphireHi} Slot Saphire Info`)
                        .setDescription(`Aqui está todas *(ou quase todas)* as informações do slot.`)
                        .addFields([
                            {
                                name: 'Itens',
                                value: `Você pode conferir todos os itens usando \`${prefix}itens\``
                            },
                            {
                                name: 'Comandos do Slot',
                                value: `\`${prefix}slot\` - Padrão\n\`${prefix}slot zoo\` - Safari\n\`${prefix}slot bg\` - Levels Wallpapers\n\`${prefix}slot vip\` - Vip`
                            }
                        ])
                ]
            })
        }

        return NormalSlot()

        function SlotZoo() {
            return message.reply({ embeds: [new MessageEmbed().setColor(color).setAuthor(`Inventário de ${user.username}`, avatar).setDescription('🦁 Edition: Zoo').addField('Itens Comprados', `Nenhum item foi comprado`).addField('Animais Adotados', `Nenhum animal foi adotado ainda`)] })
        }

        function SlotVip() {
            return message.reply({ embeds: [new MessageEmbed().setColor(color).setAuthor(`Inventário VIP de ${user.username}`, avatar).setDescription(`${e.SaphireEntaoKkk} Tudo vázio`).setFooter(`${prefix}buy | ${prefix}vip`)] })
        }

        async function SlotBackgrouds() {

            let BgArray = [],
                WallpaperDB = DatabaseObj.LevelWallpapers,
                keys,
                control = 0,
                WhoAreTheUser = message.author.id === user.id ? 'Você' : 'Este usuário'

            if (sdb.get(`Client.BackgroundAcess.${user.id}`))
                return message.reply(`${e.Info} | ${WhoAreTheUser} possui todos os wallpapers. Tente usar \`${prefix}lvlwall all\``)

            try {
                keys = Object.keys(sdb.get(`Users.${user.id}.Slot.Walls.Bg`))?.sort((a, b) => a.slice(2) - b.slice(2))
            } catch (err) {
                return message.reply(`${e.Info} | Nenhum wallpaper por aqui.`)
            }

            for (const wall of keys)
                BgArray.push({ code: wall, name: WallpaperDB[wall].Name })

            function EmbedGenerator() {
                let amount = 10,
                    Page = 1,
                    embeds = [],
                    length = BgArray.length / 10 < 1 ? 1 : parseInt(BgArray.length / 10) + 1,
                    title = message.author.id === user.id ? '🖼️ Seus Level\'s Backgrounds' : `🖼️ ${user.username} Level's Backgrounds`

                for (let i = 0; i < BgArray.length; i += 10) {

                    const current = BgArray.slice(i, amount),
                        description = current.map(wall => `> \`${wall.code}\`: ${wall.name}`).join("\n")

                    embeds.push({
                        color: color,
                        title: `${title} | ${Page}/${length}`,
                        description: `${description}`,
                        footer: {
                            text: `${BgArray?.length || 0} Wallpapers`
                        }
                    })

                    Page++
                    amount += 10

                }

                return embeds;
            }

            const embeds = EmbedGenerator(),
                msg = await message.reply({ embeds: [embeds[control]] }),
                collector = msg.createReactionCollector({
                    filter: (reaction, user) => ['◀️', '▶️', '❌'].includes(reaction.emoji.name) && user.id === message.author.id,
                    idle: 30000
                })

            if (embeds.length > 1)
                for (const emoji of ['◀️', '▶️', '❌'])
                    msg.react(emoji).catch(() => { })

            collector.on('collect', (reaction, user) => {

                if (reaction.emoji.name === '❌') return collector.stop()

                reaction.emoji.name === '◀️'
                    ? (() => {
                        control--
                        embeds[control] ? msg.edit({ embeds: [embeds[control]] }).catch(() => { }) : control++
                    })()
                    : (() => {
                        control++
                        embeds[control] ? msg.edit({ embeds: [embeds[control]] }).catch(() => { }) : control--
                    })()

            });

            collector.on('end', () => {
                msg.reactions.removeAll().catch(() => { })
            })

        }

        function NormalSlot() {

            const NormalSlotEmbed = new MessageEmbed()
                .setColor(color)
                .setAuthor(`Inventário de ${user.username}`, avatar)
                .setDescription(`${star}`)
                .addField('Itens Comprados', `${nada}${arma}${anel}${balaclava}${Helpier}${picareta}${machado}${vara}${cartas}`)
                .setFooter(`${prefix}buy | ${prefix}vender | ${prefix}slot vip | ${prefix}slot pet | ${prefix}slot bg`)
            if (!medalha) { NormalSlotEmbed.addField('Itens Obtidos', `${nada2}${cores}${title}${faca}${loli}${fossil}${mamute}${diamante}${cachorro}${bola}${remedio}`) }
            if (medalha) { NormalSlotEmbed.addField('Itens Obtidos', `${nada2}${cores}${title}${faca}${loli}${fossil}${mamute}${diamante}${medalha}${dogname}`) }
            NormalSlotEmbed.addField('Mantimentos', `🐟 ${Peixes || 0} Peixes\n🥘 ${Comidas || 0} Comidas\n🪱 ${Iscas || 0} Iscas\n🥤 ${Aguas || 0} Águas\n🎟️ ${Fichas || 0} Fichas\n🍤 ${Camarao || 0} Camarões\n🦴 ${Ossos || 0} Ossos\n🌹 ${Rosas || 0} Rosas\n🍎 ${Apple || 0} Maças\n🪨 ${Minerios || 0} Minérios\n💎 ${Diamante || 0} Diamantes`)
            return message.reply({ embeds: [NormalSlotEmbed] })
        }
    }
}


