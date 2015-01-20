var Message = React.createClass({
    whisperTo:function(){
        alert("Replied");
    },render: function(){
        var theMessage =    <div className={"Message " + ((this.props.data.from !== this.props.username) ? "toMe ":"fromMe ") }>
                                [{this.props.data.timeStamp?this.props.data.timeStamp.substring(11,19):''}] {this.props.data.from} : {this.props.data.message}
                                <div>
                                    <svg className="icon" viewBox="0 0 8 8" onClick={this.whisperTo}>
                                      <path d="M3 0v3h-3v2h3v3h2v-3h3v-2h-3v-3h-2z" />
                                    </svg>
                                </div>
                            </div>

        return theMessage;
    }
});

var LoginPrompt = React.createClass({
    clicked:function(evt){
        var username = evt.currentTarget.parentNode.parentElement.children[0].value;
        var password = evt.currentTarget.parentNode.parentElement.children[1].value;
        var user = {username:username,password:password};
        if(!(user.username || user.password)){
            user.username = 'test';
            user.password = 'password';
        }
        evt.currentTarget.parentNode.parentElement.children[0].value = '';
        evt.currentTarget.parentNode.parentElement.children[1].value = ''
        this.props.socket.emit("login", user ,this.afterLogin);
    },afterLogin: function(user){
        if(user){
            React.render(
                <ChatSystem socket={this.props.socket} profile={user.profile} user={user}/>,
                document.getElementById("chat_Container")
            );
            React.unmountComponentAtNode(this.getDOMNode().parentNode);
        }
    },render: function(){
        var theMessage =    <div className="LoginPrompt trueCenter">
                                    <div className="prompt">
                                        <input type="text" placeholder="Who are you?" autoFocus/>
                                        <input type="password" placeholder="Password?"/>
                                        <div className="flex">
                                            <div className="flex1"></div>
                                            <input type="button" value="Login" onClick={this.clicked} className="flex2"/>
                                            <div className="flex1"></div>
                                        </div>
                                    </div>
                            </div>

        return theMessage;
    }
});

var MessageBox = React.createClass({
    getInitialState:function(){
        return {};
    },
    componentDidMount: function(){
        // componentDidMount is called by react when the component
        // has been rendered on the page. We can set the interval here:
        this.setState({scrollTotal:document.getElementById("messageList"+this.props.chatThread.name).scrollHeight})
    },sentMessage:function (data) {
        this.props.newMessage(data);
        this.scrollHeight();
    },scrolled:function(evt){
        var messages = evt.nativeEvent.target;
        this.setState({scrolled:messages.scrollHeight - messages.scrollTop - this.state.scrollTotal > 1});
    },scrollHeight:function(){
        if(!this.state.scrolled){
            var messages = document.getElementById("messageList"+this.props.chatThread.name);
            messages.scrollTop = messages.scrollHeight;
        }
    },sendTheMessage:function (evt) {
        evt.stopPropagation();
        if (evt.keyCode === 13){
            this.props.socket.emit("new_message", {
                    from: this.props.from.username,
                    message: evt.nativeEvent.target.value,
                    to: this.props.chatThread.users.map(function(user){return user._id;}),
                    whisper:true
                },this.sentMessage);
            evt.nativeEvent.target.value = "";
        }
    },close: function(evt){
        evt.stopPropagation();
        this.props.closeThread(this.props.chatThread.name);
    },makeActive: function(){
        this.props.makeActive(this.props.chatThread.name);
    },render: function() {
        var currentUser = this.props.from;
        var theMessages = this.props.chatThread.messages.map(function(message){
                return (
                           <Message username={currentUser.username} data={message}/>
                        )
        });

        var theMessageBox = <div className={"MessageBox" + (this.props.open ? "":" hidden")}>
                            <div className={"chat" + (this.props.active ? "":" hidden")}>
                                <div className="messages" id={"messageList"+this.props.chatThread.name} onScroll={this.scrolled}>
                                    {theMessages}
                                </div>
                                <input className="chatInput" onKeyDown={this.sendTheMessage}/>
                            </div>
                            <div className="chatTab" onClick={this.makeActive}>
                                <div className="flexBetween">
                                    <div>{this.props.chatThread.users.filter(function(user){return user._id!==currentUser._id }).map(function(user){return user.username;})}</div>
                                    <div>{this.props.chatThread.messages.length}</div>
                                </div>
                                <img src='http://i.imgur.com/agviQBF.png' className='chatExit' onClick={this.close}/>
                            </div>
                        </div>;
        return theMessageBox;
        }
});

var MessageBoxGroup = React.createClass({
    render: function() {
        var theSocket = this.props.socket;
        var newMessage = this.props.newMessage;
        var theUser = this.props.profile;
        closeThread = this.props.closeThread;
        makeActive = this.props.makeActive;
        activeChatThread = this.props.chatThreads.activeChatThread;
        openThreads = this.props.chatThreads.openThreads;
        var messageBoxes = this.props.chatThreads.threads.map(function(chatThread){
                                return  <MessageBox active={activeChatThread === chatThread.name} open={openThreads[chatThread.name]} makeActive={makeActive} closeThread={closeThread} newMessage={newMessage} from={theUser} chatThread={chatThread} socket={theSocket}/>
                                });
        var theMessageBoxGroup =    <div className="MessageBoxGroup">
                                        {messageBoxes}
                                    </div>

        return theMessageBoxGroup;
    }
});


var Friend = React.createClass({
    clicked:function(){
        if(this.props.whenClicked){
            this.props.whenClicked(this.props.friend);
        }
    },render: function() {

        var theFriend = <div className="Friend hidden">
                        </div>;
        if(this.props.friend && (this.props.friend.profile.presence > 0 && this.props.friend.friendStatus === 1 || this.props.showOffline)){
            var friend = this.props.friend;
            var friendIcon = (friend.friendStatus === 1 ? <img style={{height:'2em',width:'2em'}}src={friend.profile.icon}/>:'')
            theFriend =
                <div onClick={this.clicked} className={"Friend" + (friend.friendStatus === 1 ? '':' Offline') }>
                    {friendIcon}
                    <div className='flex2'>
                        <div className="flex between">
                            <div className="flex1">{friend.profile.username}</div>
                            <div className="flex flex1" style={{justifyContent:'center'}}>
                                <svg className='status' fill={friend.profile.presence > 0 && friend.friendStatus === 1 ? "green":"red"} xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 8 8">
                                  <path d="M3 0v4h1v-4h-1zm-1.28 1.44l-.38.31c-.81.64-1.34 1.64-1.34 2.75 0 1.93 1.57 3.5 3.5 3.5s3.5-1.57 3.5-3.5c0-1.11-.53-2.11-1.34-2.75l-.38-.31-.63.78.38.31c.58.46.97 1.17.97 1.97 0 1.39-1.11 2.5-2.5 2.5s-2.5-1.11-2.5-2.5c0-.8.36-1.51.94-1.97l.41-.31-.63-.78z"
                                  />
                                </svg>
                            </div>
                        </div>
                        <div className={friend.friendStatus === 1 ? 'flex': 'hidden'}>
                            <p>{friend.profile.statusMessage}</p>
                        </div>
                    </div>
                </div>;
        }
        return theFriend;
    }
});

var FriendsList = React.createClass({
    render: function() {

    //Make this take the new freindslist frome schemas js. Then make the list off of that.
        var whenClicked = this.props.whenClicked;
        var showOffline = this.props.showOffline;
        var socket = this.props.socket;
        var friendgroups = this.props.friendsList.friendGroups.map(function(friendgroup){
            var friends = friendgroup.friends.map(function(friend){
                            return <Friend showOffline={showOffline} socket={socket}  whenClicked={whenClicked} friend={friend} />;
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

var ChatSystem = React.createClass({
    getInitialState:function(){
        return {
                socket:this.props.socket,
                chatThreads:{
                    activeChatThread: '',
                    openThreads:{},
                    threads:[]
                },
                user:this.props.user,
                profile:this.props.profile
            };
    },componentDidMount:function(){
        this.state.socket.on("new_message", this.newMessage);
        this.state.socket.on("new_thread", this.addThread);
        this.state.socket.on('user_status_update',this.profileChanged);
        this.state.socket.on('friend_list',this.friendsUpdate);
        this.state.socket.on('notification',function(data){console.log(data)});
        var theSocket = this.props.socket;
        var id = this.state.profile._id;
        var fn = this.updateChatHistory;
        setTimeout(function(){theSocket.emit('get_chathistory',id,fn);},100);
    },newMessage:function (chatMessage) {
        var threadExists = false;
        var threadName = chatMessage.to.sort().toString();
        var updatedThreads = this.state.chatThreads.threads.map(function(thread){
            if(thread.name==threadName){
                thread.messages.push(chatMessage);
                threadExists = true;
            }
            return thread;
        });
        if(!threadExists){
            this.props.socket.emit('get_thread',threadName,this.addThread);
        }else{
            if(!this.state.chatThreads.openThreads[threadName]){
                this.makeActive(threadName);
            }
        }
        this.state.chatThreads.threads = updatedThreads;
        this.setState({chatThreads:this.state.chatThreads});
        this.render();
    },addThread:function(thread){
        this.state.chatThreads.threads.push(thread);
        this.setState({chatThreads:this.state.chatThreads});
        this.makeActive(thread.name);
    },sendFriendRequest:function (evt) {
        evt.stopPropagation();
        if(evt.keyCode === 13 || !evt.keyCode){
            if(evt.nativeEvent.target.value !== ""){
                this.state.socket.emit('send_FriendRequest',{
                    user:{ _id:this.state.user._id
                        },
                        friend:evt.nativeEvent.target.value
                    },this.friendsUpdate);
                evt.nativeEvent.target.value = "";
            }
        }
    },friendsUpdate:function(data){
        if(data.success){
            this.state.user.friendsList = friendsList;
            this.setState({user:this.state.user});
            this.render();
        }
    },profileChanged:function(profile){
        this.state.user.friendsList.friendGroups = this.state.user.friendsList.friendGroups.map(function(friendGroup){
            friendGroup.friends =  friendGroup.friends.map(function(friend){
                if(profile._id===friend.profile._id){
                    friend.profile = profile;
                }
                return friend;
            });
            return friendGroup;
        });
        this.setState({user:this.state.user});
        this.render();
    },openThread:function(friend){
        var threadName = [this.state.profile._id,friend.profile._id].sort().toString();
        this.state.chatThreads.activeChatThread = threadName;
        this.state.chatThreads.openThreads[threadName] = true;
        var threadExists = this.state.chatThreads.threads.filter(function(thread){
            return thread.name===threadName;
        }).length > 0;
        if(!threadExists){
            this.state.socket.emit("new_chatThread", {
                    users:  [this.state.profile._id,friend.profile._id],
                    name: threadName
                },this.addThread);
        }
        this.setState({chatThreads:this.state.chatThreads});
    },updateFriend:function(profile){
        this.state.user.friends = this.state.user.friends.map(function(friend){
            if(friend.profile.username===profile.username){
                friend.profile = profile;
            }
            return friend;
        });
        this.setState({user:this.state.user});
    },toggleShowOffline:function(evt){
        this.setState({showOffline:evt.nativeEvent.target.checked});
    },updateStatus:function(evt){
        if(evt.nativeEvent.target.value !== '' && evt.nativeEvent.target.value !== this.state.profile.statusMessage){
            this.state.socket.emit('update_status',{username:this.state.profile.username,statusMessage:evt.nativeEvent.target.value},this.gotProfile);
            evt.nativeEvent.target.value = '';
        }
    },gotProfile:function(profile){
        this.setState({profile:profile});

    },makeActive:function(threadName){
        this.state.chatThreads.openThreads[threadName] = true;
        this.state.chatThreads.activeChatThread = threadName !== this.state.chatThreads.activeChatThread ? threadName: '' ;
        this.setState({chatThreads:this.state.chatThreads});
    },closeThread:function(threadName){
        this.state.chatThreads.openThreads[threadName] = false;
        this.setState({chatThreads:this.state.chatThreads});
    },updateChatHistory:function(chatHistory){
        this.state.chatThreads.threads = chatHistory;
        this.setState({chatThreads:this.state.chatThreads});
    },render: function() {
        console.log(this.state.user.notifications);
        var theChatSystem =    <div className="ChatSystem">
                                        <div className="LoggedinUser">
                                            <img lassName="flex1" style={{height:'2em',width:'2em'}}src={this.state.profile.icon}/>
                                            <div className="flex2">
                                                <div className="flex between">
                                                    <p>{this.state.profile.username}</p>
                                                    <svg fill={this.state.profile.presence ? "green":"red"} xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 8 8">
                                                      <path d="M3 0v4h1v-4h-1zm-1.28 1.44l-.38.31c-.81.64-1.34 1.64-1.34 2.75 0 1.93 1.57 3.5 3.5 3.5s3.5-1.57 3.5-3.5c0-1.11-.53-2.11-1.34-2.75l-.38-.31-.63.78.38.31c.58.46.97 1.17.97 1.97 0 1.39-1.11 2.5-2.5 2.5s-2.5-1.11-2.5-2.5c0-.8.36-1.51.94-1.97l.41-.31-.63-.78z"
                                                      />
                                                    </svg>
                                                </div>
                                                <div className="flex">
                                                    <input type="text" className="statusInput" placeholder={this.state.profile.statusMessage} onBlur={this.updateStatus} onKeyDown={this.updateStatus}/>
                                                    <input type="checkbox" onChange={this.toggleShowOffline}/>
                                                </div>
                                            </div>
                                        </div>
                                        <FriendsList showOffline={this.state.showOffline} socket={this.state.socket} user={this.state.user} friendsList={this.state.user.friendsList} whenClicked={this.openThread}/>
                                        <div className="AddFriend">
                                            <input className="statusInput" type="text" placeholder="Add Friend" onBlur={this.sendFriendRequest} onKeyDown={this.sendFriendRequest}/>
                                        </div>
                                        <MessageBoxGroup newMessage={this.newMessage} makeActive={this.makeActive} closeThread={this.closeThread} profile={this.state.profile} chatThreads={this.state.chatThreads} socket={this.props.socket}/>
                                </div>
        return theChatSystem;
    }
});

var socket = io.connect();
socket.on('log',function(data){console.log(data);});

React.render(
            <LoginPrompt socket={socket}/>,
            document.getElementById("prompt")
);

var Notification = React.createClass({
    accept:function(){
        console.log(this.props.data);
    },decline:function(){

    },render: function(){
        var theMessage =    <div className="Notification">
                            <div className="Notification Header"> {this.props.data.notificationType}</div>
                            <div className="Notification Message"> {this.props.data.message}</div>
                                <div className={"Notification Input" + (this.props.data.notificationType === 'Friend Request' ? '':' hidden')}>
                                    <svg viewBox="0 0 8 8" className="icon" alt="Circle Check" onClick={this.accept}>
                                        <path d="M4 0c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm2 1.781l.719.719-3.219 3.219-1.719-1.719.719-.719 1 1 2.5-2.5z"></path>
                                    </svg>
                                    <svg viewBox="0 0 8 8" className="icon" alt="Circle X" onClick={this.decline}>
                                        <path d="M4 0c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm-1.5 1.781l1.5 1.5 1.5-1.5.719.719-1.5 1.5 1.5 1.5-.719.719-1.5-1.5-1.5 1.5-.719-.719 1.5-1.5-1.5-1.5.719-.719z"></path>
                                    </svg>
                                </div>
                            </div>

        return theMessage;
    }
});
