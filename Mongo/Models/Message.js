const mongo = require('mongoose');

const Message = new mongo.Schema(
    {
        ROOM:{
            type: String
        },
        USER:{
            type: String
        },
        MESSAGE:{
            type: String
        }
    }
);

module.exports = MessageModel = mongo.model('messages', Message);