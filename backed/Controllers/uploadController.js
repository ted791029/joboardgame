const config = require('../config');
const Member = require('../models/member');
const checkVerify = require('../utils/Verify');

const uploadAvatar = async (req, res, next) => {
    const memberId = req.decoed.memberId;
    const isChecked = await checkVerify(memberId);
    if(isChecked){
        res.json({status: 400, msg:'身份未驗證，請收驗證信'});
        return;
    }
    if(!req.file) {
        res.json({status: 400, msg: '輸入資料不齊全'});
    }else{
        let filePath = config.urlRoot + 'uploads/avatar/' + req.imgName;
        await Member.update().avatarByMemberId(memberId, filePath) ;
        res.json({status: 200, msg: {filePath: filePath}});
    }
}

module.exports = {
    uploadAvatar
}