const configValues = require("./config");

module.exports = {
    getDBConnection: function () {
        return `mongodb+srv://${configValues.username}:${configValues.password}@cluster0.qbooa.mongodb.net/${configValues.database}?retryWrites=true&w=majority`
    }
}