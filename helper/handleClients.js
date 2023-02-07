
module.exports = async function getClients(io) {
    let clients = [];
    const sockets = await io.fetchSockets();

    for (let socket of sockets) {
        if (socket.nickname !== undefined) {
            clients.push({
                id: socket.id,
                nickname: socket.nickname,
                hasDrawn: socket.hasDrawn,
                hasGuessed: socket.hasGuessed,
                score: socket.score
            });
        }
    }

    return clients;
}

module.exports.updateClientGuess = async (io, data) => {
    const sockets = await io.fetchSockets();

    for (let socket of sockets) {
        if (socket.id === data.id) {
            socket.score += 50;
            socket.hasGuessed = true;
            break;
        }
    }
}

module.exports.setHasGuessedToFalse = async (io) => {
    const sockets = await io.fetchSockets();

    for (let socket of sockets) {
        socket.hasGuessed = false;
    }
}

module.exports.resetScore = async (io) => {
    const sockets = await io.fetchSockets();

    for (let socket of sockets) {
        socket.score = 0;
    }
}

module.exports.setHasDrawnToFalse = async (io) => {
    const sockets = await io.fetchSockets();

    for (let socket of sockets) {
        socket.hasDrawn = false;
    }
}

module.exports.drawingDone = async (io, data) => {
    const sockets = await io.fetchSockets();

    for (let socket of sockets) {
        if (socket.id === data) {
            socket.hasDrawn = true;
        }
    }
}