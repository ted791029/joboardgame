const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const Schema = mongoose.Schema;

const groupSchema = new Schema({
    memberId: { type: Schema.Types.ObjectId, ref: 'Member' },
    name: String,
    date: String,
    city: String,
    dist: String,
    address: String,
    storeName: String,
    lat: Number,
    lng: Number,
    start: String,
    end: String,
    min: Number,
    now: Number,
    max: Number,
    novice: Boolean,
    game: Array,
    apply: Boolean,
    other:  String,
    players: [{ type: Schema.Types.ObjectId, ref: 'Member' }],
    waits: [{ type: Schema.Types.ObjectId, ref: 'Member' }],
    path: String,
    playing: Boolean,
    createdAt: {type: Date, default: Date.now},
    expirationDate: {type: Date, expires: 0}
})

groupSchema.query.ByMemberId = function(memberId){
    return this.find({memberId:memberId});
}

groupSchema.query.ByMemberIdAndStartAndEnd = function(memberId, date, start, end){
    return this.findOne({memberId: memberId, date: date, start: start, end: end});
}

groupSchema.query.ByAll = function(){
    return this.find({});
}

groupSchema.query.ByGroupId = function(groudId){
    return this.findOne({_id: groudId});
}

groupSchema.query.updateJoinByGroupId = function(groudId, now, players){
    return this.updateOne({_id: groudId}, {now: now, players: players});
}

groupSchema.query.updateＷaitByGroupId = function(groudId, waits){
    return this.updateOne({_id: groudId}, {waits: waits});
}

groupSchema.query.updatePathByGroupId = function(groudId, path){
    return this.updateOne({_id: groudId}, {path: path});
}

groupSchema.query.updateAllByGroupId = function(groudId, arr){
    return this.updateOne({_id: groudId}, {name: arr[0], date: arr[1], city: arr[2], dist: arr[3], address: arr[4], start: arr[5], end: arr[6], min: arr[7], max: arr[8], now: arr[9], novice: arr[10], game: arr[11], apply: arr[12], other: arr[13], expirationDate: arr[14], lat: arr[15], lng: arr[16], storeName: arr[17]});
}

groupSchema.query.ByNameStr = function(str){
    return this.find({$or:[{name: new RegExp(str)}, {date: new RegExp(str)}, {city: new RegExp(str)}, {dist: new RegExp(str)}, {address: new RegExp(str)}, {game: new RegExp(str)}]});
}

groupSchema.query.delPlayersByMemberId = function(groudId, memberId, now){
    return this.updateOne({_id: groudId},{"$pull":{"players":memberId}, now: now});
}
groupSchema.query.delWaitsByMemberId = function(groudId, memberId){
    return this.updateOne({_id: groudId},{"$pull":{"waits":memberId}});
}

groupSchema.query.delGroupByGroupId= function(groudId, memberId){
    return this.remove({_id: groudId});
}

groupSchema.plugin(mongoosePaginate);
module.exports = mongoose.model('Group', groupSchema);