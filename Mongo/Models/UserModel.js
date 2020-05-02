const mongo = require('mongoose');

const User = new mongo.Schema(
    {
        USERNAME:{
            type: String
        },
        EMAIL:{
            type: String
        },
        PASSWORD:{
            type: String
        }
    }
);

module.exports = UserModel = mongo.model('user', User);