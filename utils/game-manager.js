const { v4: uuidv4 } = require('uuid');

class GameManager {
    constructor(io) {
        this.io = io;
        this.filledGames = {};
        this.unfilledGames = {};
        this.gameStatus = {
            SEARCHING: 'Searching for players',
            IN_PROGRESS: 'Game in progress',
            FINISHED: 'Game finished',
        };
        this.winnerStatus = {
            NO_WINNER: 'No Winner',
            TIE: 'Tie'
        }
        this.gameMarkers = {
            X: 'X',
            O: 'O'
        };
        this.rows = 3;
        this.cols = 3;
    }

    createNewGame(id, isPrivate = false) {
        this.unfilledGames[id] = {
            id,
            isPrivate,
            players: {},
            playerTurn: '',
            gameState: [
                ['-', '-', '-'],
                ['-', '-', '-'],
                ['-', '-', '-']
            ],
            gameStatus: this.gameStatus.SEARCHING,
            winner: '',
        };
    }

    isGameValid(gameId) {
        if ((gameId in this.filledGames)) {
            return true;
        } else {
            return false;
        }
    }

    startGame(id) {
        // Make sure this is an active game
        if (!this.isGameValid(id)) {
            return;
        }

        this.filledGames[id].gameStatus = this.gameStatus.IN_PROGRESS;

        // Randomly decide who gets the first turn
        if (Math.random() > 0.5) {
            this.filledGames[id].playerTurn = Object.keys(this.filledGames[id].players)[0];
        } else {
            this.filledGames[id].playerTurn = Object.keys(this.filledGames[id].players)[1];
        }

        this.io.in(id).emit('setGameRoom', this.filledGames[id]);
    }

    abruptEndGame(gameId) {
        // Make sure this is an active game
        if (!this.isGameValid(gameId)) {
            return;
        }

        const game = this.filledGames[gameId];
        game.winner = this.winnerStatus.NO_WINNER;
        game.gameStatus = this.gameStatus.FINISHED;

        this.io.in(gameId).emit('setGameRoom', game);

        // Remove game from dictionary
        delete this.filledGames[gameId];
    }

    processUserMove(gameId, userId, rowIdx, colIdx) {
        // Make sure this is an active game
        if (!this.isGameValid(gameId)) {
            return;
        }

        const game = this.filledGames[gameId];

        // Ensure its the correct players turn
        if (game.playerTurn === userId) {
            // Check to make sure spot not already taken
            if (game.gameState[rowIdx][colIdx] !== this.gameMarkers.X && game.gameState[rowIdx][colIdx] !== this.gameMarkers.O) {
                // Set the marker
                this.filledGames[gameId].gameState[rowIdx][colIdx] = game.players[userId].marker;

                // Change player turn
                const index = Object.keys(game.players).findIndex(element => {
                    return element === userId;
                });
                game.playerTurn = index === 0 ? Object.keys(game.players)[1] : Object.keys(game.players)[0];

                // Check win condition
                const playerWon = this.checkWinCondition(game.gameState, game.players[userId].marker);
                if (playerWon) {
                    game.winner = userId;
                    game.gameStatus = this.gameStatus.FINISHED;
                }

                // Check no win condition
                const noWinner = this.checkNoWin(game.gameState);
                if (noWinner) {
                    game.winner = this.winnerStatus.TIE;
                    game.gameStatus = this.gameStatus.FINISHED;
                }

                // Send the current game state to all clients
                this.io.in(gameId).emit('setGameRoom', this.filledGames[gameId]);

                // Remove game from dictionary if someone won
                if (playerWon) {
                    delete this.filledGames[gameId];
                }
            }
        }
    }

    checkWinCondition(grid, marker) {
        if (this.checkWinRow(grid, marker) || this.checkWinCol(grid, marker) || this.checkWinDiag(grid, marker)) {
            return true;
        } else {
            return false;
        }
    }

    checkNoWin(grid) {
        let counter = 0;
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                if (grid[i][j] === this.gameMarkers.X || grid[i][j] === this.gameMarkers.O) {
                    counter++;
                }
            }
        }

        if (counter === this.rows * this.cols) {
            return true;
        }
    }

    checkWinRow(grid, marker) {
        for (let i = 0; i < this.rows; i++) {
            let counter = 0;
            for (let j = 0; j < this.cols; j++) {
                if (grid[i][j] === marker) {
                    counter++;
                }
            }

            if (counter === this.rows) {
                return true;
            }
        }

        return false;
    }

    checkWinCol(grid, marker) {
        for (let i = 0; i < this.rows; i++) {
            let counter = 0;
            for (let j = 0; j < this.cols; j++) {
                if (grid[j][i] === marker) {
                    counter++;
                }
            }

            if (counter === this.rows) {
                return true;
            }
        }
    }

    checkWinDiag(grid, marker) {
        let counter = 0;
        for (let i = 0; i < this.rows; i++) {
            if (grid[i][i] === marker) {
                counter++;
            }
        }

        if (counter === this.rows) {
            return true;
        } else {
            let j = this.cols - 1;

            counter = 0;

            for (let i = 0; i < this.rows; i++, j--) {
                if (grid[i][j] === marker) {
                    counter++;
                }
            }

            if (counter === this.rows) {
                return true;
            }
        }

        return false;
    }

    removeUserFromGameSession(gameId, userId) {
        if ((gameId in this.unfilledGames)) {
            delete this.unfilledGames[gameId].players[userId];
        }
    }

    joinAvailableGameSession(socket) {
        // Create a new game if no available rooms exist
        if (Object.keys(this.unfilledGames).length === 0) {
            this.createNewGame(uuidv4());
        }

        let gameId = '';

        Object.keys(this.unfilledGames).forEach((element) => {
            if (!this.unfilledGames[element].isPrivate && Object.keys(this.unfilledGames[element].players).length < 2) {
                // Let the client join the game room
                socket.join(element);

                // Add the player to the game room
                this.unfilledGames[element].players[socket.id] = {
                    marker: Object.keys(this.unfilledGames[element].players).length === 0 ? this.gameMarkers.X : this.gameMarkers.O,
                };

                // Send the most up to date information to each player in the game room
                this.io.in(element).emit('setGameRoom', this.unfilledGames[element]);

                gameId = element;

                // Once the room fills up, remove from unfilled games
                if (Object.keys(this.unfilledGames[element].players).length >= 2) {
                    this.filledGames[element] = this.unfilledGames[element];
                    delete this.unfilledGames[element];

                    this.startGame(element);
                }
            }
        });

        return gameId;
    }

}

module.exports = {
    GameManager
}