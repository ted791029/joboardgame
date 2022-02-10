const NiChecker = require('../utils/Checker');
const Group = require('../models/group');
const Member = require('../models/member');
const request = require('request');
const checkVerify = require('../utils/Verify');
const config = require('../config');
const Firebase = require('../utils/Firebase');
const messageController = require('./messageController');
const messageCreate = messageController.create;

const create = async (req, res, next) => {
    isCheckeSameTime = true;
    groupInfo(req, res, newGroup, isCheckeSameTime);
}

//加入此團
const joinGroup = async (req, res, next) => {
    const groupId = req.query.groupId;
    const memberId = req.decoed.memberId;
    const isChecked = await checkVerify(memberId);
    if(isChecked){
        res.json({status: 400, msg:'身份未驗證，請收驗證信'});
        return;
    }
    let group = await Group.find().ByGroupId(groupId);
    let now = group.now;
    const max = group.max;
    if(now == max){
        res.json({status: 400, msg:'此桌遊團已滿'});
    }else{
        now++;
        const member = await Member.find().ByMemberId(memberId);
        //確認是否在player列表中
        const players = group.players;
        for(i in players){
            if(players[i] == memberId){
                res.json({status: 400, msg: '已經加入此團'});
                return;
            }
        }
        //確認是否在wait中
        const waits = group.waits;
        for(i in waits){
            if(waits[i] == memberId){
                res.json({status: 400, msg: '正在等待主揪回覆'});
                return;
            }
        }
        let type;
        if(group.apply){
            type = 2;
            waits.push(member._id);
            await Group.update().updateＷaitByGroupId(groupId, waits);
            //更新member中的applications列表
            let applications = member.applications;
            applications.push(group._id);
            await Member.update().updateApplicationByMemberId(memberId, applications);
        }else{
            type = 1;
            players.push(member._id);
            await Group.update().updateJoinByGroupId(groupId, now, players);
            //更新member中的groups列表
            let groups = member.groups;
            groups.push([group._id]);
            await Member.update().updateGroupByMemberId(memberId, groups);
        }
        group = await Group.find().ByGroupId(group._id).populate('waits').populate('players').populate('memberId');
        if(type == 1){
            const players = group.players;
            for(let i = 0; i < players.length - 1 ;i++){
                const webFirebaseToken = players[i].webFirebaseToken;
                const androidFirebaseToken = players[i].androidFirebaseToken;
                const title = '加入訊息';
                const body = players[i].name + '您好，' + member.name + '加入了' + group.name;
                messageCreate(players[i]._id, title, body);
                if(webFirebaseToken.length > 5){
                    Firebase.cloudMessage(webFirebaseToken, title, body);
                }
                if(androidFirebaseToken.length > 5){
                    Firebase.cloudMessage(androidFirebaseToken, title, body);
                }
            }
        }else{
            const host = group.memberId;
            const webFirebaseToken = host.webFirebaseToken;
            const androidFirebaseToken = host.androidFirebaseToken;
            const title = '申請訊息';
            const body = host.name + '您好，' + member.name + '申請了' + group.name;
            messageCreate(host._id, title, body);
            if(webFirebaseToken.length > 5){
                Firebase.cloudMessage(webFirebaseToken, title, body);
            }
            if(androidFirebaseToken.length > 5){
                Firebase.cloudMessage(androidFirebaseToken, title, body);
            }
        }
        const reGroup = assemblyGroup(group);
        res.json({status: 200, group: reGroup, type: type});
    }
}

//離開此團
const quitGroup = async (req, res, next) => {
    const groupId = req.query.groupId;
    const memberId = req.decoed.memberId;
    const isChecked = await checkVerify(memberId);
    if(isChecked){
        res.json({status: 400, msg:'身份未驗證，請收驗證信'});
        return;
    }

    let group = await Group.find().ByGroupId(groupId);
    const players = group.players;
    let isHost = false;
    if(memberId == group.memberId){
        isHost = true;
    }
    let isPlayers = false;
    for(let i = 0;i < players.length;i++){
        if(players[i] == memberId){
            isPlayers = true;
        }
    }
    const waits = group.waits;
    let isWait = false;
    for(let i = 0;i < waits.length;i++){
        if(waits[i] == memberId){
            isWait = true;
        }
    }
    if(!isPlayers && !isWait){
        res.json({status: 400, msg:'不在此桌遊團'});
        return;
    }
    if(isPlayers){
        const now = group.now - 1;
        await Group.update().delPlayersByMemberId(groupId, memberId, now);
        await Member.update().delGroupsByGroupId(memberId, groupId);
    }
    if(isWait){
        await Group.update().delWaitsByMemberId(groupId, memberId);
        await Member.update().delApplicationsByGroupId(memberId, groupId);
    }
    if(isHost){
        group = await Group.find().ByGroupId(groupId).populate('waits').populate('players').populate('memberId');
        const players = group.players;
        const waits = group.waits;
        const host = group.memberId;
        for(let i = 0; i < players.length;i++){
            const webFirebaseToken = players[i].webFirebaseToken;
            const androidFirebaseToken = players[i].androidFirebaseToken;
            const title = '解散訊息';
            const body = players[i].name + '您好' + host.name + '解散了' + group.name;
            messageCreate(players[i]._id, title, body);
            if(webFirebaseToken.length > 5){
                Firebase.cloudMessage(webFirebaseToken, title, body);
            }
            if(androidFirebaseToken.length > 5){
                Firebase.cloudMessage(androidFirebaseToken, title, body);
            }
        }
        for(let i = 0; i < waits.length;i++){
            const webFirebaseToken = waits[i].webFirebaseToken;
            const androidFirebaseToken = waits[i].androidFirebaseToken;
            const title = '解散訊息';
            const body = host.name + '解散了' + group.name;
            messageCreate(waits[i]._id, title, body);
            if(webFirebaseToken.length > 5){
                Firebase.cloudMessage(webFirebaseToken, title, body);
            }
            if(androidFirebaseToken.length > 5){
                Firebase.cloudMessage(androidFirebaseToken, title, body);
            }
        }
        await Group.remove().delGroupByGroupId(groupId);
    }
    res.json({status: 200})
}

const updateGroup = (req, res, next) => {
    isCheckeSameTime = false;
    groupInfo(req, res, update, isCheckeSameTime);
}
//回覆申請
const applicationReply = async (req, res, next) => {
    const members = req.body.members;
    const agree = req.body.agree;
    const groupId = req.body.groupId;
    let group = await Group.find().ByGroupId(groupId).populate('memberId');
    const tempGroupId = group._id;
    let now = group.now;
    const max = group.max;
    const num = members.length;
    if(agree){
        if(num + now > max){
            res.json({status: 400, msg:'超過上限人數'});
            return;
        }
        for(let i = 0;i < num;i++){
            const member = await Member.find().ByMemberId(members[i].memberId);
            const memberId  = member._id;
            const groups = member.groups;
            groups.push(tempGroupId);
            await Member.update().updateGroupByMemberId(memberId, groups);
            await Member.update().delApplicationsByGroupId(memberId, tempGroupId);
            const players = group.players;
            players.push(memberId);
            now++;
            await Group.update().updateJoinByGroupId(groupId, now, players);
            await Group.update().delWaitsByMemberId(tempGroupId, memberId);
            const webFirebaseToken = member.webFirebaseToken;
            const androidFirebaseToken = member.androidFirebaseToken;
            const title = '申請訊息';
            const body = member.name + '您好，' + group.memberId.name + '答應了您對' + group.name + '的申請';
            messageCreate(member._id, title, body);
            if(webFirebaseToken.length > 5){
                Firebase.cloudMessage(webFirebaseToken, title, body);
            }
            if(androidFirebaseToken.length > 5){
                Firebase.cloudMessage(androidFirebaseToken, title, body);
            }
        }
    }else{
        for(let i = 0;i < num;i++){
            const member = await Member.find().ByMemberId(members[i].memberId);
            const memberId  = member._id;
            await Member.update().delApplicationsByGroupId(memberId, tempGroupId);
            await Group.update().delWaitsByMemberId(tempGroupId, memberId);
            const webFirebaseToken = member.webFirebaseToken;
            const androidFirebaseToken = member.androidFirebaseToken;
            const title = '申請訊息';
            const body = member.name + '您好，' + group.memberId.name + '拒絕了您對' + group.name + '的申請';
            messageCreate(member._id, title, body);
            if(webFirebaseToken.length > 5){
                Firebase.cloudMessage(webFirebaseToken, title, body);
            }
            if(androidFirebaseToken.length > 5){
                Firebase.cloudMessage(androidFirebaseToken, title, body);
            }
        }
    }
    group = await Group.find().ByGroupId(group._id).populate('waits').populate('players').populate('memberId');
    const reGroup = assemblyGroup(group);
    res.json({status: 200, group: reGroup, type: 0});
}
//============================================================================//
const sameTime = async (memberId, newDate, newStart, newEnd) =>{
    const member = await Member.find().ByMemberId(memberId).populate('groups').populate('applications');
    const groups = member.groups;
    let isChecked  = false;
    if(groups){
        for(let i = 0;i < groups.length;i++){
            const oldStartTime =  dateToTime(groups[i].date, groups[i].start);
            const oldEndTime = dateToTime(groups[i].date, groups[i].end);
            const newStartTime = dateToTime(newDate, newStart);
            const newEndTimer = dateToTime(newDate, newEnd);
            if(!((oldEndTime <= newStartTime) || (oldStartTime >= newEndTimer))){
                isChecked =  true;
            }
        }
        return isChecked;
    }else{
        return false;
    }
} 

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

const getLongAndLat = (res, arr, address, callback) => {
    const key = config.googleKey;
    var str = encodeURI(address);
    const url = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + str + '&key=' + key;
    request.get(url, (error, response, body) => {
        callback(res, arr, error, response, body);
    });
}

const groupInfo = async (req, res, fun, isCheckeSameTime) => {
    const memberId = req.decoed.memberId;
    const name = req.body.name;
    const date = req.body.date;
    const city = req.body.city;
    const dist = req.body.dist;
    const address = req.body.address;
    const start = req.body.start;
    const end = req.body.end;
    const min = req.body.min;
    const max = req.body.max;
    const novice = req.body.novice;
    const game = req.body.game;
    let other = req.body.other;
    if(!other){
        other = '';
    }
    let storeName = req.body.storeName
    if(!storeName){
        storeName = '';
    }
    const apply = req.body.apply;
    const groupId = req.body.groupId;
    const require = ['name', 'date', 'city', 'dist', 'address', 'start', 'end', 'min', 'max', 'novice', 'game', 'apply'];
    const optional = ['other', 'groupId', 'storeName'];
    const arr = [memberId, name, date, city, dist, address, start, end, min, max, novice, game, apply, other, groupId, storeName];
    
    //輸入key檢查
    if(NiChecker(req.body, require, optional)){
        res.json({status: 400, msg:'輸入資料不齊全'});
        return;
    }
    //時間檢查
    const today = new Date();
    if(dateToTime(date, end) < dateToTime(date, start) || dateToTime(date, start) < (Number(today) + + 8*60*60*1000)){
        res.json({status: 400, msg:'時間設定錯誤'})
        return;
    }
    //同時開團檢查
    if(isCheckeSameTime){
        const isSameTime = await sameTime(memberId, date, start, end)
        if(isSameTime){
            res.json({status: 400, msg:'不能在相同時段揪兩個桌遊團'})
            return;
        }
    }
    //驗證檢查
    const isChecked = await checkVerify(memberId);
    if(isChecked){
        res.json({status: 400, msg:'身份未驗證，請收驗證信'});
        return;
    }
    //呼叫google api 取得經緯度
    getLongAndLat(res, arr, (city + dist + address), (res ,arr, error, response, body) => {
        if (error) {
            console.log(error);
            res.json({status: 400, msg:'無效的地址'})
        }else{
            if(response.statusCode == 200){
                const js = JSON.parse(body);
                const lat = js.results[0].geometry.location.lat;
                const lng = js.results[0].geometry.location.lng;
                fun(res, arr, lat, lng);
            }else{
                res.json({status: 400, msg:'無效的地址'})
            }
        }
    })
}

const newGroup = async (res ,arr, lat, lng) =>{
    if(arr[9] < arr[8]){
        res.json({status: 400, msg:'現在人數超過上限人數'});
        return;
    }
    const member = await Member.find().ByMemberId(arr[0]);
    const memberId = member._id;
    const group = new Group({
        memberId:memberId,
        name: arr[1],
        date: arr[2],
        city: arr[3],
        dist: arr[4],
        address: arr[5],
        storeName: arr[15],
        lat: lat,
        lng: lng,
        start: arr[6],
        end: arr[7],
        min: arr[8],
        max: arr[9],
        now: arr[8],
        novice: arr[10],
        game: arr[11],
        apply: arr[12],
        other: arr[13],
        players: [memberId],
        playing: false,
        expirationDate: dateToTime(arr[2], arr[7]) - 8*60*60*1000
    })
    group.save().then(async ()=> {
        let group = await Group.find().ByMemberIdAndStartAndEnd(arr[0], arr[2], arr[6], arr[7]);
        const groupId = group._id;
        const path = config.Url + '/group/' + groupId;
        await Group.update().updatePathByGroupId(groupId, path);
        //更新member中的groups
        const groups = member.groups
        groups.push([groupId]);
        await Member.update().updateGroupByMemberId(memberId, groups);
        group = await Group.find().ByGroupId(groupId).populate('players').populate('memberId');
        const reGroup = assemblyGroup(group);
        res.json({status: 200, group: reGroup, type: 0});
    })
}

const update = async (res ,arr, lat, lng) => {
    const name = arr[1];
    const date = arr[2];
    const city = arr[3];
    const dist = arr[4];
    const address = arr[5];
    const storeName = arr[15];
    const start =arr[6];
    const end = arr[7];
    const min = arr[8];
    const max = arr[9];
    const novice = arr[10];
    const game = arr[11];
    const apply = arr[12];
    const other = arr[13];
    const expirationDate = dateToTime(arr[2], arr[7]) - 8*60*60*1000;
    const groupId = arr[14];

    let group = await Group.find().ByGroupId(groupId);
    const oldNow = Number(group.now);
    const oldMin = Number(group.min);
    const now = Number(min) + (oldNow - oldMin);
    if(Number(max) < Number(now)){
        res.json({status: 400, msg: '現在人數超過上限人數'});
        return;
    }
    const tempArr = [name, date, city, dist, address, start, end, min, max, now, novice, game, apply, other, expirationDate, lat, lng, storeName];
    await Group.update().updateAllByGroupId(groupId, tempArr);
    group = await Group.find().ByGroupId(groupId).populate('players').populate('memberId');
    const reGroup = assemblyGroup(group);
    res.json({status: 200, group: reGroup, type: 0});
}

const assemblyGroup = (group) => {
    const players = group.players;
    const waits = group.waits;
    let playerArr = new Array;
    let waitArr = new Array;
    for(let i = 0;i < players.length;i++){
        const player = {
            memberId: players[i]._id,
            name: players[i].name,
            avatarPath: players[i].avatarPath
        }
        playerArr.push(player);
    }
    for(let i = 0;i < waits.length;i++){
        const wait = {
            memberId: waits[i]._id,
            name: waits[i].name,
            avatarPath: waits[i].avatarPath
        }
        waitArr.push(wait);
    }
    const host = {
        memberId: group.memberId._id,
        name: group.memberId.name,
        avatarPath: group.memberId.avatarPath
    }
    const reGroup = {
        _id: group._id,
        players: playerArr,
        waits: waitArr,
        host: host,
        date: group.date,
        city: group.city,
        dist: group.dist,
        address: group.address,
        storeName: group.storeName,
        lat: group.lat,
        lng: group.lng,
        start: group.start,
        end: group.end,
        min: group.min,
        max: group.max,
        now: group.now,
        novice: group.novice,
        game: group.game,
        apply: group.apply,
        overdue: group.overdue,
        other: group.other,
        __v: group.__v,
        path: group.path
    }
    return reGroup;
}


module.exports = {
    create,
    joinGroup,
    quitGroup,
    updateGroup,
    applicationReply
}
