var express = require('express');
var app = express();
var server = require('http').Server(app);
var socketIo = require('socket.io');
const router = require('./serverRouter.js');
const cors = require('cors');
const {
    AddUser,
    RemoveUser,
    GetUser,
    GetUsersInRoom,
    AddToOnlineList,
    GetOnlineList,
    UserLogOut,
    FindDetails,
    FindDetailsById } = require('./Users.js');

//import mongodb connection
const db = require('./Mongo/Db');

//mongo db model
const MessageModel = require('./Mongo/Models/Message');
const PostModel = require('./Mongo/Models/Posts');


//OPEN AI CONFIGURATIONS
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: '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',
});

const openai = new OpenAIApi(configuration);

//connecting with
db();

const PORT = process.env.PORT || 5000;
var io = socketIo(server,{
    cors: {
      origin: "http://localhost",
      methods: ["GET", "POST"]
    }
  });
server.listen(PORT, () => console.log(`Server started at port ${PORT}`));


app.use(router);
app.use(cors());


const fun1 = async (req) =>  {
        return await openai.createImage({
            prompt: req,
            n: 1,
            size: "1024x1024",
          }) ;


        
      //console.log(response.data.data[0].url);
    //   return  order.data.data[0].url;
  }
io.on(
    'connection', (socket) => {
        console.log('got a connection');
        
                
 
          //image_url = .data.data[0].url;
      

        //got a connection to set online
        socket.on('setOnline', (props) => {
            console.log('someone is online !');
            const addOnline = AddToOnlineList({ id: props.id, socketId: socket.id, UserName: props.UserName, Room: 'online' });
            console.log('joinde user ' + JSON.stringify(addOnline));
            //user joins for specific room
            socket.join('online');

            //send online list
            const getOnlineList = GetOnlineList();
            io.to('online').emit('sendMemberList', getOnlineList);
            console.log('emiting online list ' + JSON.stringify(getOnlineList));

            PostModel.find().sort({ DATE: -1 })
                .then(items => {
                    //console.log(items);
                    io.to('online').emit('initialsendingPostToUsers', items);
                })
                .catch(err => console.log(err));


        }
        );
        socket.on('logout', (props) => {
            console.log('User LogOut');
            const finduser = FindDetails(socket.id);

            UserLogOut(finduser.id);
            //updating online list
            const getOnlineList = GetOnlineList();
            io.to('online').emit('sendMemberList', getOnlineList);
            console.log('emiting online list ' + JSON.stringify(getOnlineList));


        }
        );


        //    user join
        socket.on(
            'join',
            (props, callBack) => {
                if (props.UserName == '' || props.Room == '') {
                    callBack();
                } else {

                    //adding users to array
                    const User = AddUser({ id: socket.id, Userid: props.id, UserName: props.UserName, Room: props.Room });

                    //if there is an error. call back()
                    if (User.error) {
                        callBack();
                    }
                    else {

                        console.log(props.UserName + ' joined room ' + props.Room);

                        //database fetching about room
                        MessageModel.find({ ROOM: props.Room })
                            .then(items => {
                                console.log(items)
                                items.forEach(element => socket.emit('message', { User: element.USER, Text: element.MESSAGE }));


                                // socket.emit('message', { User: 'Admin', Text: `Welcome ${props.UserName}` });



                            });





                        console.log('sent welcome message');
                        socket.broadcast.to(props.Room).emit('message', { User: `Admin`, Text: `${props.UserName} joined` });

                        //trying to update online list
                        const GetUsers = GetUsersInRoom(props.Room);


                        //user joins for specific room
                        socket.join(Room);

                        //sending current online list
                        io.to(props.Room).emit('sendMemberList', GetUsers);
                    }
                }
            }
        );



        //user sends a message
        socket.on(
            'sendMessage',
            (mesg, callBack) => {
                console.log(mesg);
                const UserDetails = GetUser(socket.id);
                if (UserDetails.error) {
                    callBack();

                }
                else {
                    console.log("user details: " + JSON.stringify(UserDetails));
                    io.to(UserDetails.Room).emit('message', mesg);

                    //sending to database
                    let dbSendMessage = {};
                    dbSendMessage.ROOM = UserDetails.Room;
                    dbSendMessage.USER = UserDetails.UserName;
                    dbSendMessage.MESSAGE = mesg.Text;

                    let messagemodel = new MessageModel(dbSendMessage);
                    messagemodel.save()
                    console.log('posts updated to database');


                    //trying to send a notification
                    const getOnlineUserDetails = FindDetailsById(mesg.User2)
                    io.to(getOnlineUserDetails.sockId).emit('notification', { MsgFrom: mesg.User1, Sendername: UserDetails.UserName });
                    console.log('notification sent ' + getOnlineUserDetails.sockId);

                    //ERP NOTIFICATION
                    io.to(getOnlineUserDetails.sockId).emit('erpnotification', { MsgFrom: mesg.User1, Msg: mesg });


                }





            }
        );
        // newPost
        //user sends a post
        socket.on(
            'newPost',
            (mesg, callBack) => {
                console.log(mesg);
                const finduser = FindDetails(socket.id);
                if (finduser.error) {
                    callBack();

                }
                else {
                    console.log("user details: " + JSON.stringify(finduser));

                    //sending to database
                    let dbSendPost = {};

                    dbSendPost.USER = finduser.UserName;
                    dbSendPost.POST = mesg.Text;
                    var reply = fun1(mesg.Text)
                    .then((order) => {
                        console.log(order.data.data[0].url)
                        dbSendPost.IMAGE = order.data.data[0].url;
                        let postmodel = new PostModel(dbSendPost);
                        postmodel.save()
                        .then(
                            item => {
                                io.to('online').emit('sendingPostToUsers', item);

                            }
                        );
                        console.log('message updated to database');
                    });

               


                    
                    

                }





            }
        );

        //key sending
        socket.on(
            'sendPublicKey',
            (mesg, callBack) => {
                console.log('someone sent key');
                const UserDetails = GetUser(socket.id);
                if (UserDetails.error) {
                    callBack();

                }
                else {
                    console.log(mesg);
                    io.to(UserDetails.Room).emit('ServerSendPublicKey', mesg);
                }




            }
        );

        //notify when user is typing
        socket.on(
            'typing',
            (mesg, callBack) => {
                console.log('someone is typing');
                const UserDetails = GetUser(socket.id);
                if (UserDetails.error) {
                    callBack();

                }
                else {
                    console.log("typing:" + JSON.stringify(UserDetails));
                    io.to(UserDetails.Room).emit('sendtyping', mesg);
                }




            }
        );

        //user request for member list of  room
        socket.on(
            'getmemberslist',
            (mesg, callBack) => {

                const UserDetails = GetUser(socket.id);
                if (UserDetails.error) {
                    callBack();

                }
                else {
                    console.log('someone requested member list of room ' + UserDetails.Room);
                    const GetUsers = GetUsersInRoom(UserDetails.Room);
                    console.log('list =>' + JSON.stringify(GetUsers));

                    io.to(UserDetails.id).emit('sendMemberList', GetUsers);

                }


            }
        );


        //user disconnect function
        socket.on
            (
                'disconnect',
                () => {
                    const UserDetails = GetUser(socket.id);
                    if (UserDetails.error) {


                    }
                    else {
                        //if user logged out while typing
                        //send typing off
                        io.to(UserDetails.Room).emit('sendtyping', { User: UserDetails.UserName, Typing: false });

                        //send user left message
                        socket.broadcast.to(UserDetails.Room).emit('message', { User: `Admin`, Text: `${UserDetails.UserName} left` });



                        //removing the user from user array
                        console.log('User disconnected => ' + socket.id);
                        RemoveUser(socket.id);


                    }

                }
            );
        
                //key sending
        socket.on( 'sayhi',
                    (mesg, callBack) => {
                        console.log('someone sent hi');
                        const UserDetails = GetUser(socket.id);
                        if (UserDetails.error) {
                            callBack();
        
                        }
                        else {
                            console.log(mesg); 
                        }
        
        
        
        
                    }
                );

    }
);
