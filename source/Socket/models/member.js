const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const memberSchema = new Schema({
    name: String,
    account: String,
    password: String,
    birthday:String,
    gender: Number,
    firstContact: String,
    verify: Boolean,
    avatarPath: String,
    introduction: String,
    game: Array,
    type: Number,   //揪桌遊0  facebook 1
    groups: [{ type: Schema.Types.ObjectId, ref: 'Group' }],
    applications:[{ type: Schema.Types.ObjectId, ref: 'Group' }]
});


memberSchema.query.ByMemberId = function(memberId){
    return this.findOne({_id:memberId});
}


module.exports = mongoose.model('Member', memberSchema);
