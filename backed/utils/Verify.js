const Member = require('../models/member');

const checkVerify = async (memberId) => {
    const member = await Member.find().ByMemberId(memberId);
    if(member){
        const isCheck = !member.verify;
        return isCheck;
    }else{
        return true;
    }

}

module.exports = checkVerify;