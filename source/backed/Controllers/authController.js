const NiChecker = require('../utils/Checker');
const { Resolver } = require('dns').promises; //驗證dns庫
const resolver = new Resolver();
const Member = require('../models/member');
const jwt = require('jsonwebtoken');
const config = require('../config');
const mailController = require('../Controllers/mailController');
const request = require('request');

const register = async (req, res, next) => {
    const require = ['name', 'account', 'password','userToken','type'];
    if(NiChecker(req.body, require)){
        res.json({status: 400, msg:'資料輸入不齊全'});
        return;
    }
    const name  = req.body.name;
    const account = req.body.account;
    const password = req.body.password;
    const type = req.body.type;
    const userToken = req.body.userToken;
    if(await Member.find().ByAccount(account) != undefined){
        res.json({status: 400, msg:'已經註冊'})
        return;
    }
    if(await checkAccount(res, account), checkPassword(res, password)){
        return;
    }
    let webFirebaseToken;
    let androidFirebaseToken;
    if(type == 0){
        webFirebaseToken = userToken;
        androidFirebaseToken = '';
    }else{
        webFirebaseToken = '';
        androidFirebaseToken = userToken;
    }
    const member = new Member({
        name: name,
        account: account,
        password: password,
        birthday: '',
        gender: -1,
        firstContact: '',
        verify: false,
        avatarPath: 'http://35.221.163.65/uploads/avatar/User -1.png',
        type: 0,
        groups: [],
        applications: [],
        introduction: '',
        webFirebaseToken: webFirebaseToken,
        androidFirebaseToken: androidFirebaseToken
    })
    member.save().then(async () => {
        const member = await Member.find().ByAccount(account);
        const memberId = member._id;
        const avatarPath = member.avatarPath;
        const verify = member.verify;
        const name = member.name;
        let token = jwt.sign({account: account, name: name, memberId: memberId},config.jwtSalt,{
            expiresIn: 60*60*24});
        req.decoed = {memberId: memberId, register: true, token:token, account: account, name: name, avatarPath: avatarPath, verify: verify};
        mailController.sendMail(req, res, next);
    });
}

const login = async (req, res, next) => {
    const require = ['account', 'password','userToken','type'];
    if(NiChecker(req.body, require)){
        res.json({status: 400, msg:'輸入資料不齊全'});
        return;
    }
    const account = req.body.account;
    const password = req.body.password;
    const type = req.body.type;
    const userToken = req.body.userToken;
    const member = await Member.find().ByAccountAndPassword(account, password);
    if( member === null){
        res.json({status: 400, msg:'帳號或密碼錯誤'});
    }else{
        const avatarPath = member.avatarPath;
        const verify = member.verify;
        const name = member.name;
        const memberId = member._id;
        if(type == 0){
            await Member.update().webFirebaseTokenByMemberId(memberId, userToken);
        }else{
            await Member.update().androidFirebaseTokenByMemberId(memberId, userToken);
        }
        let token = jwt.sign({account: member.account, name: member.name, memberId: memberId},config.jwtSalt,{
            expiresIn: 60*60*24});
        res.json({status: 200, token: token, memberId: memberId, name: name, avatarPath: avatarPath, verify: verify});
    }
}

const fbLogin = async (req, res, next) =>{
    const require = ['userToken','type'];
    if(NiChecker(req.body, require)){
        res.json({status: 400, msg:'資料輸入不齊全'});
        return;
    }
    getAccessToken(req, res, (req, res, error, response, body) => {
        if(error){
            console.log(error);
        }else{
            if(response.statusCode == 200){
                const input_token = req.headers['input_token'];
                const access_token = JSON.parse(body).access_token;
                const url = 'https://graph.facebook.com/debug_token?input_token=' + input_token + '&access_token=' + access_token;
                //傳fb token 確認是否有效
                request.get(url, (error, response, body) => {
                    if(error){
                        console.log(error);
                        res.json({status: 400, msg: 'FB驗證失敗'});
                    }else{
                        if(response.statusCode == 200){
                            const user_id = JSON.parse(body).data.user_id;
                            //取得user_id 傳回fb取得使用者資料
                            getFbData(req, res ,user_id, access_token, (req, res, error, response, body) => {
                                if(error){
                                    console.log(error);
                                    res.json({stauts: 400, msg: '無法拿取FB資料'});
                                }else{
                                    if(response.statusCode == 200){
                                        fbRegister(req, res, JSON.parse(body).id, JSON.parse(body).name, JSON.parse(body).picture.data.url);
                                    }else{
                                        console.log(body);
                                        res.json({status: 400, msg: '無法拿取FB資料'});
                                    }
                                }
                            });
                        }else{
                            console.log(body);
                            res.json({status: 400, msg: 'FB驗證失敗'});
                        }
                    }
                });       
            }else{
                console.log(response.statusCode);
            }
        }
    });
}

const verify = async (req, res, next) =>{
    let token = req.query.token;
    let isChecked = false;
    let decoedMember;
    if(token){
        jwt.verify(token, config.jwtSalt, (err, decoed)=>{
            if(err){
                res.redirect(301 ,config.Url+ '?verify=false&msg=Invalid verify');

            }else{
                decoedMember = decoed;
                isChecked = true;
            }
        })
        if(isChecked){
            let member = await Member.update().verifyByMemberId(decoedMember.memberId);
            if(member.err){
                console.log(err)
                res.redirect(301 ,config.Url + '?verify=false&msg=Invalid verify');
            }else{
                res.redirect(301 ,config.Url + '?verify=true&msg=sucess');
            }
        }
    }else{
        res.redirect(301 ,config.Url + '?verify=false&msg=No token');
    }
}

const forget = async (req, res, next) => {
    const account = req.body.account;
    const require = ['account'];
    if(NiChecker(req.body, require)){
        res.json({status: 400, msg:'輸入資料不齊全'});
        return;
    }
    const member =  await Member.find().ByAccount(account);
    if(member){
        const memberId = member._id;
        req.decoed = {memberId: memberId, forget: true, account: account};
        mailController.sendMail(req, res, next);
    }else{
        res.json({staus: 400, msg:'無效的email'});
    }
}

const rePassword = async (req, res, next) =>{
    let token = req.headers['x-access-token'];
    let password = req.body.password;
    let isChecked = false;
    let decoedMember;
    if(checkPassword(res, password)){
        return;
    }
    if(token){
        jwt.verify(token, config.jwtSalt,(err, decoed)=>{
            if(err){
                res.json({status: 400, msg:'驗證失敗'});
            }else{
                decoedMember = decoed;
                isChecked = true;
            }
        })
        if(isChecked){
            let member = await Member.update().passwordByMemberId(decoedMember.memberId, password);
            if(member.err){
                console.log(err)
                res.json({status: 400, msg: '無法更新密碼'});
            }else{
                res.json({status: 200, msg: '成功更新密碼'});
            }
        }
    }else{
        res.json({status: 400, msg:'沒有token'});
    }
}

const chenckToken = async (req, res, next) => {
    let token = req.headers['x-access-token'];
    if(token){
        jwt.verify(token, config.jwtSalt, (err, decoed) => {
            if(err){
                res.json({status: 400, msg:'無效token'});
            }else{
                req.decoed = decoed;
                next();
            }
        })
    }else{
        res.json({status: 400, msg:'沒有token'});
    }
};

const checkVerify = async (req, res , next) =>{
    const member = await Member.find().ByMemberId(req.decoed.memberId);
    if(member){
        if(!(member.verify)){
            res.json({status: 400, msg:'身份未驗證，請收驗證信'});
        }else{
            next();
        }
    }else{
        res.json({status: 400, msg:'無此會員'});
    }
}

const checkAccount = async (res, account) => {
    //檢查email格式
    const regExp = /^[a-zA-Z0-9._-]+@([a-zA-z0-9]+[.]){1,2}[a-zA-z0-9]+[a-zA-Z]$/;
    if(account.length > 256 || account.match(regExp) === null){
        res.json({status: 400, msg:'Invalid email'});
        return true;
    }
    const host  = account.split('@')[1];
    let mx;
    try{
        mx = await resolver.resolveMx(host)
    }
    catch{
        res.json({status: 400, msg:'無效的email'});
        return true;
    }
    return false;
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
        res.json({status: 400, msg:'密碼必須包含英文字母'});
        return true;
    }
}

const getAccessToken = (req, res, callback) =>{
    const id = '490724168342839';
    const secret ='f478a3291d90dad4ba252f8f564c70b2';
    const type = 'client_credentials';
    const url = 'https://graph.facebook.com/oauth/access_token?client_id='+ id +'&client_secret=' + secret +'&grant_type=' + type;
    request.get(url, (error, response, body) => {
       callback(req, res, error, response, body);
    });
}

const getFbData = (req, res, user_id, access_token, callback)=> {
    const url = 'https://graph.facebook.com/'+ user_id +'?fields=name,picture.type(large)&access_token='+ access_token;
    request.get(url, (error, response, body) => {
        callback(req, res, error, response, body);
     });
}

const fbRegister= async (req, res, id, name, picturePath) => {
    const member = await Member.find().ByAccount(id);
    const account = id;
    const type = req.body.type;
    const userToken = req.body.userToken
    if(member){
        const avatarPath = member.avatarPath;
        const verify = member.verify;
        const memberId = member._id;
        const name = member.name;
        if(type == 0){
            await Member.update().webFirebaseTokenByMemberId(memberId, userToken);
        }else{
            await Member.update().androidFirebaseTokenByMemberId(memberId, userToken);
        }
        const token = jwt.sign({account: account, name: name, memberId: memberId},config.jwtSalt,{
            expiresIn: 60*60*24});
        res.json({status: 200, token: token, memberId:memberId, name: name, avatarPath: avatarPath, verify: verify});
    }else{
        let webFirebaseToken;
        let androidFirebaseToken;
        if(type == 0){
            webFirebaseToken = userToken;
            androidFirebaseToken = '';
        }else{
            webFirebaseToken = '';
            androidFirebaseToken = userToken;
        }
        const member = new Member({
            name: name,
            account: id,
            password: '',
            birthday: '',
            gender: -1,
            firstContact: '',
            verify: true,
            avatarPath: picturePath,
            type: 1,
            groups: [],
            applications: [],
            introduction: '',
            webFirebaseToken: webFirebaseToken,
            androidFirebaseToken: androidFirebaseToken
        })
        member.save().then(async () => {
            const member = await Member.find().ByAccount(account);
            const memberId = member._id;
            const name = memberId.name;
            const avatarPath = member.avatarPath;
            const verify = member.verify;
            const token = jwt.sign({account: account, name: name, memberId: memberId},config.jwtSalt,{
                expiresIn: 60*60*24});
            res.json({status: 200, token: token, memberId: memberId, name: name, avatarPath: avatarPath, verify: verify});
        });
    }
}

module.exports = {
    forget,
    verify,
    rePassword,
    chenckToken,
    register,
    login,
    checkVerify,
    fbLogin
}

