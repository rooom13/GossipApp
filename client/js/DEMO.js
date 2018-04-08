var DEMO = {

  start : function()
  {


  
    var radius = 0.002;

    msg_test0 = {
      authorId : 3,
      author: "Author1a",
      color: '#4eab1b',
      title: "Wenas Roman",
      message: "Lo he intentado pero es complicado",
      msgId: 10,
      position: APP.rndAroundUser(radius),
      replies : []
    };
    msg_test1 = {
      authorId : 3,
      author: "Author1",
      color: "#6e2b75",
      title: "Wenas Roman",
      message: "Lo he intentado pero es complicado",
      msgId: 23,
      position: APP.rndAroundUser(radius),
      replies : []
    };
    replies_msg_test2 = [
      {
        msgId: 12,
        replierId : 2,
        author: 'Roller_boy',
        color: '#d8f8c6',
        message: "Loco ds cool",
      },
      {
        msgId: 12,
        replierId : 2,
        author: 'Roller_boy',
        color: '#d8f8c6',
        message: "Loco ds cool",
      },
      {
        msgId: 12,
        replierId : 2,
        author: 'Roller_boy',
        color: '#d8f8c6',
        message: "Loco ds cool",

      }
    ]
    msg_test2 = {
      authorId : 3,
      author: "Author2",
      color: '#656b62',
      title: "title2",
      message: "This is the message2",
      msgId: 12,
      position: APP.rndAroundUser(radius),
      replies: replies_msg_test2,
    };
    replies_msg_test3 = [
      {
        msgId: 69,
        replierId : 2,
        author: 'Menganito',
        color: '#d8f8c6',
        message: "Harambe was not just a gorila",
      },
      {
        msgId: 69,
        replierId : 2,
        author: 'Fulana',
        color: '#d8f8c6',
        message: "Harambe was a dumb",
      },
      {
        msgId: 69,
        replierId : 2,
        author: 'Roller_boy',
        color: '#d8f8c6',
        message: "Harambe was cool",
      },
      {
        msgId: 69,
        replierId : 2,
        author: 'Roller_boy',
        color: '#d8f8c6',
        message: "Harambe was cool",
      },
      {
        replierId : 2,
        msgId: 69,
        author: 'Roller_boy',
        color: '#d8f8c6',
        message: "Harambe was cool",
      },
    ];
    msg_test3 = {
      authorId : 3,
      author: "Author3",
      color: '#333954',
      title: "Incredible thing I found",
      message: "So, I was walking around here and found that I love you",
      msgId:69,
      position: APP.rndAroundUser(radius),
      replies: replies_msg_test3,
    };


    DATA.init("Juan","red",56)


    APP.on_newMsg_received(msg_test0);
    APP.on_newMsg_received(msg_test1);
    APP.on_newMsg_received(msg_test2);
    APP.on_newMsg_received(msg_test3);

    GUI.toggle_sendBubble_visibility();
    GUI.show_conversation(69 );


  }
}
