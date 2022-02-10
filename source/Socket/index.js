const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const mongoose = require('mongoose');
const config = require('./config');
const Chat = require('./models/chat');
const jwt = require('jsonwebtoken');
const Member = require('./models/member');
const Group = require('./models/group');

// 加入線上人數計數

// const io = require("socket.io")(server, {
//     handlePreflightRequest: (req, res) => {
//         const headers = {
//             "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept, x-access-token",
//             "Access-Control-Allow-Origin": 'http://localhost:8080',
//             "Access-Control-Allow-Credentials": true
//         };
//         res.writeHead(200, headers);
//         res.end();
//     }
//  });

io.on('connection', (socket) => {
    console.log('A User connected');
    // 發送人數給網頁
    socket.on("join", async(obj) => {
        const groupId = obj.groupId
        socket.join(groupId);
        const msg = await Chat.find().ByGroupId(groupId,{ }, {sort: [['_id', -1]]});
        const record = {
            record:msg
        }
        socket.emit('record', record);
    });

    socket.on("send", async (obj) => {
        const chat = await createMessage(obj);
        io.to(obj.groupId).emit("msg", chat);
    });
  

    socket.on('disconnect', () => {
        console.log('A User disconnect');
    });
});


const createMessage = async (obj) => {
    const groupId = obj.groupId;
    const token = obj.token;
    const msg = obj.msg;
    let memberId;
    if(token){
        jwt.verify(token, config.jwtSalt, (err, decoed) => {
            if(err){
            }else{
                memberId = decoed.memberId;
            }
        })
    }
    const member = await Member.find().ByMemberId(memberId);
    const group = await Group.find().ByGroupId(groupId);
    const avatarPath = member.avatarPath;
    const createdAt = new Date().getTime();
    const expirationDate = group.expirationDate;
    const chat = new Chat({
        groupId: groupId,
        memberId: member._id,
        avatarPath: avatarPath,
        name: member.name,
        msg: msg,
        createdAt: createdAt,
        expirationDate: expirationDate
    })
    chat.save();
    return chat;
}


mongoose.connect(config.mongodb).then(() =>{
    server.listen(config.port, (res,req,next) => {
    console.log('listen on ' + config.port);
    })
});

