var APP = {

  /*
  Debug utilities for developers
  - emulate_connection: emulates connection with send_to_server
  - fastStart: skips welcome screen
  - fakeLocation: emulates location, random location near a fakeCoordsCenter
  - startDemo: executes some tests for debugging
  */
  debug : {
    emulate_connection : false,
    fastStart : false,
    fakeLocation : true,
    fakeCoordsCenter :{lng : 2.1938315, lat : 41.4041986 },
    startDemo: false,
    msgCount : 100,

    // executes debug options
    init : function(){
      if(APP.debug.fastStart){
        APP.start();
      }
      if(APP.debug.fakeLocation){
        DATA.setPosition( APP.rndAroundUser(0.002) );
        MAP.map.setCenter(DATA._me.position);
        MAP.map.setZoom(16);
      }
      if(APP.debug.startDemo){
        DEMO.start();
      }
    },
  },

  // Returns coords object of rnd postion around fakeCoordsCenter
  rndAroundUser : function(radius){
    var center = APP.debug.fakeCoordsCenter;
    return {
      lng : center.lng + ((Math.random()*2 -1 )*radius),
      lat : center.lat + ((Math.random()*2 -1 )*radius),
    }
  },

  // user count received callback, updates active_users
  on_userCount_received : function(userCount) {
    DATA.active_users = userCount.activeUsers;
    GUI.updateUserCount();
  },

  // New msg received callback, adds new msg
  on_newMsg_received : function(msg){
    DATA.add_newMsg(msg);
    GUI.create_popup(msg);
  },

  // New reply received callback, adds reply
  on_newReply_received : function(reply){
    DATA.add_newReply(reply);
    // Show added reply if conversation opened
    if(GUI.conversation_opened == reply.msgId ){
      GUI.add_reply(reply);
    }
  },

  /* Data init received callback,
  Recieves existing msg list & user data init
  */
  on_dataInit_received : function(initData) {
    // Handle each existent msg
    initData.msgs.forEach( function(newMsg){ if(newMsg != null) APP.on_newMsg_received(newMsg.content); } );
    // Update user data
    var name = (initData.combination.name || 'Default')+ ' ' + (initData.combination.adjective || "person");
    var color = initData.combination.color|| "red";
    var authorId = initData.authorId;
    DATA.init(name,color ,authorId);
    //set pseudonym in GUI
    GUI.set_pseudonym();
  },

  // deletes a msg given msgId
  delete_msg : function(msgId){
    //Avoid deleteing unexistent msgs
    if(DATA._msgs[msgId] != null ){
      //Delete from data & GUI
      DATA.delete_msg(msgId);
      GUI.delete_popup(msgId);
      //If that conversation opened & current conversation
      if( GUI.conversation_opened == msgId ){
        GUI.conversation_opened = null;
        GUI.conversationBox_close();
      }
    }
  },

  // delete message list callback
  on_deleteMessage_received : function(idList){
    idList.forEach(function(msgId){ APP.delete_msg(msgId)  } );
  },

  // Once user press location button, and accepted premission
  on_gotPosition : function() {
    DATA.setPosition({
      lat : MAP.geolocateControl._lastKnownPosition.coords.latitude,
      lng : MAP.geolocateControl._lastKnownPosition.coords.longitude,
    });
    // Zoom in a bit
    setTimeout(function () {
      MAP.map.setZoom(16);
    }, 3000);
  },

  // Welcome go button callback
  start : function(){
    welcome.style.visibility = 'hidden';
    app.style.visibility = 'visible';
  },

  //MAIN, APP INIT
  init: function(){
    GUI.init();
    APP.debug.init();
    //console.log("Debug: ", APP.debug);
    COM.init();
    MAP.init();
  }
}
