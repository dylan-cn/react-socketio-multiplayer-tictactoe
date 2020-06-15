const gameStatus = {
    SEARCHING: 'Searching for players',
    IN_PROGRESS: 'Game in progress',
    FINISHED: 'Game finished',
};

const io;
const hasInit = false;

function init(io) {
    if (hasInit) {
        return;
    }

    this.io = io;
}

function createNewGame(id, isPrivate = false) {
    unfilledGames.push({
        id,
        isPrivate,
        players: [],
        gameState: [],
        gameStatus: gameStatus.SEARCHING,
    });
};

function startGame(id) {
    const game = filledGames.find((element, index) => {
        if (element.id === id) {
            return index;
        }
    });

    filledGames[index].gameStatus = gameStatus.IN_PROGRESS;
}

const filledGames = [];
const unfilledGames = [];

module.exports = {
    createNewGame,
    filledGames,
    unfilledGames,
    init,
};