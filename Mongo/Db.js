const mongo = require('mongoose');
require("dotenv").config();
const KEY = process.env.DB_KEY;

const DB = async() =>
{
    await mongo.connect(KEY, {useUnifiedTopology: true , useNewUrlParser: true }) ;
    console.log("Connectd to database");
} 

module.exports = DB;