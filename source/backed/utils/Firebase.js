const request = require('request');

const  cloudMessage = (userToken, title, body)=> {
    
    const url = 'https://fcm.googleapis.com/fcm/send';
    const headers = {
        Authorization:'key=AAAAx0Y4mp0:APA91bGISGaiCj8-UtP10XaJ0dt7cPlvK3PwNa-UmmCet6U4eZSTKcP8l7j3XptKC7U3sP5LhK43t1rsPZosvNmRg-q7C6ABE5AtZRYQAWMtoD34iD0JO9En_81k5EE6AS9oDqmBbmMe',
        "content-type": "application/json"
    }
    const requestBody = {
        to : userToken,
        notification:{
            title: title,
            body: body
        }
    }
    const options = {
        url: url,
        method: 'POST',
        json: true,
        headers: headers,
        body:requestBody
      };
    request(options, (error, response, body) => {
        if(error){
            console.log('推播錯誤: '+ error);
        }else{
            if(response.statusCode == 200){
                console.log(body);
            }
        }
    });
}
module.exports = {
    cloudMessage
}