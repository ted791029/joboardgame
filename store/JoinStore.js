const fs = require('fs');
const path = './桌遊店.txt';
const readline = require('readline');
const storeSchema = require('./models/store');

var index = 0;
var index2 = 0;

const joinPromise = async () => {
    return new Promise((resolve, reject) => {
        join(resolve, reject);
    });
}

const join = (resolve, reject) => {
    const inputStream = fs.createReadStream(path);
    const lineReader = readline.createInterface({ input: inputStream });
    lineReader.on('line', () => {
        index++;
    });
    lineReader.on('close', () => {
        const inputStream2 = fs.createReadStream(path);
        const lineReader2 = readline.createInterface({ input: inputStream2 });
        lineReader2.on('line', function(line) {
            const arr = line.split(',');
            if(arr.length == 6){
                const store = new storeSchema({
                    name: arr[0],
                    city: arr[1],
                    dist: arr[2],
                    address: arr[3],
                    lat: arr[4],
                    lng: arr[5]
                })
                store.save().then(()=> {
                    index2++;
                    console.log(index + " " + index2);
                    if(index == index2){
                        resolve();
                    }
                }).catch(()=> {
                    index--;
                });
            }else{
                index--;
            }
        });
    })
}


module.exports = {
    joinPromise
}