const mongo = require('mongoose');

const RoomKey = new mongo.Schema(
    {
        
        USERS:{
            type: [String]
        }
    }
);

module.exports = RoomKeyModel = mongo.model('roomkey', RoomKey);