var Util = require('./Util.js');

// Variables for getting info on redis keys
global.posTipus = 1
global.posMsgId = 2
global.posReplierId = 3
global.posAuthor = 4
global.posHour = 5
global.posMinute = 6
global.posSecond = 7
global.posLng = 9
global.posLat = 10
global.posTitle = 11

module.exports = class DataBase {

    // Get info from database. In case of server downtime, it is called on start.
    // Updates the messageList array from server with contents of LIVING messages in the database.
    // This function uses promises and controls the expired messages on the server
    // and synchronizes the message lists.
    static getInfo(client,databaseInfo,messageList,messageCounter,users) {
        var newMsgKey = [];  // Contains keys of new-msg
        var replyMsgKey = []; // Contains keys of reply-msg
        var newMsgContent = []; // Contains the json string of new-msgs
        var replyMsgContent = []; // Contains the json string of reply-msgs
        try {
          // Promises to get the keys, parse the info and the content async
          DataBase.getNewMsgAsync(client,newMsgKey).then(function() {
              DataBase.getReplyMsgAsync(client,replyMsgKey).then(function() {
                  DataBase.getContentAsync(client,newMsgKey,newMsgContent).then(function() {
                      DataBase.getContentAsync(client,replyMsgKey,replyMsgContent).then(function() {
                          DataBase.synchronizeLists(newMsgContent,replyMsgContent,databaseInfo).then(function() {
                              DataBase.checkExpiredMessages(messageList,databaseInfo,messageCounter,users).then(function() {
                              });
                          });
                      });
                  });
              });
          });
        } catch(err) {}

    }

    //  Gets newMsgAsync keys and saves them to a list
    static async getNewMsgAsync(client,keyList) {
        var keys = await DataBase.getNewAsync(client, keyList);
        await DataBase.saveToList(keys,keyList);
    }
    //  Gets replyMsgAsync keys and saves them to a list
    static async getReplyMsgAsync(client,keyList) {
        var keys = await DataBase.getReplyAsync(client, keyList);
        await DataBase.saveToList(keys,keyList);
    }

    // Get newMsg keys
    static getNewAsync(client,keyList) {
        return new Promise( function(resolve, fail){
            client.keys("MegaApp:new-msg:*", function(err,keys) {
                if (!err) resolve(keys);
                else fail(error);
            });
        });
    }

    // Get reply keys
    static getReplyAsync(client,keyList) {
        return new Promise( function(resolve, fail){
            client.keys("MegaApp:new-reply:*", function(err,keys) {
                if (!err) resolve(keys);
                else fail(error);
            });
        });
    }

    // Save the contents to a new list
    static saveToList(keys,keyList) {
        return new Promise( function(resolve,fail) {
            for (var i = 0; i < keys.length; ++i) {
                if(!keyList.includes(keys[i])) {
                    var fields = keys[i].split(':');
                    var tipus = fields[posTipus];
                    var msgId = fields[posMsgId];

                    if(tipus == 'new-msg') {
                        // New msg is identified with its ID
                        keyList[msgId] = keys[i];
                    }

                    if(tipus == 'new-reply') {
                        // New reply is identified with its timestamp
                        var timeStamp = fields[8];

                        keyList[i] = keys[i]
                    }
                }
            }
            resolve(keyList);
        });
    }

    // Gets the content of a keyList and saves it to a msgList
    static async getContentAsync(client,keyList,msgList) {
        var replies;
        if(keyList.length > 0) {
            replies = await DataBase.getValuesFromDataBaseAsync(client,keyList);
            await DataBase.parseValuesFromDatabase(replies,keyList,msgList);

        }
    }

    // Function that receives a list of newMsgs and a list of replyMsgs,
    // The third argument is updated so that it contains newMsgs + replyMsgs
    // They are ordered by timestamp
    static async synchronizeLists(newMsgs, replyMsgs, databaseInfo) {
        var orderedReplies = [[]];

        // First we order the replies based on their timestamps and ID.
        for (var reply in replyMsgs) {
            var rootId = replyMsgs[reply].content.msgId;
            var timestamp = replyMsgs[reply].content.timeStamp;

            // If the rootId does not exist we push it as a new list
            if(orderedReplies[rootId] == null) orderedReplies[rootId] = [timestamp]//;.push([rootId])
            // Otherwise we just push the timestamp
            else orderedReplies[rootId].push(timestamp);

        }

        // Then we add the replies to the array of newMsg
        for (var replyparentId in orderedReplies) {
            // Replies are ordered using timestamp index.
            orderedReplies[replyparentId].sort();

            for (var id in orderedReplies[replyparentId]) {
                // Replies are pushed into the corresponding newMsg list ordered by timestamp
                newMsgs[replyparentId].content.replies.push(replyMsgs[orderedReplies[replyparentId][id]].content)
            }
        }
        // The result is copied in the destination array
        databaseInfo.push.apply(databaseInfo, newMsgs);
    }

    // Function to check if there are deleted messages and send the ids to connected clients
    static async checkExpiredMessages(oldList,newList,messageCounter,users) {
        var expiredIds = [];
        for(var id in oldList) {
            if(oldList[id] != undefined && newList[id] == undefined) {
                expiredIds.push(id);
            }
        }
        if(newList.length) messageCounter = newList.length;
        if(expiredIds.length > 0) {
            Util.deleteBroadcast('delete-msg',expiredIds,users);
        }
        oldList.length = 0;
        oldList.push.apply(oldList, newList);
        newList.length = 0;
    }

    // Function to get the values of a keyList
    static getValuesFromDataBaseAsync(client,keyList) {
        return new Promise( function(resolve,fail) {
              client.mget(keyList, function(err,reply) {
                  if(!err) {
                    resolve(reply);
                  }
                  else fail(err);
              });
        });
    }

    // Function to parse the values retrieved from redis as we want
    static async parseValuesFromDatabase(replies,keyList,msgList) {
        return new Promise( function(resolve,fail) {
            for(var i = 0; i < keyList.length; ++i) {
                if(keyList[i] != null) {
                    var fields = keyList[i].split(':');
                    var tipus = fields[posTipus]
                    var author = fields[posAuthor]
                    var msgId = fields[posMsgId]
                    var title = ""
                    var replierId = fields[posReplierId]

                    // If we have a title, we take it into account
                    if(fields[posTitle]) title = fields[posTitle]

                    // If msg type is new-msg and not in the server array, we push it
                    if(tipus == 'new-msg') {
                        if(!msgList.includes(msgId)) {
                            var color = fields[8];
                            var lng = fields[posLng]
                            var lat = fields[posLat]
                            var json = Util.generateJsonFull(tipus,author,color,title,replies[i],msgId,lng,lat);
                            msgList[msgId] = (json);
                        }
                    }
                    // TODO
                    else if(tipus == 'new-reply') {
                        var dateTime = fields[posHour]+":"+fields[posMinute]+":"+fields[posSecond];
                        var timeStamp = fields[8];
                        var color = fields[9]
                        var json = Util.generateReplyJsonFull(tipus,author,color,replies[i],msgId,dateTime,timeStamp,replierId)
                        msgList[timeStamp] = (json);
                    }
                }

            }
            resolve(true);
        });
    }

    // Returns the correct key string for a new msg to store on redis
    static createRedisKey (users,socket,info,newMsgId,type,title) {
       var date = new Date();
       var currentDate = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds()
       // Key for redis: MegaApp:type:msgId:authorId:author:dateOfPublication:color:lng:lat:title | value
       var dbKey = "MegaApp:" + type + ":" + newMsgId + ":" + users[socket.id].id + ":" + info.content.author + ":" +
                                currentDate + ":" + info.content.color + ":" + + info.content.position.lng +
                                ":" + info.content.position.lat + ":" + title;
       return dbKey;
    }

    // Returns the correct key string for a reply to store on redis
    static createRedisReplyKey (users,socket,info,newMsgId, type) {
       var date = new Date();
       var currentDate = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds()
       var timeStamp = date.getTime();
       // Key for redis: MegaApp:type:msgid:authorId:authorName:dateOfPublication:timeStamp | value
       var dbKey = "MegaApp:" + type + ":" + newMsgId + ":" + users[socket.id].id + ":" + info.content.author + ":" +
                                currentDate + ":" + timeStamp + ":" + info.content.color;
       return dbKey;
    }

    // Save key | value to redis database
    static saveToRedis (key,value,expireTime,client) {
       client.set(key,value)
       client.expire(key,expireTime);
    }
}
