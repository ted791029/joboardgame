const express = require('express');
const config = require('./config');
const app = express();
const router = require('./routes');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');


app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", config.Url);
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-access-token");
    res.header('Access-Control-Allow-Credentials', true);
    next()
})

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use('/api', router);
mongoose.connect(config.mongodb).then(() =>{
    app.listen(config.port, (res,req,next) => {
    console.log('listen on ' + config.port);
    })
});
