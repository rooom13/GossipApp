/*
GUI:
- contains all functions that show/hide elements
- callback of buttons
*/

var GUI ={
  //Popups list
  popups : [],
  conversation_opened : null,
  // Toggles send bubble visibility
  toggle_sendBubble_visibility : function(){
    //Clear values
    sendBubble_textBox_title.value = "";
    sendBubble_textBox_content.value = "";
    if( sendBubble.style.visibility == "visible"){
      sendBubble.style.visibility = "hidden";
    }else{
      sendBubble.style.visibility = "visible";
    }
  },

  //Shows msg popup in map
  create_popup : function(msg){
    // Bubble style
    var style = 'background-color:'+msg.color+';color:white; width: 80px; height: 50px; border: none;border-radius: 2px; word-break: break-word';
    // Create popup content
    var popup_content =  '<button onclick="GUI.show_conversation('+msg.msgId+')" style="'+style+'" data-msgId = '+msg.msgId+'>' + msg.title.substring(0,30) + '</button>';
    // Create & display popup
    var popup = new mapboxgl.Popup({closeOnClick: false});
    popup.setLngLat(msg.position);
    popup.setHTML(popup_content);
    popup.addTo(MAP.map);
    GUI.popups[msg.msgId] = popup;
  },

  updateUserCount : function() {
    online_users.innerHTML = DATA.active_users +  ' gossipers';
  },

  delete_popup : function(msgId){
    GUI.popups[msgId].remove();
  },

  // Adds reply to conversation
  add_reply : function (reply) {
    var template_reply = document.querySelector(".conversationBox_replies_reply");
    var root = document.querySelector("#conversationBox_replies");
    elem = template_reply.cloneNode(true);
    elem.className="conversationBox_replies_reply";
    elem.innerHTML = '<div class="conversationBox_replies_reply_author">'+ reply.author +":</div>" +
    '<div style="word-wrap: break-word; color: white; background-color: ' + reply.color + '; border-radius: 5px; padding: 6px 6px 6px 6px; text-align: left; max-width: 90vw;">' + reply.message + "</div>";
    //If my reply, style to right
    if(reply.replierId == DATA._me.authorId){
      elem.style.float = "right";
    }
    root.appendChild(elem);
    root.scrollTop =100000;
  },

  // Shows msg conversation
  show_conversation : function(msgId){
    //hide toggle_sendBubble button
    toggle_sendBubble.style.visibility = 'hidden';
    // Must know which  chat is being opened
    GUI.conversation_opened = msgId;
    var msg = DATA._msgs[msgId];
    //Show box and close others 
    conversationBox.style.visibility = 'visible';
    sendBubble.style.visibility = "hidden";
    // Fill msg
    conversationBox_msg_title.setAttribute("data-msgId", msgId); //Identify msg
    conversationBox_msg_title.innerText =  msg.title;
    conversationBox_msg_author.innerText = "-"+msg.author;
    conversationBox_msg_content.innerText = msg.message;
    //Fill conversation
    var template_reply = document.querySelector(".conversationBox_replies_reply");
    var root = document.querySelector("#conversationBox_replies");
    //append each reply
    var numReplies = msg.replies.length || 0;
    for(var i = 0; i < numReplies; ++i){
      var reply = msg.replies[i];
      GUI.add_reply(reply);
    }
  },

  // Closes opened conversation
  conversationBox_close : function(){
    // show toggle_sendBubble button
    toggle_sendBubble.style.visibility = 'visible';
    // Hide box
    conversationBox.style.visibility = 'hidden';
    // Clear conversation
    var root = document.querySelector("#conversationBox_replies");
    root.innerHTML = '<div id = "templates" style="display: none">'+
    '<div class="conversationBox_replies_reply"></div>' +
    '</div>';
  },

  // button Send Reply callback
  on_sendReply : function() {
    COM.sendReply();
    conversationBox_sendBubble_textBox.focus();
    conversationBox_sendBubble_textBox.value = "";
  },

  // Update pseudonym texts
  set_pseudonym : function () {
    welcomeBox_pseudonym.style.color = DATA._me.color;
    welcomeBox_pseudonym.innerText =DATA._me.author;
    //Pseudonim right
    pseudonym_right.innerHTML = '<div style="color:' + DATA._me.color + ';">' + DATA._me.author + '</div>';
  },

  // GUI init
  init : function(){
    // Set buttons's callbacks
    welcomeBox_button.addEventListener("click", APP.start);
    toggle_sendBubble.addEventListener("click",GUI.toggle_sendBubble_visibility);
    conversationBox_flecha.addEventListener("click",function() {GUI.conversation_opened = null; GUI.conversationBox_close()});
    conversationBox_sendBubble_sendButton.addEventListener("click",GUI.on_sendReply);
    conversationBox_sendBubble_textBox.addEventListener("keypress", function(e){ if(e.keyCode == 13 ){ GUI.on_sendReply();} });
    sendBubble_sendButton.addEventListener("click", COM.sendNewMessage);
    sendBubble_textBox_content.addEventListener("keypress", function(e){if(e.keyCode == 13 ){COM.sendNewMessage()};});
  },
}
