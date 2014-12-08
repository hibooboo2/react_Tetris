var Message = React.createClass({
    whisperTo:function(){
        alert("Replied");
    },render: function(){
        var theMessage =    <div className="Message">
                                [ {this.props.data.timeStamp.substring(11,19)} ] {this.props.data.from} : {this.props.data.message}
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
        var socket = this.state.socket;
        this.socket = socket;
        this.socket.on("new_message", this.newMessage);
        this.setState({scrollTotal:document.getElementById("messageList"+this.state.to).scrollHeight})
    },newMessage:function (data) {
            console.log(data);
            console.log(this.state.from + data.to + this.state.to + data.from);
            if(this.state.from === data.to && this.state.to === data.from){
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
    },handleMessageBox:function (evt) {
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

    },render: function() {
        var theMessages = this.state.messages.map(function(data){
            if(data.from!="Mouse"){
                return (
                           <Message data={data}/>
                        )
            }
        });

        var theMessageBox = <div className="MessageBox">
                            <div className={"chat"+ (this.props.hidden ? " hidden":"") + (this.state.hidden ? " hidden":"")}>
                                <div className="messages" id={"messageList"+this.state.to} onScroll={this.scrolled}>
                                    {theMessages}
                                </div>
                                <input className="chatInput" onKeyDown={this.handleMessageBox}/>
                            </div>
                            <div className="chatTab" onClick={this.toggleHidden}>
                            <p>{this.state.to} {this.state.messages.length}</p>
                            <div className="chatExit" onClick={this.close}></div>
                            </div>
                        </div>;
        return theMessageBox;
        }
});

var Friend = React.createClass({
    clicked:function(){
        this.props.whenClicked(this.props.user);
    },render: function() {
        var theFriend = <div onClick={this.clicked} className="Friend">
                            <img style={{height:'2em',width:'2em'}}src={this.props.user.icon}/>
                            <div>
                                <p>{this.props.user.username}</p>
                                <p> {this.props.user.status}</p>
                            </div>
                        </div>;
        return theFriend;
    }
});

var FriendsList = React.createClass({
    render: function() {
        var whenClicked = this.props.whenClicked;
        var friendgroups = this.props.friends.map(function(friendgroup){
            var friends = friendgroup.map(function(friend){
                        return <Friend whenClicked={whenClicked} user={friend} />;
                    });
            var theFriendGroup =    <div className='FriendGroup'>
                                        <p>All Friends</p>
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
        var theSocket = this.state.socket;
        var theUser = this.state.user;
        var messageBoxes = this.props.currentChats.map(function(chat){
                                return  <MessageBox messages={[]} from={theUser} to={chat} socket={theSocket}/>

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
                currentChats:[],
                user:this.props.username,
                friends:[[]]
            };
    },componentDidMount:function(){
        this.props.socket.on('user_connected',this.personLoggedIn);
    },personLoggedIn:function(user){
        this.state.friends[0].push({username:user});
        this.setState({friends:this.state.friends});
    },addFriend:function (evt) {
        evt.stopPropagation();
        var newMessage = this.newMessage;
        if (evt.keyCode === 13){
            this.state.socket.emit("new_message", {
                    from: this.state.user,
                    message: this.state.user + " would like to add you as a friend.",
                    to: this.state.to,
                    whisper:false
                });
            this.state.friends[0].push({username:evt.nativeEvent.target.value,status:'In que',icon:'http://i.imgur.com/GKpgcNq.png'});
            this.setState({friends:this.state.friends});
            evt.nativeEvent.target.value = "";
        }
    },handleFriendClick:function(user){
        this.state.currentChats.push(user.username);
        this.setState({currentChats:this.state.currentChats});
    },render: function() {
        var theChatSystem =    <div className="ChatSystem">
                                        <div className="LoggedinUser">
                                        <Friend whenClicked={this.handleFriendClick} user={{username:this.state.user,status:'Not sure',icon:'http://i.imgur.com/GKpgcNq.png'}} />
                                        </div>
                                        <FriendsList user={this.state.user} friends={this.state.friends} currentChats={this.state.currentChats} whenClicked={this.handleFriendClick}/>
                                        <div className="AddFriend">
                                            <input type="text" placeholder="Add Friend" onKeyDown={this.addFriend}/>
                                        </div>
                                        <MessageBoxGroup user={this.state.user} currentChats={this.state.currentChats} socket={this.props.socket}/>
                                </div>
        return theChatSystem;
    }
});

var user = prompt("Who are you?",'james');
var pass = prompt("Password?",'password');
var socket = io.connect();
var afterLogin = function(user){
    if(user){
        React.render(
            <ChatSystem socket={socket} username={user.username}/>,
            document.getElementById("main_Container")
        );
    }else{
        var user = prompt("Really who are you?");
        var pass = prompt("Password?");
        socket.emit("login", {username:user,password:pass},afterLogin);
    }
}
socket.emit("login", {username:user,password:pass},afterLogin);
