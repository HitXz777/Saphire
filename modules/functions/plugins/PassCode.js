function PassCode(QuantidadeDeCaracteres) {

    if (isNaN(QuantidadeDeCaracteres))
        throw new Error('A quantidade de caracteres do passcode DEVE ser um NÚMERO.')

    let Result = '';
    let Caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < QuantidadeDeCaracteres; i++) {
        Result += Caracteres.charAt(Math.floor(Math.random() * Caracteres.length));
    }
    return Result;
}

module.exports = PassCode