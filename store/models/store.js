const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const storeSchema = new Schema({
    name: String,
    city: String,
    dist: String,
    address: String,
    lat: Number,
    lng: Number
})

storeSchema.query.ByCityAndDist = function(city, dist){
    return this.find({city:city, dist:dist});
}

storeSchema.query.delAll = function(){
    return this.remove({});
}

module.exports = mongoose.model('Store', storeSchema);