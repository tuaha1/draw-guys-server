
let roundNumber = 1;

module.exports.increaseRound = () => {
    roundNumber++;
}

module.exports.getRound = () => {
    return roundNumber;
}

module.exports.resetRound = () => {
    roundNumber = 1;
}