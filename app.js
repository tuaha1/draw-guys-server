const express = require("express");
const app = express();

const http = require("http");
const server = http.createServer(app);

const cors = require("cors");
app.use(cors());

const { Server } = require("socket.io");
const words = require("./words");

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

let users = [];
let guessWord = "";
let roundNumber = 1;

const whoShouldDraw = (userlist) => {

    if (userlist.length === 1) {
        io.emit("who should draw", { id: users[0].id, word: "wait for some users to join" });
        return;
    }

    for (let i = 0; i < userlist.length; i++) {
        if (userlist[i].hasDrawn === false) {
            let wordIndex = Math.floor(Math.random() * words.length);
            guessWord = words[wordIndex];
            io.emit("who should draw", { id: users[i].id, word: guessWord });
            io.emit("roundSetter", roundNumber);
            io.emit("receiveDrawingData", { elements: [] });
            break;
        }
    }
}

io.on("connection", (socket) => {

    socket.on("nickname", (data) => {
        const user = { id: socket.id, nickname: data, hasDrawn: false, score: 0, hasGuessed: false };

        if (!users.includes(user)) {
            users.push(user);
        }

        whoShouldDraw(users);
        io.emit("roundSetter", roundNumber);
        io.emit("receive nicknames", users);
    })

    socket.on("drawing done", data => {

        users.forEach(element => element.hasGuessed = false);
        io.emit("receive nicknames", users);

        io.emit("enable chatbox");
        console.log("drawing done by: ", data);
        users.forEach((element) => {
            if (element.id === data) {
                element.hasDrawn = true;
            }
        })

        let checkisDrawn = users.every((element) => element.hasDrawn === true);
        if (checkisDrawn) {
            io.emit("roundSetter", roundNumber);
            if (roundNumber === 3) {
                roundNumber = 1;
                console.log("restart the game");
                let scores = users.sort((a, b) => b.score - a.score);
                io.emit("round finished", scores);
                setTimeout(() => {
                    io.emit("round start");
                    users.forEach((element) => element.score = 0);
                    users.forEach((element) => element.hasDrawn = false);
                    whoShouldDraw(users);
                    io.emit("receive nicknames", users);
                }, 5000);
            } else {
                users.forEach((element) => element.hasDrawn = false);
                ++roundNumber;
                whoShouldDraw(users);
            }

        } else if (users.length >= 2) {
            whoShouldDraw(users);
        }

    })

    socket.on("guess message", (data) => {
        for (let i = 0; i < users.length; i++) {
            if (users[i].id === data.id) {
                data.name = users[i].nickname;
                if (data.message === guessWord) {
                    users[i].score += 50;
                    users[i].hasGuessed = true;
                    data.message = "this user has guessed the word";
                    io.emit("user guessed", users[i].id);

                    let checkIsGuessed = 0;
                    users.forEach(element => { if (element.hasGuessed === true) { checkIsGuessed++ } });
                    if ((users.length - 1) === checkIsGuessed) {
                        io.emit("next player", { name: "taha" });
                        console.log("next drawer please");
                    }
                }
            }
        }

        io.emit("receive nicknames", users);
        io.emit("receive guess", data);
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

    socket.on("disconnect", () => {
        const index = users.findIndex(item => item.id === socket.id);
        users.splice(index, 1);

        console.log("how many users are there ma: ", users.length);
        if (users.length <= 1) {
            roundNumber = 1;
            whoShouldDraw(users);
        }

        io.emit("receive nicknames", users);
    })

})

app.get("/", (req, res) => {
    res.send("everything nice..");
})

const port = process.env.PORT;

server.listen(port, () => {
    console.log("server started successfully ",);
})