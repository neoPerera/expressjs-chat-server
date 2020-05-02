const mongo = require('mongoose');

const KEY = "mongodb+srv://neo:neo@123@clusterchat-ao2dq.gcp.mongodb.net/test?retryWrites=true&w=majority";

const DB = async() =>
{
    await mongo.connect(KEY, {useUnifiedTopology: true , useNewUrlParser: true }) ;
    console.log("Connectd to database");
} 

module.exports = DB;