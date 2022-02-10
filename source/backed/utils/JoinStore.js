const fs = require('fs');
const path = './桌遊店.txt';
const readline = require('readline');
const storeSchema = require('../models/store');
const join = () => {
    const inputStream = fs.createReadStream(path);
    const lineReader = readline.createInterface({ input: inputStream });
    lineReader.on('line', function(line) {
        const arr = line.split(',');
        const store = new storeSchema({
            name: arr[0],
            city: arr[1],
            dist: arr[2],
            address: arr[3],
            lat: arr[4],
            lng: arr[5]
        })
        store.save();
    });
    console.log('end');
}


module.exports = {
    join
}