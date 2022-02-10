const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messageSchema = new Schema({
    memberId: String,
    read: Boolean,
    title: String,
    body: String
});


messageSchema.query.ByMemberId = function(query){
    return this.find(query);
}

messageSchema.query.updateReadByMessageId = function(messageId){
    return this.updateOne({_id: messageId},{read: true});

}

module.exports = mongoose.model('Message', messageSchema);