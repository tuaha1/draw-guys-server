const { getGuessWord } = require("./guessWord");

module.exports = function (data, clients) {

    let name = '';

    for (let element of clients) {
        if (element.id === data.id) {
            name = element.nickname;
            if (data.message === getGuessWord()) {
                return { id: element.id, message: "this user has guessed the word", name };
            }
        }
    }

    return { message: data.message, name };
}