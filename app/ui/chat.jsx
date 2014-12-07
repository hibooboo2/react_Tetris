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
        evt.currentTarget.parentNode.parentNode.parentNode.removeChild(evt.currentTarget.parentNode.parentNode)
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
    render: function() {
        var theFriend = <div className="Friend">
                            <img style={{height:'2em',width:'2em'}}src={this.props.user.icon}/>
                            <div>
                                <p>{this.props.user.username}</p>
                                <p> {this.props.user.status}</p>
                            </div>
                        </div>;
        return theFriend;
    }
});

var FriendGroup = React.createClass({
    render: function() {
        var friends = this.props.friends.map(function(friend){
            console.log(friend);
            return <Friend user={friend} />;
            });
        var theFriendGroup =    <div className="FriendGroup">
                                    {friends}
                                </div>
        return theFriendGroup;
    }
});

var FriendsList = React.createClass({
    render: function() {
        var friendgroups = this.props.friendLists.map(function(friendgroup){
            return <FriendGroup friends={friendgroup} />;
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
        console.log("Hidden");
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
        var user = prompt("Who are you?");
        var pass = prompt("Password?");
        return {socket:io.connect("http://localhost:3000"), currentChats:['james','Bob'], user:user,password:pass};
    },componentDidMount:function(){
        this.state.socket.emit("login", {username:this.state.user,password:this.state.password});
    },render: function() {
        var theChatSystem =    <div className="ChatSystem">
                                        <FriendsList user={this.state.user} friendLists={[[{username:'Kreious',status:'Play anyone?',icon:'http://i.imgur.com/GKpgcNq.png'},{username:'SaucySeadweller',status:'In Que',icon:'http://i.imgur.com/GKpgcNq.png'}]]}/>
                                        <MessageBoxGroup currentChats={this.state.currentChats} socket={this.state.socket}/>
                                </div>
        return theChatSystem;
    }
});

React.render(
  <ChatSystem />,
  document.getElementById("main_Container")
);
