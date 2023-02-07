const words = require("../words");

let guessWord = "";

module.exports.setGuessWord = () => {
    const wordIndex = Math.floor(Math.random() * words.length);
    guessWord = words[wordIndex];
}

module.exports.getGuessWord = () => {
    if (guessWord === "") {
        this.setGuessWord();
    }
    return guessWord;
}