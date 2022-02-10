const request = require("request");
const fs = require('fs');
const path = './爬蟲.txt';
const readline = require('readline');

var index = 0;
var index2 = 0;

const openPromise = async () => {
    return new Promise((resolve, reject) => {
        openAPI(resolve, reject);
        setTimeout(()=>{
            resolve();
        },15000);
    });
}

const openAPI = async (resolve, reject) => {
    fs.writeFile('./桌遊店.txt', '',function (err) {
    });
    fs.close;
    const inputStream = fs.createReadStream(path);
    const lineReader = readline.createInterface({ input: inputStream });
    lineReader.on('line',  () => {
        index++;
    });
    lineReader.on('close', () => {
        const inputStream2 = fs.createReadStream(path);
        const lineReader2 = readline.createInterface({ input: inputStream2 });
        lineReader2.on('line',  (line) => {
            const arr = line.split(',');
            const name = arr[0];
            const lat = arr[1];
            const lng = arr[2];
            call(name, lat, lng, resolve, (name, resolve, error, response, body) => {
                index2++;
                if(error){
                    console.log(error);
                }else{
                    if(response.statusCode == 200){
                        const data = JSON.parse(body).data;
                        const temp = data.full_address;
                        if(temp != null){
                            const sp = temp.split('灣');
                            const address = sp[1];
                            if(address && address.length > 5){
                                let str = name+','+address+','+lat+','+lng+'\r\n';
                                str = str.replace(new RegExp('縣', 'g'), '縣,');
                                str = str.replace(new RegExp('市', 'g'), "市,");
                                str = str.replace(new RegExp('區', 'g'), '區,');
                                str = str.replace(new RegExp('鄉', 'g'), '鄉,');
                                str = str.replace(new RegExp('鎮', 'g'), '鎮,');
                                fs.appendFile('./桌遊店.txt', str,function (err) {
                                    if (err)
                                        console.log(err);
                                    else
                                        console.log('Open Append operation complete.');
                                        if(index == index2){
                                            resolve();
                                            fs.close;
                                        }
                                });
                            }
                        }
                    }
                }
            });
        });
    })
}


const call = async (name, lat, lng, resolve, callback) => {
    request({
        url: 'http://api.opencube.tw/location?lat=' + encodeURIComponent(lat) +'&lng='+ encodeURIComponent(lng),
        method: "GET",
        timeout: 20000,
        followRedirect: true,
        maxRedirects: 10
    }, (error, response, body) => {
        try{
            callback(name, resolve, error, response, body)
        }catch{
            
        }
    });
}

module.exports = {
    openPromise
}
