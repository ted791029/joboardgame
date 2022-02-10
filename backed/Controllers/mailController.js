const jwt = require('jsonwebtoken')
const config = require('../config')
const nodemailer = require('nodemailer');

const sendMail = (req, res, next) => {
    const avatarPath = req.decoed.avatarPath;
    const verify = req.decoed.verify;
    const name = req.decoed.name;
    const memberId = req.decoed.memberId;
    let token = jwt.sign({memberId: memberId},config.jwtSalt,{
        expiresIn: 60*60*24});
    let html;
    if(req.decoed.forget){
        html = '<h2>您好！！</h2> <p>請點擊<a href="http://35.221.163.65:3000/api/auth/rePassword?password=a12345678&token=' + token + 
        '" title="Lorem ipsum - Wikipedia, the free encyclopedia">這裡</a> ，設定新的密碼</p>';
    }else{
        html = '<h2>您好！！</h2> <p>歡迎加入揪桌遊驗證請點擊<a href="http://35.221.163.65:3000/api/auth/verify?token=' + token + 
        '" title="Lorem ipsum - Wikipedia, the free encyclopedia">這裡</a> ，謝謝您的支持</p>';
    }
    //宣告發信物件
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'juboardgame@gmail.com',
            pass: 'd86843555'
        }
    });
    const options = {
        //寄件者
        from: 'juboardgame@gmail.com',
        //收件者
        to: req.decoed.account,
        //副本
        cc: '',
        //密件副本
        bcc: '',
        //主旨
        subject: '這是揪桌遊的驗證信', // Subject line
        //純文字
        // text: 'http://35.221.163.65:3000' + router + token, // plaintext body
        html: html
    };
    //發送信件方法
    transporter.sendMail(options, function(error, info){
        if(error){
            res.json({status: 400, msg: 'Mail fail' + error});
        }else{
            if(req.decoed.register){
                res.json({status: 200, msg:'請到信箱收信', token: req.decoed.token, memberId: memberId, name: name, avatarPath: avatarPath, verify: verify});
            }else if(req.decoed.forget){
                res.json({status: 200, msg:'請到信箱收信'});
            }else{
                res.json({status: 200, msg: 'Mail sucess: ' + info.response});
            }
        }
    });
}

module.exports = {
    sendMail
}