const Kitsu = require('kitsu.js'),
    kitsu = new Kitsu(),
    translate = require('@iamtraction/google-translate')

module.exports = {
    name: 'anime',
    description: '[animes] Pesquise animes por aqui',
    dm_permission: false,
    type: 1,
    options: [
        {
            name: 'search',
            description: 'Nome do anime a ser pesquisado',
            type: 3,
            required: true
        }
    ],
    async execute({ interaction: interaction, emojis: e, client: client }) {

        const { options } = interaction

        let search = options.getString('search')

        if (search.length > 100 || search.length < 4)
            return await interaction.reply({
                content: `${e.Deny} | Por favor, tente algo entre **4 e 100 caracteres**, pelo bem do meu sistema ${e.Itachi}`
            })

        await interaction.deferReply()

        kitsu.searchAnime(search)
            .then(async result => {
                if (result.length === 0)
                    return await interaction.editReply({
                        content: `${e.Deny} | Nenhum resultado obtido para: **${search}**`
                    }).catch(() => { })

                let anime = result[0]

                translate(`${anime.synopsis.replace(/<[^>]*>/g, '')
                    .split('\n')[0]}`, { to: 'pt' })
                    .then(async res => {

                        let Nome = `${anime.titles.english ? anime.titles.english : search}`
                        if (!Nome) Nome = 'Sem resposta'

                        let Status = `${anime.showType}`
                        if (Status === 'movie') Status = 'Filme'

                        let Sinopse = `${res.text}`
                        if (Sinopse.length > 1000) Sinopse = 'A sinopse ultrapassou o limite de **1000 caracteres**'
                        if (Sinopse === 'null') Sinopse = 'Sem resposta'

                        let NomeJapones = `${anime.titles.romaji}`
                        if (NomeJapones === 'null') NomeJapones = 'Sem resposta'

                        let IdadeRating = `${anime.ageRating}`
                        if (IdadeRating === 'G') IdadeRating = 'Livre'
                        if (IdadeRating === 'PG') IdadeRating = '+10'
                        if (IdadeRating === 'PG-13') IdadeRating = '+15'
                        if (IdadeRating === 'R') IdadeRating = '+18'
                        if (IdadeRating === 'null') IdadeRating = 'Sem resposta'

                        let NSFW = `${anime.nsfw ? 'Sim' : 'Não'}`
                        if (NSFW === 'null') NSFW = 'Sem resposta'

                        let Nota = `${anime.averageRating}`
                        if (Nota === 'null') Nota = 'Sem resposta'

                        let AnimeRanking = `${anime.ratingRank}`
                        if (AnimeRanking === 'null') AnimeRanking = 'Sem resposta'

                        let AnimePop = `${anime.popularityRank}`
                        if (AnimePop === 'null') AnimePop = 'Sem resposta'

                        let Epsodios = `${anime.episodeCount ? anime.episodeCount : 'N/A'}`
                        if (Epsodios === 'null') Epsodios = 'Sem resposta'

                        let Lancamento = `${anime.startDate}`
                        if (Lancamento) Lancamento = `${new Date(Lancamento).toLocaleDateString("pt-br")}`

                        let Termino = `${anime.endDate ? new Date(anime.endDate).toLocaleDateString("pt-br") : "Ainda no ar"}`

                        return await interaction.editReply({
                            embeds: [
                                {
                                    color: client.green,
                                    title: `🔍 Pesquisa Requisitada: ${search}`,
                                    description: `**📑 Sinopse**\n${Sinopse}`,
                                    fields: [
                                        {
                                            name: '🗂️ Informações',
                                            value: `Nome Japonês: ${NomeJapones}\nFaixa Etária: ${IdadeRating}\nNSFW: ${NSFW}\nTipo: ${Status}`
                                        },
                                        {
                                            name: '📊 Status',
                                            value: `Nota Média: ${Nota}\nRank: ${AnimeRanking}\nPopularidade: ${AnimePop}\nEpisódios: ${Epsodios}\nLançamento: ${Lancamento}\nTérmino: ${Termino}`
                                        }
                                    ],
                                    image: { url: anime.posterImage?.original ? anime.posterImage.original : null }
                                }
                            ]
                        }).catch(async err => {
                            return await interaction.editReply('Ocorreu um erro no comando "anime"\n`' + err + '`')
                        })

                    }).catch(async err => {
                        return await interaction.editReply(`${e.Warn} | Houve um erro ao executar este comando.\n\`${err}\``)
                    })
            }).catch(async err => {
                return await interaction.editReply(`${e.Deny} | Nenhum resultado obtido para: **${search}**`)
                    .catch(async err => {
                        return await interaction.editReply(`${e.Warn} | Ocorreu um erro no comando "/anime"\n> \`${err}\``)
                    })
            })
    }
}