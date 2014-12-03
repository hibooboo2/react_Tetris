
var ChatBox = React.createClass({
    getInitialState: function(){
        return {messages:window.localStorage.messages!==undefined ? JSON.parse(window.localStorage.messages):[]};
    },componentDidMount: function(){
        // componentDidMount is called by react when the component
        // has been rendered on the page. We can set the interval here:
        var socket = io.connect();
        this.socket = socket;
        //var name = window.localStorage.name ? window.localStorage.name :    prompt("What is your name?");
        var sendMessageButton = document.getElementById("sendMessage");
        this.state.name = prompt("What is your name?");
        window.localStorage.name =  name;
        sendMessageButton.onclick = this.sendMessage;
        this.socket.on('new message', this.newMessage);
        sendMessage = this.sendMessage;
        messageBox.onkeydown = function (evt) {
            if (evt.keyCode === 13){
                sendMessage();
            }
        };
        this.socket.emit("login", {name: name});
        this.setState({name:this.state.name,socket:socket});
    },newMessage:function (data) {
            this.state.messages.push(data.message);
            window.localStorage.messages = JSON.stringify(this.state.messages);
            this.socket.emit("recieved", data);
            this.setState({messages:this.state.messages});
    },sendMessage: function(){
        var messageBox = document.getElementById("messageBox");
        if(messageBox.value !== ""){
        this.socket.emit("send message", {
                from: this.state.name,
                message: messageBox.value,
                to: ""
            });
        messageBox.value = "";
        }
    },whisperMessage: function(){
        var messageBox = document.getElementById("messageBox");
        if(messageBox.value !== ""){
        this.socket.emit("send message", {
                from: this.state.name,
                message: messageBox.value,
                to: ""
            });
        messageBox.value = "";
        }
    },
    render: function() {
        var theMessages = this.state.messages.map(function(message){
            return (
                        <p>
                        {message}
                        </p>
                    )
        });
        var theChatBox = <div className="ChatBox">
                            <div className="messages">
                                {theMessages}
                            </div>
                            <input id="messageBox"></input>
                            <button id="sendMessage">Send Message</button>
                        </div>;
            return theChatBox;
        }
});


var FriendsList = React.createClass({
    render: function() {
        return theFriendsList;
    }
});

var Friend = React.createClass({
    render: function() {
        return theFriends;
    }
});

var Message = React.createClass({
    render: function() {
        return theMessage;
    }
});

var FriendGroup = React.createClass({
    render: function() {
        return theFriendGroup;
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
        this.socket.on('new_message', this.newWhisperedMessage);
        this.socket.emit("login", {name: this.state.from});
        this.setState({scrollTotal:document.getElementById("messageList"+this.state.to).scrollHeight})
    },newWhisperedMessage:function (data) {
            this.state.messages.push(data);
            window.localStorage.messages = JSON.stringify(this.state.messages);
            if(data.whisper){
                this.socket.emit('recieved', data);
            }
            this.setState({messages:this.state.messages});
            this.scrollHeight();
    },scrolled:function(evt){
        var messages = evt.nativeEvent.target;
        this.setState({scrolled:messages.scrollHeight - messages.scrollTop - this.state.scrollTotal > 1});
    },scrollHeight:function(){
        console.log(this.state.scrolled);
        if(!this.state.scrolled){
            var messages = document.getElementById("messageList"+this.state.to);
            messages.scrollTop = messages.scrollHeight;
        }
    },handleMessageBox:function (evt) {
        evt.stopPropagation();
        if (evt.keyCode === 13){
           this.socket.emit('new_message', {
                    from: this.state.from,
                    message: evt.nativeEvent.target.value,
                    to: this.state.to,
                    whisper:false
                });
            evt.nativeEvent.target.value = "";
        }
    },toggleHidden: function(){
        this.setState({hidden:!this.state.hidden});
    },close: function(evt){
        evt.preventDefault();
        evt.stopPropagation();
        evt.currentTarget.parentNode.parentNode.parentNode.removeChild(evt.currentTarget.parentNode.parentNode)
    },render: function() {
        var theMessages = this.state.messages.map(function(data){
            return (
                        <p>
                        {data.timeStamp + data.from + ": " + data.message}
                        </p>
                    )
        });

        var theChatBox = <div className="MessageBox">
                            <div className={"chat"+ (this.state.hidden ? " hidden":"")}>
                                <div className="messages" id={"messageList"+this.state.to} onScroll={this.scrolled}>
                                    {theMessages}
                                </div>
                                <input className="chatInput" onKeyDown={this.handleMessageBox}/>
                            </div>
                            <div className="chatTab" onClick={this.toggleHidden}>
                            <p>{this.state.to}</p>
                            <div className="chatExit" onClick={this.close}></div>
                            </div>
                        </div>;
        return theChatBox;
        }

});

React.render(
  <MessageBox messages={[]} from={prompt("from??")} to={prompt("to??")} socket={io.connect()}/>,
  document.getElementById('main_Container')
);
