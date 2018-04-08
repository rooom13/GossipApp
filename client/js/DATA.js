/*
    DATA SCTRUCTURES:
    - _me, info about the user
    - _msgs, array of msgs with replies
*/
var DATA = { 
    // User info
    _me :
    {
        author: 'Unnamed',
        color: '#1fff16',
        position:  {lng: 2.1914462587587877, lat: 41.40387884455265},
        authorId : -1,
    },

    // Updates data position
    setPosition : function(pos){
        DATA._me.position.lat = pos.lat;
        DATA._me.position.lng = pos.lng;
    },

    //Msg List
    _msgs : [],

    // Current active users
    active_users : 0,


    add_newMsg : function(msg){
        DATA._msgs[msg.msgId] = msg;
    },

    delete_msg : function(msgId){
      delete DATA._msgs[msgId];
    },

    add_newReply : function(reply){
        DATA._msgs[reply.msgId].replies.push(reply);
    },

    //Data init
    init : function(name,color, authorId){
        // Asignar nombre proporcionado
        DATA._me.author = name;
        DATA._me.color = color;
        DATA._me.authorId = authorId;
    }
};
