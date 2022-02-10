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
    applications:[{ type: Schema.Types.ObjectId, ref: 'Group' }],
    webFirebaseToken : String,
    androidFirebaseToken : String
});

memberSchema.query.ByAccount = function(account){
    return this.findOne({account:account});
}

memberSchema.query.ByAccountAndPassword = function(account, password){
    return this.findOne({account:account, password: password});
}

memberSchema.query.ByMemberId = function(memberId){
    return this.findOne({_id:memberId});
}
memberSchema.query.verifyByMemberId = function(memberId){
    return this.updateOne({_id: memberId}, {verify: true});

}
memberSchema.query.passwordByMemberId = function(memberId, password){
    return this.updateOne({_id: memberId}, {password: password});
}

memberSchema.query.webFirebaseTokenByMemberId = function(memberId, userToken){
    return this.updateOne({_id: memberId}, {webFirebaseToken: userToken});

}

memberSchema.query.androidFirebaseTokenByMemberId = function(memberId, userToken){
    return this.updateOne({_id: memberId}, {androidFirebaseToken: userToken});

}

memberSchema.query.avatarByMemberId = function(memberId, avatarPath){
    return this.updateOne({_id: memberId}, {avatarPath: avatarPath})
}

memberSchema.query.allByMemberId = function(memberId, arr){
        return this.updateOne({_id: memberId}, {name: arr[0], password: arr[1], birthday: arr[2], gender: arr[3], firstContact: arr[4], introduction: arr[5], game: arr[6]});
}

memberSchema.query.updateGroupByMemberId = function(memberId, groups){
    return this.updateOne({_id: memberId}, {groups: groups});
}

memberSchema.query.updateApplicationByMemberId = function(memberId, applications){
    return this.updateOne({_id: memberId}, {applications: applications});
}

memberSchema.query.ByGroupId = function(){
    return this.find();
}

memberSchema.query.delGroupsByGroupId = function(memberId, groupId){
    return this.updateOne({_id: memberId},{"$pull":{"groups":groupId}});
}
memberSchema.query.delApplicationsByGroupId = function(memberId, groupId){
    return this.updateOne({_id: memberId},{"$pull":{"applications":groupId}});
}


module.exports = mongoose.model('Member', memberSchema);
