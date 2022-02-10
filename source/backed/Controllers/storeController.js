const Store = require('../models/store');
const checkVerify = require('../utils/Verify');

const getDistStore = async (req, res, next) =>{
    const city = req.body.city;
    const dist = req.body.dist;
    const store = await Store.find().ByCityAndDist(city, dist);
    if(store.length > 0){
        res.json({status: 200, store: store});
    }else{
        res.json({status: 400, msg:'目前沒有店家'});
    }
}

const getAllStore = async (req, res, next) => {
    const store = await Store.find().ByAll();
    if(store){
        res.json({status: 200, store: store});
    }else{
        res.json({status: 400, msg:'目前沒有店家'})
    }
}

const delStore = async (req, res, next) => {
    const lat = req.body.lat;
    const lng = req.body.lng;
    await Store.remove().delstoreByLatLng(lat, lng);
    res.json({status: 200 , msg: '刪除店家成功'});
}

module.exports = {
    getDistStore,
    getAllStore,
    delStore
}