const request = require("request");
const fs = require('fs');

const fbPromise = async () => {
    return new Promise((resolve, reject) => {
        fbApi(resolve, reject);
        setTimeout(()=>{
            resolve();
        },15000);
    });
}

const fbApi = (resolve, reject) =>{
    fs.writeFile('./爬蟲.txt', '',function (err) {
    });
    fs.close;
    const center = encodeURIComponent('23.990291,120.962963');
    const q = encodeURIComponent('桌遊');
    const distance = encodeURIComponent('2000000');
    const fields = encodeURIComponent('name,single_line_address, location, rating_count');
    const access_token = encodeURIComponent('481623165747448|fa2bb9b00a4fc137bf3e46ba4abc389d');
    let url ='https://graph.facebook.com/v3.2/search?type=place&center='+ center +'&q=' + q +'&distance='+ distance +"&fields=" + fields + '&access_token=' + access_token;
    fbcall(url, resolve, reject, back);
}

const fbcall =  (url, resolve, reject, callback) => {
     request({
        url: url,
        method: "GET",
        timeout: 10000,
        followRedirect: true,
        maxRedirects: 10
    }, (error, response, body) => {
        try{
            callback(resolve, reject, error, response, body);
        }catch{
            
        }
    })
}


const back = (resolve, reject, error, response, body) => {
    if(error){
        console.log(error);
    }else{
        if(response.statusCode == 200){
            const result = JSON.parse(body);
            const data = result.data;
            for(let i = 0;i < data.length;i++){
                const name = data[i].name;
                const location = data[i].location;
                const latitude = location.latitude;
                const longitude = location.longitude;
                if(name && latitude && longitude){
                    const str = name +','+  latitude + ',' + longitude + '\r\n';
                    fs.appendFile('./爬蟲.txt', str,function (err) {
                        if (err)
                            console.log(err);
                        else
                            console.log('FB Append operation complete.');
                    });
                }
            }
            const next = result.paging.next;
            if(next){
                fbcall(next, resolve, reject, back);
            }else{
                fs.close;
                resolve();
            }
        }
    }
}


module.exports = {
    fbPromise
}



