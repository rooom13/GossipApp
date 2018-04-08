module.exports = class Util {

    // Send a reply to the client
    static replyClient (type,content,socket,assignedId) {
       var postData = Util.generateJson(type,content,assignedId)
       var retornar = JSON.stringify(postData);
       try {
         socket.send(retornar);

       } catch(e) {
           console.log("Can't send newMessage: ", e.data);
           return;
       }
    }

    // Send a reply to all connectec clients
    static replyBroadcast (type,content,socket,assignedId,users,msgList,dbKey) {
        var postData;
        if(type == "new-msg") postData = Util.generateJson(type,content,assignedId);
        else if(type == "new-reply") {
            var fields = dbKey.split(':');
            var dateTime = fields[5]+":"+fields[6]+":"+fields[7];
            var timeStamp = fields[8];
            postData = Util.generateReplyJson(type,content,assignedId,dateTime,timeStamp,socket);
        }

        var retornar = JSON.stringify(postData);
        try {

             // Save to local array in our server
            var msgId = postData.content.msgId;
            if(type == "new-msg") {
                if(!msgList.includes(msgId)) {
                    msgList[msgId] = (postData);
                }
            }
            else if(type == "new-reply") {
                if(msgList[msgId] != null) {
                    msgList[msgId].content.replies.push(postData.content);
                }
            }

            // Send the message to all users
            for (var user in users) {
                users[user].send(retornar);
            }
        } catch(e) {
           console.log("Can't send newMessage: ", e.data);
           return;
        }
    }

    // Send the id list of the messages that expired to connected clients
    static deleteBroadcast (type,expiredIds,users) {
        var postData = {
          type : type,
          content : expiredIds
        };

        var retornar = JSON.stringify(postData);
        console.log("Retorno esta lista de ids a borrar: " + retornar);
        try {
            // Send the message to all users
            for (var user in users) {
                users[user].send(retornar);
            }
        } catch(e) {
           console.log("Can't delete newMessages: ", e.data);
           return;
        }
    }


    // Generate a json given type, content and assigned ID
    static generateJson(tipus,content,assignedId) {
       var postData = {
         type : tipus,
         content : {
           author: content.author,
           color: content.color,
           title: content.title,
           message: content.message,
           msgId: assignedId,
           position: {
             lng: content.position.lng,
             lat: content.position.lat,
           },
           replies: []
         }
       };
       return postData;
    }

    // Generate a json given type, content, assigned ID, date, timestamp and socket
    static generateReplyJson(tipus,content,assignedId,date,timeStamp,socket) {
       var postData = {
         type : tipus,
         content : {
           author: content.author,
           replierId: socket.id,
           color: content.color,
           message: content.message,
           msgId: assignedId,
           date: date,
           timeStamp: timeStamp
         }
       };
       return postData;
    }

    // Generate a json for replies given type, author, color, message, assignedId, date, timestamp and replierId
    static generateReplyJsonFull(tipus,author,color,message,assignedId,date,timeStamp,replierId) {
       var postData = {
         type : tipus,
         content : {
           author: author,
           replierId: replierId,
           color: color,
           message: message,
           msgId: assignedId,
           date: date,
           timeStamp: timeStamp
         }
       };
       return postData;
    }

    // Generate a json for new-msg given type, author, color, title, message, msgId, lng, lat
    static generateJsonFull(tipus,author,color,title,message,msgId,lng,lat) {
        var postData = {
          type : tipus,
          content : {
            author: author,
            color: color,
            title: title,
            message: message,
            msgId: msgId,
            position: {
              lng: lng,
              lat: lat,
            },
            replies: []
          }
        };
        return postData;
    }

    // Inits the combinator with a list of name combinations and colours.
    static initCombinator(combinator) {
        var names = [
            "Rinoceronte",
            "Sapo",
            "Búho",
            "Ciudadano",
            "Avestruz",
            "Platón",
            "Pato",
            "Calcetín",
            "Ratón",
            "Tiburón",
            "Altavoz",
            "Genio",
            "Patinador",
            "Bailarín",
            "Caracol",
            "Vendedor",
            "Colibrí",
            "Verdugo",
            "Gato",
            "Perro",
            "Ornitorrinco",
            "Gallo",
            "Cerdito",
            "Conejo",
            "Científico",
            "Periodista",
            "Informático",
            "Informador",
            "Abejorro",
            "Camionero",
            "Taxista",
            "Ladrón",
            "Viajante",
            "Trotamundos",
            "Elefante",
            "Runner",
            "Mago",
            "Brujo",
            "Karateka",
            "Repetidor",
            "Einstein",
            "Sócrates",
            "Triceratops",
            "Chusco",
            "Planeta",
            "Político",
            "Bibliotecario",
            "Músico",
            "Funambulista",
        ];

        var adjectives = [
            "perdido",
            "enamorado",
            "sensual",
            "roto",
            "travieso",
            "decente",
            "colorido",
            "increíble",
            "bugeado",
            "invencible",
            "cutre",
            "sensacional",
            "coherente",
            "brutal",
            "skater",
            "surfero",
            "roller",
            "pro",
            "santo",
            "distraído",
            "friolero",
            "veraniego",
            "dominguero",
            "gigante",
            "invisible",
            "seductor",
            "listo",
            "premium",
            "nivel 20",
            "escacharrado",
            "ambicioso",
            "apasionado",
            "atento",
            "cínico",
            "entrometido",
            "gracioso",
            "impulsivo",
            "juguetón",
            "modesto",
            "orgulloso",
            "perturbador",
            "simpático",
            "valiente",






        ];

        var colors = [
            "#800080",
            "#008000",
            "#6d24ce",
            "#006880",
            "#008068",
            "#00802d",
            "#668000",
            "#5b8000",
            "#800000",
            "#c71fc7",
            "#f753f7",
            "#ef7def",
            "#ff55ab",
            "#b50c62",
            "#f9188a",
            "#8a0146",
            "#543a47",
            "#402533",
            "#b11e1e",
            "#800303",
            "#754dab",
            "#472871",
            "#310869",
            "#8881f7",
            "#4c46ad",
            "#292380",
            "#271db5",
            "#0554b5",
            "#3f6fa9",
            "#31aac5",
            "#11b0d4",
            "#16ab6d",
            "#308e67",
            "#0d774b",
            "#deab37",
            "#c58b06",
            "#c55e06",
            "#c77630",
            "#924b0e",
            "#920e0e",
        ];

        combinator.addField("name",names);
        combinator.addField("adjective",adjectives)
        combinator.addField("color",colors)
    }
}
