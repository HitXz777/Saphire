class Modals {

    letter = {
        title: 'New Letter',
        custom_id: "newLetter",
        components: [
            {
                type: 1,
                components: [
                    {
                        type: 4,
                        custom_id: "username",
                        label: "Para quem é a carta?",
                        style: 1,
                        min_length: 2,
                        max_length: 37,
                        placeholder: "Nome, Nome#0000 ou ID",
                        required: true
                    }
                ]
            },
            {
                type: 1,
                components: [
                    {
                        type: 4,
                        custom_id: "anonymous",
                        label: "Está é um carta anonima?",
                        style: 1,
                        min_length: 3,
                        max_length: 3,
                        placeholder: "Sim | Não",
                        required: true
                    }
                ]
            },
            {
                type: 1,
                components: [
                    {
                        type: 4,
                        custom_id: "letterContent",
                        label: "Escreva sua carta",
                        style: 2,
                        min_length: 10,
                        max_length: 1024,
                        placeholder: "Em um dia, eu te vi na rua, foi quando...",
                        required: true
                    }
                ]
            }
        ]
    }

    reportLetter = {
        title: "Report Letter Content",
        custom_id: "lettersReport",
        components: [
            {
                type: 1,
                components: [
                    {
                        type: 4,
                        custom_id: "letterId",
                        label: "Informe o ID da carta",
                        style: 1,
                        max_length: 7,
                        max_length: 7,
                        placeholder: "ABC1234",
                        required: true
                    }
                ]
            },
            {
                type: 1,
                components: [
                    {
                        type: 4,
                        custom_id: "reason",
                        label: "Qual é o motivo da sua denúncia?",
                        style: 2,
                        min_length: 10,
                        max_length: 1024,
                        placeholder: "O autor da carta me xingou...",
                        required: true
                    }
                ]
            }
        ]
    }

    transactionsReport = {
        title: "Transactions Report Center",
        custom_id: "transactionsModalReport",
        components: [
            {
                type: 1,
                components: [
                    {
                        type: 4,
                        custom_id: "text",
                        label: "Explique o que aconteceu",
                        style: 2,
                        min_length: 10,
                        max_length: 1024,
                        placeholder: "Na data [xx/xx/xxxx xx:xx] está escrito undefined.",
                        required: true
                    }
                ]
            } // MAX: 5 Fields
        ]
    }

    editCollection = (collection) => {
        return {
            title: "Edit Reaction Role Collection",
            custom_id: collection.name,
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 4,
                            custom_id: "name",
                            label: "Trocar o nome da coleção?",
                            style: 1,
                            min_length: 1,
                            max_length: 20,
                            placeholder: collection.name
                        }
                    ]
                },
                {
                    type: 1,
                    components: [
                        {
                            type: 4,
                            custom_id: "embedTitle",
                            label: "Título de apresentação",
                            style: 1,
                            min_length: 1,
                            max_length: 256,
                            placeholder: 'Nenhum título encontrado',
                            required: true,
                            value: collection.embedTitle || null
                        }
                    ]
                },
                {
                    type: 1,
                    components: [
                        {
                            type: 4,
                            custom_id: "uniqueSelection",
                            label: "Esta coleção pode entregar mais de 1 cargo?",
                            style: 1,
                            min_length: 3,
                            max_length: 3,
                            required: true,
                            value: collection.uniqueSelection ? 'não' : 'sim'
                        }
                    ]
                } // MAX: 5 Fields
            ]
        }
    }

    newCollection = {
        title: "New Reaction Roles Collection",
        custom_id: "newCollectionReactionRoles",
        components: [
            {
                type: 1,
                components: [
                    {
                        type: 4,
                        custom_id: "name",
                        label: "Qual o nome da sua nova coleção?",
                        style: 1,
                        min_length: 1,
                        max_length: 20,
                        placeholder: "Cores",
                        required: true
                    }
                ]
            }, // MAX: 5 Fields
            {
                type: 1,
                components: [
                    {
                        type: 4,
                        custom_id: "embedTitle",
                        label: "Título de apresentação",
                        style: 1,
                        min_length: 1,
                        max_length: 256,
                        placeholder: "Selecione a cor do seu nome",
                        required: true
                    }
                ]
            },
            {
                type: 1,
                components: [
                    {
                        type: 4,
                        custom_id: "uniqueSelection",
                        label: "Esta coleção pode entregar mais de 1 cargo?",
                        style: 1,
                        min_length: 3,
                        max_length: 3,
                        placeholder: "sim | não",
                        required: true
                    }
                ]
            } // MAX: 5 Fields
        ]
    }

    newReactionRoleCreate = {
        title: "Reaction Role Create",
        custom_id: "reactionRoleCreateModal",
        components: [
            {
                type: 1,
                components: [
                    {
                        type: 4,
                        custom_id: "roleData",
                        label: "ID ou nome exato do cargo",
                        style: 1,
                        min_length: 1,
                        max_length: 100,
                        placeholder: "123456789123456789 | Cor Azul | Viajante",
                        required: true
                    }
                ]
            },
            {
                type: 1,
                components: [
                    {
                        type: 4,
                        custom_id: "roleTitle",
                        label: "Título para o cargo",
                        style: 1,
                        min_length: 1,
                        max_length: 25,
                        placeholder: "Novidades e Notificações | Sorteios e Prêmios",
                        required: true
                    }
                ]
            },
            {
                type: 1,
                components: [
                    {
                        type: 4,
                        custom_id: "roleDescription",
                        label: "Descrição da Reaction Role",
                        style: 1,
                        max_length: 50,
                        placeholder: "Novidades e Notificações | Sorteios e Prêmios"
                    }
                ]
            }
        ]
    }

    newGiveawayCreate = {
        title: "Giveaway Central Create",
        custom_id: "createNewGiveaway",
        components: [
            {
                type: 1,
                components: [
                    {
                        type: 4,
                        custom_id: "winners",
                        label: "Quantos vencedores?",
                        style: 1,
                        min_length: 1,
                        max_length: 2,
                        placeholder: "1, 2, 3... Max: 20",
                        required: true
                    }
                ]
            },
            {
                type: 1,
                components: [
                    {
                        type: 4,
                        custom_id: "timing",
                        label: "Quando devo efetuar o sorteio?",
                        style: 1,
                        min_length: 1,
                        max_length: 25,
                        placeholder: "Amanhã 14:35 | 24/06/2022 14:30 | 1d 20m 30s",
                        required: true
                    }
                ]
            },
            {
                type: 1,
                components: [
                    {
                        type: 4,
                        custom_id: "prize",
                        label: "Qual é o prêmio?",
                        style: 2,
                        min_length: 5,
                        max_length: 1024,
                        placeholder: "Uma paçoca",
                        required: true
                    }
                ]
            },
            {
                type: 1,
                components: [
                    {
                        type: 4,
                        custom_id: "requires",
                        label: "Requisitos? Se sim, quais?",
                        style: 2,
                        min_length: 5,
                        max_length: 1024,
                        placeholder: "Dar likes para @maria e estar no servidor a 5 dias"
                    }
                ]
            },
            {
                type: 1,
                components: [
                    {
                        type: 4,
                        custom_id: "imageURL",
                        label: "Quer alguma imagem no sorteio?",
                        style: 1,
                        placeholder: "https://i.imgur.com/aGaDNeL.jpeg"
                    }
                ]
            }
        ]
    }

    reportBug = {
        title: "Bugs & Errors Reporting",
        custom_id: "BugModalReport",
        components: [
            {
                type: 1,
                components: [
                    {
                        type: 4,
                        custom_id: "commandBuggued",
                        label: "Qual é o comando/sistema?",
                        placeholder: "Balance, Giveaway, AFk, Hug...",
                        style: 1,
                        max_length: 50
                    }
                ]
            }, // MAX: 5 Fields
            {
                type: 1,
                components: [
                    {
                        type: 4,
                        custom_id: "bugTextInfo",
                        label: "O que aconteceu?",
                        style: 2,
                        min_length: 20,
                        max_length: 3900,
                        placeholder: "Quando tal recurso é usado acontece...",
                        required: true
                    }
                ]
            }
        ]
    }

    chooseWordForca = {
        title: "Hangman Game",
        custom_id: "forcaChooseWord",
        components: [
            {
                type: 1,
                components: [
                    {
                        type: 4,
                        custom_id: "componentOne",
                        label: "Diga sua palavra",
                        style: 1,
                        min_length: 3,
                        max_length: 25,
                        placeholder: "Discord",
                        required: true
                    }
                ]
            } // MAX: 5 Fields
        ]
    }

    setNewStatus = {
        title: "Set Status Command",
        custom_id: "setStatusModal",
        components: [
            {
                type: 1,
                components: [
                    {
                        type: 4,
                        custom_id: "newStatus",
                        label: "Digite seu novo status",
                        style: 1,
                        min_length: 5,
                        max_length: 80,
                        placeholder: "No mundo da lua",
                        required: true
                    }
                ]
            }
        ]
    }

    editProfileModal = {
        title: "Edit Profile Information",
        custom_id: "editProfile",
        components: [
            {
                type: 1,
                components: [
                    {
                        type: 4,
                        custom_id: "profileJob",
                        label: "Qual sua profissão?",
                        style: 1,
                        min_length: 5,
                        max_length: 30,
                        placeholder: "Estoquista, Gamer, Terapeuta..."
                    }
                ]
            }, // MAX: 5 Fields
            {
                type: 1,
                components: [
                    {
                        type: 4,
                        custom_id: "profileBirth",
                        label: "Digite seu aniversário",
                        style: 2,
                        min_length: 10,
                        max_length: 10,
                        placeholder: "26/06/1999"
                    }
                ]
            },
            {
                type: 1,
                components: [
                    {
                        type: 4,
                        custom_id: "profileStatus",
                        label: "Digite seu novo status",
                        style: 2,
                        min_length: 5,
                        max_length: 100,
                        placeholder: "No mundo da lua..."
                    }
                ]
            }
        ]
    }

    editReactionRole = (roleData) => {
        return {
            title: "Edit Role in Reaction Role",
            custom_id: roleData.roleId,
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 4,
                            custom_id: "roleTitle",
                            label: "Título do cargo",
                            style: 1,
                            min_length: 1,
                            max_length: 25,
                            placeholder: "Sem título",
                            required: true,
                            value: roleData.title || null
                        }
                    ]
                }, // MAX: 5 Fields
                {
                    type: 1,
                    components: [
                        {
                            type: 4,
                            custom_id: "roleDescription",
                            label: "Descrição do Cargo",
                            style: 1,
                            min_length: 0,
                            max_length: 50,
                            placeholder: "Escreva \"null\" para remover a descrição",
                            required: true,
                            value: roleData.description || null
                        }
                    ]
                }
            ]
        }

    }

    newTicketCreate = {
        title: "New Ticket Theme Create",
        custom_id: "newTicketCreation",
        components: [
            {
                type: 1,
                components: [
                    {
                        type: 4,
                        custom_id: "nameOrIdToCategory",
                        label: "ID ou NOME da categoria",
                        style: 1,
                        min_length: 1,
                        max_length: 100,
                        placeholder: "Tickets de Denúncias | Tickets de Dúvidas",
                        required: true
                    }
                ]
            },
            {
                type: 1,
                components: [
                    {
                        type: 4,
                        custom_id: "title",
                        label: "Qual o título deste Ticket?",
                        style: 1,
                        min_length: 1,
                        max_length: 25,
                        placeholder: "Ticket de Ajuda | Ticket de Denúncias",
                        required: true
                    }
                ]
            }, // MAX: 5 Fields
            {
                type: 1,
                components: [
                    {
                        type: 4,
                        custom_id: "description",
                        label: "Descrição deste ticket",
                        style: 1,
                        max_length: 50,
                        placeholder: "Abra este ticket para sanar suas dúvidas"
                    }
                ]
            } // MAX: 5 Fields
        ]
    }
}

module.exports = Modals