const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const chatSchema = new Schema({
    groupId: String,
    memberId: String, 
    avatarPath: String,
    name: String,
    msg: String,
    createdAt: Number,
    expirationDate: {type: Date, expires: 0}

})

chatSchema.query.ByGroupId= function(groupId){
    return this.find({groupId: groupId});
}

module.exports = mongoose.model('Chat', chatSchema);