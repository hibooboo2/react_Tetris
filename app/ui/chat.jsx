var Message = React.createClass({
    whisperTo:function(){
        alert("Replied");
    },render: function(){
        var theMessage =    <div className={"Message " + ((this.props.data.to === this.props.username) ? "toMe ":"fromMe ") }>
                                [{this.props.data.timeStamp?this.props.data.timeStamp.substring(11,19):''}] {this.props.data.from} : {this.props.data.message}
                                <svg className="icon" viewBox="0 0 8 8" onClick={this.whisperTo}>
                                  <path d="M3 0v3h-3v2h3v3h2v-3h3v-2h-3v-3h-2z" />
                                </svg>
                            </div>

        return theMessage;
    }
});


var MessageBox = React.createClass({
       getInitialState: function(){
        return {messages:this.props.messages,from:this.props.from,to:this.props.to,socket:this.props.socket};
    },componentDidMount: function(){
        // componentDidMount is called by react when the component
        // has been rendered on the page. We can set the interval here:
        this.setState({scrollTotal:document.getElementById("messageList"+this.state.to).scrollHeight})
    },sentMessage:function (data) {
        this.props.newMessage(data);
        this.scrollHeight();
    },scrolled:function(evt){
        var messages = evt.nativeEvent.target;
        this.setState({scrolled:messages.scrollHeight - messages.scrollTop - this.state.scrollTotal > 1});
    },scrollHeight:function(){
        if(!this.state.scrolled){
            var messages = document.getElementById("messageList"+this.state.to);
            messages.scrollTop = messages.scrollHeight;
        }
    },sendTheMessage:function (evt) {
        evt.stopPropagation();
        if (evt.keyCode === 13){
            this.state.socket.emit("new_message", {
                    from: this.state.from,
                    message: evt.nativeEvent.target.value,
                    to: this.state.to,
                    users:[this.state.to, this.state.from],
                    chatThread:[this.state.to, this.state.from].sort().toString(),
                    whisper:true
                },this.sentMessage);
            evt.nativeEvent.target.value = "";
        }
    },toggleHidden: function(){
        this.setState({hidden:!this.state.hidden});
    },close: function(evt){

    },render: function() {
        var currentUser = this.props.from;
        var theMessages = this.props.messages.map(function(data){
                return (
                           <Message username={currentUser} data={data}/>
                        )
        });

        var theMessageBox = <div className="MessageBox">
                            <div className={"chat"+ (this.props.closed ? " hidden":"") + (this.state.hidden ? " hidden":"")}>
                                <div className="messages" id={"messageList"+this.state.to} onScroll={this.scrolled}>
                                    {theMessages}
                                </div>
                                <input className="chatInput" onKeyDown={this.sendTheMessage}/>
                            </div>
                            <div className="chatTab" onClick={this.toggleHidden}>
                                <div className="flexBetween">
                                    <div>{this.state.to}</div>
                                    <div>{this.state.messages.length}</div>
                                </div>
                                <img src='http://i.imgur.com/agviQBF.png' className='chatExit' onClick={this.close}/>
                            </div>
                        </div>;
        return theMessageBox;
        }
});

var Friend = React.createClass({
    getInitialState:function(){
        return {user:this.props.user,online:0};
    },componentDidMount:function(){
        this.props.socket.on('user_presence',this.getProfile);
        this.props.socket.on('current_status',this.getProfile);
        this.getProfile();
    },updateProfile:function(err, profile){
            if(!err){
                this.setState({profile:profile});
            }
    },getProfile:function(){
        this.props.socket.emit('get_profile',this.state.user.username,this.updateProfile);
    },clicked:function(){
        this.props.whenClicked(this.props.user);
    },render: function() {
        var theFriend = <div className="Friend">
                        </div>;
        if(this.state.profile && (this.state.profile.presence > 0 || this.props.showOffline)){
            theFriend =
                <div onClick={this.clicked} className="Friend">
                    <img style={{height:'2em',width:'2em'}}src={this.state.profile.icon}/>
                    <div>
                        <div style={{display:'flex',justifyContent: 'space-between'}}>
                            <p>{this.state.profile.username} </p>
                            <svg className='status' fill={this.state.profile.presence ? "green":"red"} xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 8 8">
                              <path d="M3 0v4h1v-4h-1zm-1.28 1.44l-.38.31c-.81.64-1.34 1.64-1.34 2.75 0 1.93 1.57 3.5 3.5 3.5s3.5-1.57 3.5-3.5c0-1.11-.53-2.11-1.34-2.75l-.38-.31-.63.78.38.31c.58.46.97 1.17.97 1.97 0 1.39-1.11 2.5-2.5 2.5s-2.5-1.11-2.5-2.5c0-.8.36-1.51.94-1.97l.41-.31-.63-.78z"
                              />
                            </svg>
                        </div>
                        <p> {this.state.profile.statusMessage}</p>
                    </div>
                </div>;
        }
        return theFriend;
    }
});

var FriendsList = React.createClass({
    render: function() {
        var whenClicked = this.props.whenClicked;
        var showOffline = this.props.showOffline;
        var socket = this.props.socket;
        var groupNames = [];
        var groups = [];
        this.props.friends.map(function(friend){
            if( -1 === groupNames.indexOf(friend.group)){
                groupNames.push(friend.group);
            }
        });
        this.props.friends.map(function(friend){
            if(!groups[groupNames.indexOf(friend.group)]){
            groups[groupNames.indexOf(friend.group)] = [friend];
            groups[groupNames.indexOf(friend.group)]['name'] = friend.group;
            }else{
                groups[groupNames.indexOf(friend.group)].push(friend)
            }
        });
        var friendgroups = groups.map(function(friendgroup){
            var friends = friendgroup.map(function(friend){
                            return <Friend showOffline={showOffline} socket={socket}  whenClicked={whenClicked} user={friend} />;
                    });
            var theFriendGroup =    <div className='FriendGroup'>
                                        <p>{friendgroup.name}</p>
                                        {friends}
                                    </div>

            return theFriendGroup;
            });
        var theFriendsList =    <div className="FriendsList">
                                    {friendgroups}
                                </div>
        return theFriendsList;
    }
});


var GroupChat = React.createClass({
       getInitialState: function(){
        return {messages:this.props.messages,from:this.props.from,to:this.props.to,socket:this.props.socket};
    },componentDidMount: function(){
        // componentDidMount is called by react when the component
        // has been rendered on the page. We can set the interval here:
        var socket = this.state.socket;
        this.socket = socket;
        this.socket.on("new_message", this.newMessage);
        this.setState({scrollTotal:document.getElementById("messageList"+this.state.to).scrollHeight})
    },newMessage:function (data) {
            if(this.state.from === data.from){
                this.state.messages.push(data);
                if(data.whisper){
                    this.socket.emit("recieved", data);
                }
                this.setState({messages:this.state.messages});
                this.scrollHeight();
            }
    },sentMessage:function (data) {
        this.state.messages.push(data);
        this.setState({messages:this.state.messages});
        this.scrollHeight();
    },scrolled:function(evt){
        var messages = evt.nativeEvent.target;
        this.setState({scrolled:messages.scrollHeight - messages.scrollTop - this.state.scrollTotal > 1});
    },scrollHeight:function(){
        if(!this.state.scrolled){
            var messages = document.getElementById("messageList"+this.state.to);
            messages.scrollTop = messages.scrollHeight;
        }
    },handleGroupChat:function (evt) {
        evt.stopPropagation();
        var newMessage = this.newMessage;
        if (evt.keyCode === 13){
            this.socket.emit("new_message", {
                    from: this.state.from,
                    message: evt.nativeEvent.target.value,
                    to: this.state.to,
                    whisper:true
                },this.sentMessage);
            evt.nativeEvent.target.value = "";
        }
    },toggleHidden: function(){
        this.setState({hidden:!this.state.hidden});
    },close: function(evt){
        evt.currentTarget.parentNode.parentNode.parentNode.removeChild(evt.currentTarget.parentNode.parentNode)
    },render: function() {
        var theMessages = this.state.messages.map(function(data){
            if(data.from!="Mouse"){
                return (
                           <Message data={data}/>
                        )
            }
        });

        var theGroupChat = <div className="GroupChat">
                            <div className={"chat"+ (this.props.hidden ? " hidden":"") + (this.state.hidden ? " hidden":"")}>
                                <div className="messages" id={"messageList"+this.state.to} onScroll={this.scrolled}>
                                    {theMessages}
                                </div>
                                <input className="chatInput" onKeyDown={this.handleGroupChat}/>
                            </div>
                            <div className="chatTab" onClick={this.toggleHidden}>
                            <p>{this.state.to} {this.state.messages.length}</p>
                            <div className="chatExit" onClick={this.close}></div>
                            </div>
                        </div>;
        return theGroupChat;
        }
});


var MessageBoxGroup = React.createClass({
    getInitialState:function(){
        return {
            socket:this.props.socket,
            user:this.props.user
        };
    },switchChats:function(){

    },render: function() {
        var theSocket = this.props.socket;
        var newMessage = this.props.newMessage;
        var theUser = this.state.user;
        var chatThreadsNames = [];
        var chatThreads = [];
        this.props.messages.map(function(message){
            if(chatThreadsNames.indexOf(message.chatThread) >-1){
                chatThreads[chatThreadsNames.indexOf(message.chatThread)].messages.push(message);
            }else{
                chatThreadsNames.push(message.chatThread);
                chatThreads.push({messages:[message],name:message.chatThread, to:((message.to === theUser) ? message.from : message.to),closed:false});
            }
        });
        var messageBoxes = chatThreads.map(function(chatThread){
                                return  <MessageBox closed={chatThread.closed} newMessage={newMessage} messages={chatThread.messages} from={theUser} to={chatThread.to} socket={theSocket}/>
                                });
        var user = {
            username:this.state.user,
            status:'Whats up all?',
            icon: 'http://i.imgur.com/4fyudrX.png'
        };
        var theMessageBoxGroup =    <div className="MessageBoxGroup">
                                        {messageBoxes}
                                    </div>

        return theMessageBoxGroup;
    }
});

var ChatSystem = React.createClass({
    getInitialState:function(){
        return {
                socket:this.props.socket,
                messages:[],
                user:this.props.user,
                profile:this.props.profile,
                friends:this.props.user.friends
            };
    },componentDidMount:function(){
        this.state.socket.on("new_message", this.newMessage);
        this.state.socket.on('user_connected',this.personLoggedIn);
        this.state.socket.on('friend_list',this.friendsUpdate);
        this.state.socket.emit('get_chathistory','all',this.updateChatHistory);
    },newMessage:function (data) {
        this.state.messages.push(data);
        this.setState({messages:this.state.messages});
        this.render();
    },addFriend:function (evt) {
        evt.stopPropagation();
        if(evt.keyCode === 13 || !evt.keyCode){
            this.state.socket.emit('add_friend',{username:evt.nativeEvent.target.value},this.friendsUpdate);
            evt.nativeEvent.target.value = "";
        }
    },friendsUpdate:function(friends){
        this.setState({friends:friends});
    },handleFriendClick:function(user){
        user = user.username;
        var message={
            to:user,
            from:this.state.user.username,
            chatThread:[user,this.state.user.username].sort().toString(),
            message:this.state.user.username+' joined thread.',
            users:[user,this.state.user.username]
        };
        this.state.messages.push(message);
        this.setState({messages:this.state.messages});
    },updateFriend:function(profile){
        this.state.friends = this.state.friends.map(function(friend){
            if(friend.username===profile.username){
                friend.statusMessage = profile.statusMessage;
                friend.icon = profile.icon;
            }
            return friend;
        });
        this.setState({friends:this.state.friends});
    },toggleShowOffline:function(evt){
        this.setState({showOffline:evt.nativeEvent.target.checked});
    },updateStatus:function(evt){
        if(evt.nativeEvent.target.value !== '' && evt.nativeEvent.target.value !== this.state.profile.statusMessage){
            this.state.socket.emit('update_status',{username:this.state.profile.username,statusMessage:evt.nativeEvent.target.value || 'Online',icon:this.state.profile.icon},this.gotStatus);
            evt.nativeEvent.target.value = '';
        }
    },gotStatus:function(profile){
        this.setState({profile:profile});
    },updateChatHistory:function(chatHistory){
        this.setState({messages:chatHistory});
    },render: function() {
        var theChatSystem =    <div className="ChatSystem">
                                        <div className="LoggedinUser">
                                            <img style={{height:'2em',width:'2em'}}src={this.state.profile.icon}/>
                                            <div>
                                                <div style={{display:'flex',justifyContent: 'space-between'}}>
                                                    <p>{this.state.profile.username}</p>
                                                    <svg fill={this.state.profile.presence ? "green":"red"} xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 8 8">
                                                      <path d="M3 0v4h1v-4h-1zm-1.28 1.44l-.38.31c-.81.64-1.34 1.64-1.34 2.75 0 1.93 1.57 3.5 3.5 3.5s3.5-1.57 3.5-3.5c0-1.11-.53-2.11-1.34-2.75l-.38-.31-.63.78.38.31c.58.46.97 1.17.97 1.97 0 1.39-1.11 2.5-2.5 2.5s-2.5-1.11-2.5-2.5c0-.8.36-1.51.94-1.97l.41-.31-.63-.78z"
                                                      />
                                                    </svg>
                                                </div>
                                                <input type="text" className="statusInput" placeholder={this.state.profile.statusMessage} onBlur={this.updateStatus}/>
                                            </div>
                                            <input type="checkbox" onChange={this.toggleShowOffline}/>
                                        </div>
                                        <FriendsList showOffline={this.state.showOffline} socket={this.state.socket} user={this.state.user} friends={this.state.friends} currentChats={this.state.currentChats} whenClicked={this.handleFriendClick}/>
                                        <div className="AddFriend">
                                            <input className="statusInput" type="text" placeholder="Add Friend" onBlur={this.addFriend} onKeyDown={this.addFriend}/>
                                        </div>
                                        <MessageBoxGroup newMessage={this.newMessage} user={this.state.user.username} messages={this.state.messages} socket={this.props.socket}/>
                                </div>
        return theChatSystem;
    }
});

var user = prompt("Who are you?",'james');
var pass = prompt("Password?",'password');
var socket = io.connect();
var afterLogin = function(user,profile,chathistory){
    if(user){
        React.render(
            <ChatSystem socket={socket} user={user} profile={profile}/>,
            document.getElementById("chat_Container")
        );
    }else{
        var user = prompt("Really who are you?");
        var pass = prompt("Password?");
        socket.emit("login", {username:user,password:pass},afterLogin);
    }
}
socket.emit("login", {username:user,password:pass},afterLogin);
