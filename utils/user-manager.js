class UserManager {
    constructor() {
        this.users = {};
    }

    addUser(userId) {
        this.users[userId] = '';
    }

    removeUser(userId) {
        delete this.users[userId];
    }

    addUserToGame(userId, gameId) {
        this.users[userId] = gameId;
    }

    getUserGameSession(userId) {
        return this.users[userId];
    }
}

module.exports = {
    UserManager
}