/*
    Made by: Roman Rey and Sergi Sorigue.
    UPF 2018

    Server using websockets and redis, database part coded using promises
*/

var messageList = []
var syncList = []

function Server() {
    var server = require('http').createServer();
    var WebSocket = require('ws');
    var redis = require("redis"), client = redis.createClient();
    var Util = require('./Util.js');
    var Combinator = require('./Combinator.js');
    Combinator = Combinator.COMBINATOR;
    var DataBase = require('./DataBase.js');
    var port = 60696;
    var users = {};
    var connectionID = 0;
    var messageID = 0;
    var activeUsers = 0;

    // Time to check for keys expired in redis
    var timeGetKey = 4000
    // Time for a new-msg to expire in seconds
    var expireTime = 60

    var wss = new WebSocket.Server({ server: server });


    // At startup retrieve from database existing messages
    DataBase.getInfo(client,syncList,messageList,messageID,users);
    // Load the name Combinator
    Util.initCombinator(Combinator)


    wss.on('connection', function connection(socket) {
        // Create and assign one id to one user
        createUser(socket);
        sendInitialData(socket);

        // On message received we decide what to do
        socket.on('message', function (message) {
            try {
                var info = JSON.parse(message);
            } catch (e) {
              console.log("Invalid JSON: ", message.data);
              return;
            }
            switch(info.type) {
                // A message from a client arrives
                case "new-msg":
                    handleNewMessage(info);
                    break;
                case "new-reply":
                    handleReplyMessage(info);
                    break;
                case "request-init-data":
                    sendInitialData(info);
                    break;
                case "user-count":
                    sendActiveUsers(activeUsers);
                default:
                    break;
            }
        });

        socket.on('close', function (message) {
            console.log("User disconnected: ", users[socket.id].id);
            delete users[socket.id]
            activeUsers = activeUsers - 1;
            sendActiveUsers(activeUsers);
        });

        // Create a new user on the server
        function createUser (socket) {
            socket.id = connectionID ++;
            var user = socket     //new User(socket.id);
            users[socket.id] = user;
            if(!(connectionID%50)) {
                Combinator.reset();
            }
            activeUsers = activeUsers + 1;
            console.log("User connected: ", user.id);
            sendActiveUsers(activeUsers);
        }

        // Send the new message to connected clients and upload to database
        function handleNewMessage(info) {
            var newMsgId = messageID ++;
            // Key for redis: MegaApp:id:author:dateOfPublication:first | value
            var dbKey = DataBase.createRedisKey(users,socket,info,newMsgId,"new-msg",info.content.title)
            // Save the message to our database
            DataBase.saveToRedis(dbKey,info.content.message,expireTime,client)

            // Save to local server array and send the message to all connected clients
            Util.replyBroadcast(info.type,info.content,socket,newMsgId,users,messageList,dbKey)

        }
        // Send the new reply to connected clients and upload to database
        function handleReplyMessage(info) {
            // Get the root ID
            var rootId = info.content.msgId;

            // Key for redis: MegaApp:id:author:dateOfPublication:first | value
            var dbKey = DataBase.createRedisReplyKey(users,socket,info,rootId,"new-reply")

            // Save the message to our database
            DataBase.saveToRedis(dbKey,info.content.message,expireTime,client)

            // Save to local server array and send the message to all connected clients
            Util.replyBroadcast(info.type,info.content,socket,rootId,users,messageList,dbKey)
        }

        // Send existing info to a new connected client
        function sendInitialData(socket) {
            try {
                // Send the initial data to a new connected client
                var msgToReturn = []
                for(var cosa in messageList) {
                    if(messageList[cosa] != undefined && messageList[cosa] != null) {
                        msgToReturn.push(messageList[cosa]);
                    }
                }
                var postData = {type: 'init-data', content: {msgs: msgToReturn ,authorId: socket.id, combination: Combinator.getCombination()}}
                var retornar = JSON.stringify(postData);
                users[socket.id].send(retornar);

            } catch(e) {
                console.log("Can't send newMessage: ", e.data);
                return;
            }
        }
        function sendActiveUsers(activeUsers) {
          try {
              // Send the active users to all clients clients
              var postData = {type: 'user-count', content: {activeUsers: activeUsers}}
              var retornar = JSON.stringify(postData);
              for (var user in users) {
                  users[user].send(retornar);
              }

          } catch(e) {
              console.log("Can't send activeUser data: ", e.data);
              return;
          }
        }
    });

    // Gets info from database, updates the msg array and deletes the ones that expired
    function Synchronize() {
        // Get existing messages from redis and save to messageList
        DataBase.getInfo(client,syncList,messageList,messageID,users);
    }

    setInterval(function() {
      Synchronize();
    }, timeGetKey);


    server.listen(port, function(err) {
      if (err) {
        return console.log('something bad happened', err)
      }
      console.log("server is listening on " + port)
    })
}
module.exports = Server;

// TODO: agafar maxId al reconectar
