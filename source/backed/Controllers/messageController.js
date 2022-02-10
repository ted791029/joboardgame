const Message = require('../models/message');

const create = (memberId, title, body) => {
    const message = new Message({
        memberId: memberId,
        read: false,
        title: title,
        body: body
    })
    message.save()
}

const record = async (req, res, next) => {
    const memberId = req.decoed.memberId;
    const max = 5;
    const msg = new Array;
    const query = {
        memberId: memberId,
        read: false
    }
    const  unread = await Message.find().ByMemberId(query).sort({'_id': -1});
    if(unread.length < max){
        for(let i = 0; i < unread.length;i++){
            msg.push(unread[i]);
        }
        const query = {
            memberId: memberId,
            read: true
        }
        const  read = await Message.find().ByMemberId(query).sort({'_id': -1});
        if(read.length > 0){
            for(let i = 0; i < max - unread.length;i++){
                msg.push(read[i]);
            }
        }
    }else{
        for(let i = unread.length - max; i < unread.length;i++){
            msg.push(unread[i]);
        }
    }
    res.json({status: 200, msg: msg, length: unread.length});
}

const msg = async(req, res, next) =>{
    const messageId = req.query.messageId;
    await Message.update().updateReadByMessageId(messageId);
    res.json({status: 200, msg: 'sucesss'})
}


module.exports = {
    create,
    record,
    msg
}