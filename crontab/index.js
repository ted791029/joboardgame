const mongoose = require('mongoose');
const config = require('./config');
const Group = require('./models/group');

mongoose.connect(config.mongodb).then( async () =>{
    const groups = await Group.find().ByAll();
    const len = groups.length ;
    if(len > 0){
        for(let i = 0;i < len;i++){
            const date = groups[i].date;
            const start = groups[i].start;
            const time = dateToTime(date, start);
            const now = Number(Date.now()) + 8*60*60*1000;
            if(time <= now){
                await Group.update().updatePlayByGroupId(groups[i]._id, true);
            }else{
                await Group.update().updatePlayByGroupId(groups[i]._id, false);
            }
        }
    }
    process.exit();
});


const dateToTime = (date, time) => {
    const dateArr = date.split('/');
    const year = Number(dateArr[0]);
    const month = Number(dateArr[1]) - 1;
    const day = Number(dateArr[2]);
    let num = new Date(year, month, day);
    const timeArr = time.split(':');
    const hour = Number(timeArr[0]);
    const min = Number(timeArr[1]); 
    num = Number(num) + hour*60*60*1000 + min*60*1000;
    return num;
}