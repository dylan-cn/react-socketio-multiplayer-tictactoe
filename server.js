const express = require("express");
const http = require("http");
const path = require('path');
const socketIO = require("socket.io");
const app = express();
// The server instance
const server = http.createServer(app);
// This creates our socket using the instance of the server
const io = socketIO(server);

const { GameManager } = require('./utils/game-manager');
const gameManager = new GameManager(io);
const { UserManager } = require('./utils/user-manager');
const userManager = new UserManager();

io.on("connection", socket => {
    // Add the user to dictionary when they connect
    userManager.addUser(socket.id);

    socket.on('findGame', () => {
        // Validate that the user isn't already in a game
        if (userManager.getUserGameSession(socket.id) === '') {
            // Connect the user to a game session
            const gameId = gameManager.joinAvailableGameSession(socket);

            // Set the user's gameId in the dictionary
            userManager.addUserToGame(socket.id, gameId);
        }
    });

    socket.on('endGame', () => {
        userManager.addUserToGame(socket.id, '');
    });

    socket.on('makeMove', (data) => {
        gameManager.processUserMove(data.gameId, socket.id, data.rowIdx, data.colIdx);
    });

    // disconnect is fired when a client leaves the server
    socket.on("disconnect", () => {
        // Check if user is leaving midgame
        const userGameId = userManager.getUserGameSession(socket.id);
        if (userGameId !== '') {
            gameManager.abruptEndGame(userGameId);
            gameManager.removeUserFromGameSession(userGameId, socket.id);
        }

        // Remove user from dictionary when they disconnect
        userManager.removeUser(socket.id);
    });

    socket.on("disconnecting", () => {
        for (let room in socket.rooms) {
            //io.in(room).emit('receivedMsg', socket.id + " leaving room");
        }

    });
});

app.use(express.static(path.join(__dirname, '/build')));

app.get('/getFilled', function (req, res) {
    res.status(200).send(gameManager.filledGames);
});

app.get('/getUnfilled', function (req, res) {
    res.status(200).send(gameManager.unfilledGames);
});

app.get('/api/game_status', function (req, res) {
    res.status(200).send(gameManager.gameStatus);
});

app.get('/api/game_winner', function (req, res) {
    res.status(200).send(gameManager.winnerStatus);
});

// Handles any requests that don't match the ones above
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname + '/build/index.html'));
});

server.listen(process.env.PORT || 80, () => console.log(`Listening on port 8080`));