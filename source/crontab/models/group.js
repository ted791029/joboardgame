const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const groupSchema = new Schema({
    memberId: { type: Schema.Types.ObjectId, ref: 'Member' },
    name: String,
    date: String,
    city: String,
    dist: String,
    address: String,
    lat: Number,
    lng: Number,
    start: String,
    end: String,
    min: Number,
    now: Number,
    max: Number,
    novice: Boolean,
    game: String,
    apply: Boolean,
    other:  String,
    players: [{ type: Schema.Types.ObjectId, ref: 'Member' }],
    waits: [{ type: Schema.Types.ObjectId, ref: 'Member' }],
    path: String,
    playing: Boolean,
    createdAt: {type: Date, default: Date.now},
    expirationDate: {type: Date, expires: 0}
})


groupSchema.query.ByAll = function(){
    return this.find({});
}

groupSchema.query.updatePlayByGroupId = function(groupId, playing){
    return this.update({_id: groupId}, {playing: playing});
}

module.exports = mongoose.model('Group', groupSchema);