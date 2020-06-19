class UserManager {
    constructor() {
        this.users = {};
    }

    /**
     * Adds a user to the dictionary
     * 
     * @param {string} userId 
     */
    addUser(userId) {
        this.users[userId] = '';
    }

    /**
     * Removes a user from the dictionary
     * 
     * @param {string} userId 
     */
    removeUser(userId) {
        delete this.users[userId];
    }

    /**
     * A specified user to a specified game session
     * 
     * @param {string} userId 
     * @param {string} gameId 
     */
    addUserToGame(userId, gameId) {
        this.users[userId] = gameId;
    }

    /**
     * Gets the current game session for a user
     * 
     * @param {string} userId 
     * @returns {string} The game ID
     */
    getUserGameSession(userId) {
        return this.users[userId];
    }
}

module.exports = {
    UserManager
}