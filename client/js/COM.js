 /*
  COMUNICATIONS  (COM):
- Callbacks of connections with WebSockets to server
*/
var COM = { 

  port : "60696" ,
  url : 'ws://84.89.136.194:',
  client  :  null,

  // Send obj
  send_to_server : function(obj_data){
    if(APP.debug.emulate_connection){
      if(obj_data.type == 'new-msg'){
        obj_data.content.msgId = ++APP.debug.msgCount;
      }
      var packet = {data: obj_data};
      COM.client.onmessage(packet);
    }else
    COM.client.send( JSON.stringify(obj_data));
  },

  // Send new message
  sendNewMessage : function(){
    if(sendBubble_textBox_content.value && sendBubble_textBox_title.value ){
      msg = {
        type: 'new-msg',
        content: {
          authorId: DATA._me.authorId,
          author: DATA._me.author,
          color: DATA._me.color,
          title: sendBubble_textBox_title.value.substring(0,25),
          message: sendBubble_textBox_content.value,
          msgId: null,
          position: {
            lng: DATA._me.position.lng,
            lat: DATA._me.position.lat,
          },
          replies : [],
        }
      }
      COM.send_to_server(msg);
      //Close sendBubble
      GUI.toggle_sendBubble_visibility();
    } else console.log("What a void message...")
  },

  // Send new reply
  sendReply : function(){
    msgId_aux = conversationBox_msg_title.getAttribute("data-msgId");
    if(conversationBox_sendBubble_textBox.value){
      reply = {
        type: 'new-reply',
        content: {
          replierId: DATA._me.authorId,
          author: DATA._me.author,
          color: DATA._me.color,
          message: conversationBox_sendBubble_textBox.value,
          msgId: msgId_aux,
        }
      }
      COM.send_to_server(reply);
    }
  },


  // COMUNICATIONS init
  init : function(){
    COM.client = new WebSocket(COM.url +  COM.port);

    // Message handler
    COM.client.onmessage = function (stringified_msg){

      var msg = null;
      if(APP.debug.emulate_connection)msg = stringified_msg.data;
      else
      msg = JSON.parse(stringified_msg.data);

      switch (msg.type) {
        case 'new-msg':
        APP.on_newMsg_received(msg.content);
        break;
        case 'new-reply':
        APP.on_newReply_received(msg.content);
        break;
        case 'init-data':
        APP.on_dataInit_received(msg.content);
        break;
        case 'delete-msg':
        APP.on_deleteMessage_received(msg.content);
        break;
        case 'user-count':
        APP.on_userCount_received(msg.content);
        break;
        default:
        console.log("No New message");
        break;
      }
    };
  }
};
