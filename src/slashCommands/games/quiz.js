const QuizManager = require('../../../modules/classes/games/QuizManager')

module.exports = {
    name: 'quiz',
    description: '[games] Escolha um modo de jogo e se divirta!',
    dm_permission: false,
    type: 1,
    options: [
        {
            name: 'start',
            description: '[games] Inicie um novo Quiz',
            type: 1,
            options: [
                {
                    name: 'game',
                    description: 'Escolha seu modo de jogo',
                    type: 3,
                    required: true,
                    choices: [
                        {
                            name: 'Perguntas e Respostas',
                            value: 'normalQuiz'
                        }
                    ]
                }
            ]
        },
        {
            name: 'status',
            description: '[games] Acompanhe os status do Quiz',
            type: 1,
            options: [
                {
                    name: 'user',
                    description: 'Usuário que você deseja ver o status',
                    type: 6
                },
                {
                    name: 'search',
                    description: 'Pesquise usuários por nome ou id',
                    type: 3
                }
            ]
        },
        {
            name: 'options',
            description: '[games] Mais opções do jogo Quiz',
            type: 1,
            options: [
                {
                    name: 'input',
                    description: 'Selecione a opção que deseja',
                    type: 3,
                    choices: [
                        {
                            name: 'Informações',
                            value: 'info'
                        },
                        {
                            name: 'Lista de personagens do Anime Theme',
                            value: 'listAnimeTheme'
                        },
                        {
                            name: 'Delete Channels Cache Data',
                            value: 'resetQuizChannels'
                        }
                    ]
                },
                {
                    name: 'character',
                    description: 'Pesquise um personagem na categoria Anime Theme',
                    type: 3
                }
            ]
        }
    ],
    async execute({ interaction: interaction, database: Database, data: data, emojis: e }) {

        const { options, channel } = interaction
        const Quiz = new QuizManager(data, options)
        const subCommand = options.getSubcommand()

        switch (subCommand) {
            case 'start': quizGame(); break;
            case 'status': Quiz.getAndShowUserStatus(); break;
            case 'options': switchOptions(); break;

            default: await interaction.reply({
                content: `${e.Deny} | Nenhuma função foi encontrada`,
                ephemeral: true
            }); break;
        }

        async function switchOptions() {

            const input = options.getString('input')
            const character = options.getString('character')

            if (!input && !character)
                return await interaction.reply({
                    content: `${e.Deny} | Você precisa selecionar pelo menos uma opção.`,
                    ephemeral: true
                })

            if (character) return Quiz.showCharacter(character.toLowerCase())

            switch (input) {
                case 'info': Quiz.quizInfo(); break;
                case 'listAnimeTheme': Quiz.listCharacters(); break;
                case 'resetQuizChannels': Quiz.resetQuizChannels(); break;

                default:
                    await interaction.reply({
                        content: `${e.Deny} | Opção de função não encontrada.`,
                        ephemeral: true
                    })
                    break;
            }

            return
        }

        async function quizGame() {

            const channelInQuiz = Database.Cache.get('Quiz') || []
            if (channelInQuiz.includes(channel.id))
                return await interaction.reply({
                    content: `${e.Deny} | Já tem um quiz rolando neste chat.`,
                    ephemeral: true
                })

            const gameMode = options.getString('game')
            switch (gameMode) {
                case 'normalQuiz': Quiz.normalQuiz(); break;
            }
            return
        }

        return
    }
}