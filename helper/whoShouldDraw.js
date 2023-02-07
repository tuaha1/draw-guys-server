const getClients = require("./handleClients");
const { getGuessWord } = require("./guessWord");
const { resetRound } = require("./roundNumber");

module.exports = async function whoShouldDraw(io, round) {

    const clients = await getClients(io);
    console.log(clients);

    if (clients.length === 1) {
        io.emit("who should draw", { id: clients[0].id, word: "wait for some users to join" });
        io.emit("receive nicknames", clients);
        io.emit("round setter", round);
        return;
    }

    for (const client of clients) {
        if (client.hasDrawn === false) {
            io.emit("who should draw", { id: client.id, word: getGuessWord() });
            io.emit("receive nicknames", clients);
            io.emit("round setter", round);
            break;
        }
    }

}