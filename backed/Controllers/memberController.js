const Member = require('../models/member');
const NiChecker = require('../utils/Checker');
const checkVerify = require('../utils/Verify');


const showMember = async (req, res, next) => {
    if(req.query.memberId){//!?
        const member = await Member.find().ByMemberId(req.query.memberId);
        if(member){
            const name = member.name;
            const avatarPath = member.avatarPath;
            const introduction = member.introduction;
            const game = member.game;
            const info = {name: name, avatarPath: avatarPath, introduction: introduction, game: game};
            res.json({status: 200, info: info});
        }else{
            res.json({status: 400, msg:'查看失敗'});
        }
        // }
    }else{
        const member = await Member.find().ByMemberId(req.decoed.memberId);
        if(member){
            res.json({status: 200, member: member});
        }else{
            res.json({status: 400, msg:'查看失敗'});
        }
    }
}

const updateMember = async (req, res, next) =>{
    const name = req.body.name;
    const password = req.body.password;
    const birthday = req.body.birthday;
    const gender = req.body.gender;
    const firstContact = req.body.firstContact;
    const introduction = req.body.introduction;
    const game = req.body.game;
    const memberId = req.decoed.memberId;
    let member = await Member.find().ByMemberId(memberId);
    const type = member.type;
    let require;
    let optional;
    if(type === 0){
        require = ['name', 'password', 'birthday', 'gender'];
        optional = ['firstContact', 'introduction', 'game'];
        if(NiChecker(req.body, require, optional)){
            res.json({status: 400, msg:'輸入資料不齊全'});
            return;
        }
        if(checkPassword(res, password)){
            return;
        }
    }else{
        require = ['name', 'birthday', 'gender'];
        optional = ['firstContact','password', 'introduction', 'game'];
        if(NiChecker(req.body, require, optional)){
            res.json({status: 400, msg:'資料輸入不齊全'});
            return;
        }
    }
    const isChecked = await checkVerify(memberId);
    if(isChecked){
        res.json({status: 400, msg:'身份未驗證，請收驗證信'});
        return;
    }
    const arr = [name, password, birthday, gender, firstContact, introduction, game];
    const update = await Member.update().allByMemberId(memberId, arr);
    if(update.err){
        res.json({status: 400, msg:'桌遊團資料更新失敗'});
    }else{
        member = await Member.find().ByMemberId(memberId)
        res.json({status: 200, member: member});
    }

}

const showMyGroups = async (req, res, next) => {
    const memberId = req.decoed.memberId;
    let member = await Member.find().ByMemberId(memberId).populate('groups').populate('applications');
    if(member){
        await updateGroup_App(req, member);
        member = await Member.find().ByMemberId(memberId).populate('groups').populate('applications');
        const groups = member.groups;
        const reGroup = sortGroup(groups, memberId);
        const applications = member.applications;
        const reApplications = sortApplications(applications);
        res.json({status: 200, groups: reGroup, applications: reApplications});
    }else{
        res.json({status: 400, msg: '目前沒有揪團'});
    }
}

//============================================================================//
const checkPassword = (res, password) => {
    //檢查密碼長度 < 6
    if(password.length < 6){
        res.json({status: 400, msg:'密碼長度必須大於6位'});
        return true;
    }
    //檢查密碼是否包含英文
    const passwordArr = password.split('');
    let isHaveE  = true;
    for(let i = 0; i < passwordArr.length;i++){
        if((passwordArr[i].charCodeAt() >= 65 &&  passwordArr[i].charCodeAt() <= 90) || (passwordArr[i].charCodeAt() >= 97 && passwordArr[i].charCodeAt() <= 122)){
            isHaveE  = false;
        }
    }
    if(isHaveE){
        res.json({status: 400, msg:'密碼必須包含英文'});
        return true;
    }
}

const updateGroup_App = async (req, member) => {
    //更新member中的group
    const groups = member.groups;
    let playerArr  = new Array;
    for(let i = 0;i < groups.length;i++){
        playerArr.push(groups[i]._id);
    }
    await Member.update().updateGroupByMemberId(req.decoed.memberId, playerArr);
    //更新member中的applications
    const applications = member.applications;
    let appArr = new Array;
    for(let i = 0;i < applications.length;i++){
        appArr.push(applications[i]._id);
    }
    await Member.update().updateApplicationByMemberId(req.decoed.memberId, appArr);
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

const sortGroup = (groups, memberId) => {
    let reGroups = new Array;
    let isHost = new Array;
    let notHost = new Array;
    for(let i = 0;i < groups.length;i++){
        const time = dateToTime(groups[i].date,  groups[i].start);
        const address = groups[i].city
        if(groups[i].memberId == memberId){
            isHost.push({groupId: groups[i]._id, name: groups[i].name, date: groups[i].date, start: groups[i].start , city: groups[i].city, dist: groups[i].dist, address: groups[i].address, storeName: groups[i].storeName, now: groups[i].now, max: groups[i].max, time : time, host: true});
        }else{
            notHost.push({groupId: groups[i]._id, name: groups[i].name, date: groups[i].date, start: groups[i].start ,  city: groups[i].city, dist: groups[i].dist, address: groups[i].address, storeName: groups[i].storeName, now: groups[i].now, max: groups[i].max, time : time, host: false});
        }
    }
    isHost.sort(function(a, b) {
        return a.time - b.time;
    });
    notHost.sort(function(a, b) {
        return a.time - b.time;
    });
    for(let i = 0;i < isHost.length;i++){
        reGroups.push(isHost[i]);
    }
    for(let i = 0;i < notHost.length;i++){
        reGroups.push(notHost[i]);
    }
    return reGroups;
}

const sortApplications = (applications) => {
    let reApplications = new Array;
    for(let i = 0; i < applications.length;i++){
        const time = dateToTime(applications[i].date,  applications[i].start);
        reApplications.push({groupId: applications[i]._id, name: applications[i].name, date: applications[i].date, start : applications[i].start ,  city: applications[i].city, dist: applications[i].dist, address: applications[i].address, storeName: applications[i].storeName, now: applications[i].now, max: applications[i].max,time : time});
    }
    reApplications.sort(function(a, b) {
        return a.time - b.time;
    });
    return reApplications;
}

module.exports = {
    showMember,
    updateMember, 
    showMyGroups
}