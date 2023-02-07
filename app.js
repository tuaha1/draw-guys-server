const express = require("express");
const app = express();

const http = require("http");
const server = http.createServer(app);

const cors = require("cors");
app.use(cors());

const { Server } = require("socket.io");

const getClients = require("./helper/handleClients");
const whoShouldDraw = require("./helper/whoShouldDraw");
const checkGuessMessage = require("./helper/checkGuessMessage");
const { getRound, resetRound, increaseRound } = require("./helper/roundNumber");
const { getGuessWord, setGuessWord } = require("./helper/guessWord");

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

io.on("connection", (socket) => {

    socket.on("nickname", async (data) => {
        socket.nickname = data;
        socket.hasDrawn = false;
        socket.hasGuessed = false;
        socket.score = 0;

        console.log(data);


        whoShouldDraw(io, getRound());
        // const clients = await getClients(io);
        // if (clients.length <= 2) {
        //     whoShouldDraw(io);
        // } else {
        //     io.emit("receive nicknames", clients);
        // }

    })

    socket.on("drawing done", async (data) => {

        io.emit("receive guess", { name: 'the word was', message: getGuessWord() });

        console.log("drawing done hoga soch", data);

        getClients.setHasGuessedToFalse(io);
        getClients.drawingDone(io, data);

        const clients = await getClients(io);
        let checkisDrawn = clients.every((element) => element.hasDrawn === true);
        if (checkisDrawn) {
            if (getRound() === 3) {
                const score = clients.map((element) => { return { nickname: element.nickname, score: element.score } });
                io.emit("round finished", score);
                setTimeout(() => {
                    resetRound();
                    getClients.resetScore(io);
                    getClients.setHasDrawnToFalse(io);
                    setGuessWord();
                    whoShouldDraw(io, getRound());
                    io.emit("round start");
                }, 5000);
            } else {
                getClients.setHasDrawnToFalse(io);
                increaseRound();
                setGuessWord(io);
                whoShouldDraw(io, getRound());
            }
        } else {
            setGuessWord();
            whoShouldDraw(io, getRound());
        }

        io.emit("enable chatbox");
        io.emit("receive nicknames", await getClients(io));
    })

    socket.on("guess message", async (data) => {

        const clients = await getClients(io);
        const messageData = checkGuessMessage(data, clients);

        if (messageData.id) {
            getClients.updateClientGuess(io, messageData);
            io.emit("user guessed", messageData.id);
        }

        // const allClientsGuessed = await getClients(io);
        // let checkIsGuessed = 0;
        // allClientsGuessed.forEach((element) => { if (element.hasGuessed) { checkIsGuessed++ } });
        // if ((allClientsGuessed.length - 1) === checkIsGuessed) {
        //     io.emit("next player");
        //     return;
        // }

        io.emit("receive nicknames", await getClients(io));
        io.emit("receive guess", messageData);
    })

    socket.on("time data", (data) => {
        socket.broadcast.emit("receiveTimerData", data);
    })

    socket.on("sendDrawingData", (data) => {
        console.log(data);
        socket.broadcast.emit("receiveDrawingData", data);
    })

    socket.on("undoElements", (data) => {
        let copy = data.elements;
        copy.splice(-1, 1);
        io.emit("receiveDrawingData", { elements: copy });
    })

    socket.on("clearScreen", () => {
        io.emit("receiveDrawingData", { elements: [] });
    })

    socket.on("disconnect", async () => {

        const clients = await getClients(io);

        if (clients.length === 1) {
            resetRound();
            whoShouldDraw(io, getRound());
        } else {
            whoShouldDraw(io, getRound());
        }

        io.emit("receive nicknames", clients);
    })

})

app.get("/", (req, res) => {
    res.send("everything nice..");
})

const port = process.env.PORT;

server.listen(port, () => {
    console.log("server started successfully ", port);
})