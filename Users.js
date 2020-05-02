// const Users = [{id: null, UserName: null, Room: null}];
// const OnlineList = [{id: null,sockId: null, UserName: null, Room: null}];
const Users =[];
const OnlineList = [];

const AddUser =(props) =>
{
    UserName = props.UserName;
    Room = props.Room;

    const ExistingUsers = Users.find((user) => user.Userid === props.Userid);
    if(ExistingUsers)
    {
        const Index = Users.findIndex(({id}) => id === props.id );
        if(Index !== -1)
        {
            Users.splice(Index, 1)[0];
        }
        const User = {id: props.id,Userid: props.Userid , UserName: UserName, Room: Room};

        Users.push(User);
        console.log("AddUser function => "+JSON.stringify(Users));

        return {User}; 
        
    }
    else
    {
        const User = {id: props.id,Userid: props.Userid , UserName: UserName, Room: Room};

        Users.push(User);
        console.log("AddUser function => "+JSON.stringify(Users));

        return {User}; 
    }
}

const RemoveUser =(idd) =>
{
    const Index = Users.findIndex(({id}) => id === idd );
    if(Index !== -1)
    {
        return Users.splice(Index, 1)[0];
    }
}

const GetUser =(idd) =>
{
    console.log("GetUSerID function id =>"+idd);
                    
    const User = Users.find( ({ id }) => id == idd);
    console.log("GetUSerID function "+JSON.stringify(User));
    if(User)
    {
        return User;
    }
    else{
        return({error: true});
    }
}



const GetUsersInRoom =(Roomm) => 
{
    const Rm = Users.filter(({Room}) => Room === Roomm);
    return Rm;
}

//adding someone to online list 
const AddToOnlineList = (props) =>
{
    const ExistingUser = OnlineList.find((user) => user.id === props.id);
    if(!ExistingUser)
    {
        const onlineTrue = {id: props.id,sockId: props.socketId, UserName: props.UserName, Room: 'online'};
        OnlineList.push(onlineTrue);

        return onlineTrue;

    }
    else{
        const Index = OnlineList.findIndex(({id}) => id === props.id );
        if(Index !== -1)
        {
            OnlineList.splice(Index, 1)[0];
            const onlineTrue = {id: props.id,sockId: props.socketId, UserName: props.UserName, Room: 'online'};
            OnlineList.push(onlineTrue);

            return onlineTrue;

        }
    }

    
    
   
}
//get online list
const GetOnlineList =()=>
{
    return OnlineList;
}
//userLogOut
const UserLogOut=(props)=>
{
    const Index = OnlineList.findIndex(({id}) => id === props );
    if(Index !== -1)
    {
        return OnlineList.splice(Index, 1)[0];
    }

}
//findUserOnline
const FindDetails=(props)=>
{
    const OnlineUser = OnlineList.find( ({ sockId }) => sockId == props);
    console.log("GetUSerID function "+JSON.stringify(OnlineUser));
    if(OnlineUser)
    {
        return OnlineUser;
    }
    else{
        return({error: true});
    }

}

const FindDetailsById=(props)=>
{
    const OnlineUser = OnlineList.find( ({ id }) => id == props);
    console.log("GetUSerID function "+JSON.stringify(OnlineUser));
    if(OnlineUser)
    {
        return OnlineUser;
    }
    else{
        return({error: true});
    }

}




module.exports = {AddUser, RemoveUser, GetUser,GetUsersInRoom, AddToOnlineList, GetOnlineList,UserLogOut,FindDetails,FindDetailsById};