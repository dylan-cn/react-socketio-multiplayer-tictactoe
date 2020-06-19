const { v4: uuidv4 } = require('uuid');

class GameManager {
    /**
     * Creates a new GameManager class that handles game session management
     * 
     * @param {SocketIO.Server} io the socket.io server instance
     */
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

    /**
     * Initialize a new game and add it to the dictionary
     * 
     * @param {string} id 
     * @param {boolean} isPrivate 
     */
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

    /**
     * Check if a game is valid (a game session that is full)
     * 
     * @param {string} gameId 
     */
    isGameValid(gameId) {
        if ((gameId in this.filledGames)) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * Start the game and assign the player with the first turn.
     * 
     * @param {string} id 
     */
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

    /**
     * End the game prematurely. For example, if a player leaves the game before it ends.
     * 
     * @param {string} gameId 
     */
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

    /**
     * Take user move and process it. Checks the win conditions and the tie condition.
     * 
     * 
     * @param {string} gameId The game ID
     * @param {string} userId The user ID
     * @param {*} rowIdx The row index of the move location
     * @param {*} colIdx The column index of the move location
     */
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

    /**
     * Check if the specified marker has won the game with any of the win conditions.
     * 
     * @param {*} grid The grid representation of the game board
     * @param {*} marker The marker to check for win condition
     */
    checkWinCondition(grid, marker) {
        if (this.checkWinRow(grid, marker) || this.checkWinCol(grid, marker) || this.checkWinDiag(grid, marker)) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * Check if there is no winner
     * 
     * @param {*} grid The grid representation of the game board
     */
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

    /**
     * Check if the specified marker has won with the rows.
     * 
     * @param {*} grid The grid representation of the game board
     * @param {*} marker The marker to check for win condition
     */
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

    /**
     * Check if the specified marker has won with the columns.
     * 
     * @param {*} grid The grid representation of the game board
     * @param {*} marker The marker to check for win condition
     */
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

    /**
     * Check if the specified marker has won with the diagonals.
     * 
     * @param {*} grid The grid representation of the game board
     * @param {*} marker The marker to check for win condition
     */
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

    /**
     * Removes a user from an unfilled game session.
     * 
     * @param {string} gameId The game ID that a user is leaving.
     * @param {string} userId The user ID that is leaving.
     */
    removeUserFromGameSession(gameId, userId) {
        if ((gameId in this.unfilledGames)) {
            delete this.unfilledGames[gameId].players[userId];
        }
    }

    /**
     * Find an available game session. Creates a new game session if none are available.
     * 
     * @param {SocketIO.Socket} socket The socket of the client that is finding a game
     * @return {string} The game ID
     */
    joinAvailableGameSession(socket) {
        // Create a new game if no available rooms exist
        if (Object.keys(this.unfilledGames).length === 0) {
            this.createNewGame(uuidv4());
        }

        let gameId = '';

        Object.keys(this.unfilledGames).forEach((element) => {
            if (!this.unfilledGames[element].isPrivate && Object.keys(this.unfilledGames[element].players).length < 2) {
                // Put the client into the game room socket
                socket.join(element);

                // Add the player to the game room
                // this.unfilledGames[element].players[socket.id] = {
                //     marker: Object.keys(this.unfilledGames[element].players).length === 0 ? this.gameMarkers.X : this.gameMarkers.O,
                // };

                /**
                 * Add the player to the game room and assign their marker
                 * 
                 * Just give the first person in the room X.
                 * Otherwise have to check what the marker is of the other player in the case that someone left the room early.
                 */
                if (Object.keys(this.unfilledGames[element].players).length === 0) {
                    this.unfilledGames[element].players[socket.id] = {
                        marker: this.gameMarkers.X,
                    };
                } else {
                    const existingMarker = this.unfilledGames[element].players[Object.keys(this.unfilledGames[element].players)[0]].marker;

                    this.unfilledGames[element].players[socket.id] = {
                        marker: existingMarker === this.gameMarkers.X ? this.gameMarkers.O : this.gameMarkers.X,
                    };
                }

                // Send the most up to date information to each player in the game room
                this.io.in(element).emit('setGameRoom', this.unfilledGames[element]);

                gameId = element;

                /**
                 * Check to see if the addition of the player fills the room.
                 * If the room is full, then remove the game from unfilled dictionary to filled dictionary and start the game.
                 */
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