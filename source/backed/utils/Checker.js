const NiCheker = (body, require, optional) => {
    let requireNum = 0;
    let optionalNum =0;
    let sum = 0;
    console.log(body);
    console.log(require);
    for(i in body){
        if(body[i].length == 0){
            if(optional && optional.includes(i)){
                optionalNum++;
            }else{
                return true;
            }
        }
        if(require.includes(i)){
            requireNum++;
        }else if(optional != undefined && optional.includes(i)){
            optionalNum++;
        }
        sum++;
    }
    if(requireNum < require.length){
        return true;
    }
    if(requireNum + optionalNum < sum){
        return true;
    }
    return false;
}

module.exports = NiCheker;