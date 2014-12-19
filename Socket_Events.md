# WebSocket Events
The following is a list of the websocket events that are being used and defined in server.js and within chat.jsx.

## Server.js socket.on
* get_thread
    * This is called to retrieve a specific chat thread and send it to the client via call back.
    * The thread is retrieved form the db and then sent back.
* new_chatThread
    * this is called when a new chat thread is made by a user.
    * the thread is created and then sent to all relevant users.
    * This allows the starting of new chats.
* new_message
    * This is called when a new message is made.
    * First a time stamp is added to the message. Then the message is sent to all relevant people.
    * Then the db is searched for the revelant chat thread, if it exists then the message is then created in db and saved.
    * The message is then sent to the sender.
* update_status
* all_online
* send_FriendRequest
* decline_FriendRequest
* accept_FriendRequest
* get_profile
* get_chathistory


## Chat.jsx socket.on
* new_message
* new_thread
* still_connected
* user_status_update
* friend_list
* friend_request
