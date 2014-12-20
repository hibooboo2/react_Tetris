# WebSocket Events
The following is a list of the websocket events that are being used and defined in server.js and within chat.jsx.

## Server.js socket.on
* get_thread
    * This is called to retrieve a specific chat thread and send it to the client via call
    back.
    * The thread is retrieved form the db and then sent back.
* new_chatThread
    * this is called when a new chat thread is made by a user.
    * the thread is created and then sent to all relevant users.
    * This allows the starting of new chats.
* new_message
    * This is called when a new message is made.
    * First a time stamp is added to the message. Then the message is sent to all relevant
    people.
    * Then the db is searched for the revelant chat thread, if it exists then the message is
    then created in db and saved.
    * The message is then sent to the sender.
* update_status
    * A status is updated on users profile and then the friends are sent the status of that
    profile.
* send_FriendRequest
    * Creates a friend request. This should add the friend to the users friends list. Not show
    presence. This should then sent the other user a request to be friend.
    * This is done with a notification of type friend request.
* decline_FriendRequest
    * This will delete the notification from the current user and do nothing more. It does not
    notify the user who added then that they declined.
* accept_FriendRequest
    * This will make the two users friends, allowing them to see eachothers online presence and
    quickly message eachother via the chat gui.
* get_profile
    * This takes a profile id and returns the associated profile.
* get_chathistory
    * This takes a profile Id and returns its accociated chat threads. And consequently all of
    their messages.


## Chat.jsx socket.on
* new_message
    * Adds the message to its thread. This allows iming to occur with out sending entire therad
    or chat history
    every time, this makes it faster and use less bandwith. Upon first connection it gets
    entire chat history via a different method.
* new_thread
    * Adds the recieved thread to the chat history that the client has. This is used when
    someone sends the user a chat message for the first time, or a new group chat is started
    that hasn't existed before.
* user_status_update
    * This takes a given profile for a friend and replaces it with the new one on the client.
* friend_list
    * Replaces the friends list with the new one.
* notification
    * adds the notification to the list of notifications which are displayed.
