const express = require('express');
const cors = require('cors');
const bodyparser = require('body-parser');

//import mongodb connection
const db = require('./Mongo/Db');

//mongo db model
const UserModel = require('./Mongo/Models/UserModel');
const RoomKeyModel = require('./Mongo/Models/RoomKey');

//connecting with db
db();



const router = express.Router();

router.use(cors());
router.use(bodyparser.json());


router.get('/', (req, res) => {
    res.send("Server is running");

});

//sign up user request
router.post('/', (req, res) => {
    // console.log(req.body);
    // UserModel.find({ USERNAME: req.body.UserName, PASSWORD: req.body.Password })
    //     .then(item => res.send({ UserName: req.UserName, auth: false }))
    //     .catch(err => {
    //         console.log(req.body);
    //         let addUser = new UserModel({ USERNAME: req.body.UserName, EMAIL: req.body.Email, PASSWORD: req.body.Password });
    //         addUser.save()
    //             .then(item => res.send({ id: item.id, UserName: item.USERNAME, auth: true }));
    //     });
    console.log(req.body);
    let addUser = new UserModel({ USERNAME: req.body.UserName, EMAIL: req.body.Email, PASSWORD: req.body.Password });
    addUser.save()
        .then(item => res.send({ id: item.id, UserName: item.USERNAME, auth: true }));



});

//sign in user request
router.post('/login', (req, res) => {
    console.log(req.body);
    UserModel.findOne({ USERNAME: req.body.UserName, PASSWORD: req.body.Password })
        .then(item => res.send({ id: item.id, UserName: item.USERNAME, auth: true }))
        .catch(err => res.send({ UserName: req.UserName, auth: false }));

});

//sign in user request using auth
router.post('/auth', (req, res) => {
    console.log(req.body);
    UserModel.findOne({ EMAIL: req.body.Authprops.email })
        .then(item => res.send({ id: item.id, UserName: item.USERNAME, auth: true }))
        .catch(err => {

            let addUser = new UserModel({ USERNAME: req.body.Authprops.givenName, EMAIL: req.body.Authprops.email, PASSWORD: 'default' });
            addUser.save()
                .then(item => res.send({ id: item.id, UserName: item.USERNAME, auth: true }));
        });

});





router.post('/getkey', (req, res) => {
    console.log(req.body);
    // let addUser = new UserModel({USERNAME: req.body.UserName,EMAIL: req.body.Email, PASSWORD: req.body.Password});
    // addUser.save()
    // .then(item => res.send({id: item.id,UserName: item.USERNAME, auth: true }));
    RoomKeyModel.findOne({ USERS: { $all: [req.body.User, req.body.Chat] } }).
        then(item => res.send({ Roomkey: item.id }))
        .catch(err => {
            let addRoomkey = new RoomKeyModel({ USERS: [req.body.User, req.body.Chat] });
            addRoomkey.save()
                .then(item => res.send({ Roomkey: item.id }))
                .catch(err => res.send('can not chat'));
        }

        );

});




module.exports = router;