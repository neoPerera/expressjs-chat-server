const mongo = require('mongoose');

const Post = new mongo.Schema(
    {

        USER:{
            type: String
        },
        POST:{
            type: String
        },
        DATE:{
            type: Date,
            default: Date.now
        }
    }
);

module.exports = PostModel = mongo.model('posts', Post);