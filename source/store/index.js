const mongoose = require('mongoose');
const config = require('./config');
const Store = require('./models/store');
const Fb = require('./fbAPI');
const Open = require('./openAPI');
const Join = require('./JoinStore');

mongoose.connect(config.mongodb).then( async () => {
    await Store.remove().delAll();
    await Fb.fbPromise();
    await Open.openPromise();
    await Join.joinPromise();
    process.exit();
});
