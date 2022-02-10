const Group = require('../models/group');
const findGroup = async (req, res, newxt) => {
    const groups = await Group.find().ByAll();
    if(groups){
        const playing = new Array();
        const recruit = new Array();
        for(i in groups){
            const group = groups[i];
            // const now = (+new Date()) + 8*60*60*1000;
            const start = dateToTime(group.date, group.start);
            const end =  dateToTime(group.date, group.end);
            if(group.playing){
                playing.push([group, end]);
            }else{
                recruit.push([group, start]);
            }
        }
        const playingSrot = quickSort(playing);
        let rePlaying = new Array;
        for(i in playingSrot){
            rePlaying.push(playingSrot[i][0])
        }
        const recruitSrot = quickSort(recruit);
        let reRecruit = new Array;
        for(i in recruitSrot){
            reRecruit.push(recruitSrot[i][0])
        }
        res.json({status: 200, playing: rePlaying, recruit: reRecruit});
    }else{
        res.json({status: 400, msg: '目前沒有桌遊團'});
    }
}

const search = async (req, res, next) => {
    const str = req.query.str;
    const strArr = str.split(' ');
    let arr = new Array;
    for(let i = 0; i < strArr.length;i++){
        const input = await Group.find().ByNameStr(strArr[i]);
        for(let j = 0;j < input.length;j++){
            arr.push(input[j]);
        }
    }
    if(strArr.length > 1){
        arr = checkedRepeat(arr, strArr.length);
    }
    let playing = new Array;
    let recruit = new Array();
    for(i in arr){
        const group = arr[i];
        const start = dateToTime(group.date, group.start);
        const end =  dateToTime(group.date, group.end);
        if(group.playing){
            playing.push([group, end]);
        }else{
            recruit.push([group, start]);
        }
    }
    const playingSrot = quickSort(playing);
    let rePlaying = new Array;
    for(i in playingSrot){
        rePlaying.push(playingSrot[i][0])
    }
    const recruitSrot = quickSort(recruit);
    let reRecruit = new Array;
    for(i in recruitSrot){
        reRecruit.push(recruitSrot[i][0])
    }
    res.json({status: 200, playing: rePlaying, recruit: reRecruit});
}


const webFindGroup = async (req, res, next) => {
    const query = {
         playing: req.body.isPlaying
    }
    const option = {
        page:req.body.page,
        limit: 8,
        sort: { date: 1, start:1}
    }
    const group = await Group.paginate(query, option);
    res.json({status: 200, group: group})
}

const webSearch = async (req, res, next) => {
    const str = req.body.str;
    const strArr = str.split(' ');
    let arr = new Array;
    const page_size = 8;
    const page_numbe = req.body.page;
    const isPlaying = req.body.isPlaying;

    for(let i = 0; i < strArr.length;i++){
        const input = await Group.find().ByNameStr(strArr[i]);
        for(let j = 0;j < input.length;j++){
            arr.push(input[j]);
        }
    }
    if(strArr.length > 1){
        arr = checkedRepeat(arr, strArr.length);
    }

    let playing = new Array;
    let recruit = new Array();
    for(i in arr){
        const group = arr[i];
        const start = dateToTime(group.date, group.start);
        const end =  dateToTime(group.date, group.end);
        if(group.playing){
            playing.push([group, end]);
        }else{
            recruit.push([group, start]);
        }
    }
    const playingSrot = quickSort(playing);
    let rePlaying = new Array;
    for(i in playingSrot){
        rePlaying.push(playingSrot[i][0])
    }
    const recruitSrot = quickSort(recruit);
    let reRecruit = new Array;
    for(i in recruitSrot){
        reRecruit.push(recruitSrot[i][0])
    }
    let temp;
    let total;
    if(isPlaying){
        temp = paginate(rePlaying, page_size, page_numbe);
        total = rePlaying.length;
    }else{
        temp = paginate(reRecruit, page_size, page_numbe);
        total = reRecruit.length;
    }
    const pages = Math.ceil(total / page_size);
    const reGroup = {
        docs: temp,
        total: total,
        limit: page_size,
        page: page_numbe,
        pages: pages
    }
    res.json({status: 200, group: reGroup, });

}

//顯示揪團
const showGroup = async (req, res, next) => {
    const groupId = req.query.groupId;
    const memberId = req.query.memberId;
    let group = await Group.find().ByGroupId(groupId);
    let type;
    if(memberId != 'null'){
        const host = group.memberId;
        const players = group.players;
        const waits = group.waits;
        if(memberId == host){
            type = 0;
        }else if(players.includes(memberId)){
            type = 1;
        }else if(waits.includes(memberId)){
            type = 2;
        }else{
            type = 3;
        }
    }else{
        type = 4;
    }
    group = await Group.find().ByGroupId(groupId).populate('waits').populate('memberId').populate('players');
    if(group){
        const reGroup = assemblyGroup(group);
        res.json({status: 200, group: reGroup, type: type});
    }else{
        res.json({status: 400, msg: '查無此團'})
    }
}

// ====================================================

const quickSort = (arr) => {
    const swap = (array, i , j) => {
      [array[i], array[j]] = [array[j], array[i]];
    }
    const partition = (array, start, end) => {
      let splitIndex = start + 1;
      for (let i = start + 1; i <= end; i++) {
        if (array[i][1] < array[start][1]) {
          swap(array, i, splitIndex);
          splitIndex++;
        }
      }
    
      // 記得把 pivot 跟最後一個比它小的元素互換
      swap(array, start, splitIndex - 1);
      return splitIndex - 1;
    }
    const _quickSort = (array, start, end) => {
      if (start >= end) return array;
    
      // 在 partition 裡面調整數列，並且回傳 pivot 的 index
      const middle = partition(array, start, end);
      _quickSort(array, start, middle - 1);
      _quickSort(array, middle + 1, end);
      return array;
    };
    return _quickSort(arr, 0, arr.length - 1);
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

const checkedRepeat = (input, num) => {
    let output = new Array;
    let hash1 = new HashMap();
    for(let i = 0; i < input.length;i++){
        if(hash1.containsKey(input[i]._id)){
            const value = hash1.get(input[i]._id)[1] + 1;
            hash1.put(input[i]._id,[i, value]);
        }else{
            hash1.put(input[i]._id,[i, 1]);
        }
    }
    for(i in hash1.getObj()){
        const index = hash1.get(i)[0];
        const value = hash1.get(i)[1]; 
        if(value == num){
            output.push(input[index]);
        }
    }
    return output;
}

const paginate = (array, page_size, page_number) => {
    --page_number;
    return array.slice(page_number * page_size, (page_number + 1) * page_size);
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
        name : group.name,
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

var HashMap = function(){  
    //定义长度  
    var length = 0;  
    //创建一个对象  
    var obj = new Object(); 
    /** 
    * 判断Map是否为空 
    */  
    this.isEmpty = function(){  
        return length == 0;  
    };  

    /** 
    * 判断对象中是否包含给定Key 
    */  
    this.containsKey=function(key){  
        return (key in obj);  
    };  

    /** 
    * 判断对象中是否包含给定的Value 
    */  
    this.containsValue=function(value){  
        for(var key in obj){  
            if(obj[key] == value){  
                return true;  
            }  
        }  
        return false;  
    };  

    /** 
    *向map中添加数据 
    */  
    this.put=function(key,value){  
        if(!this.containsKey(key)){  
            length++;  
        }  
        obj[key] = value;  
    };  

    /** 
    * 根据给定的Key获得Value 
    */  
    this.get=function(key){  
        return this.containsKey(key)?obj[key]:null;  
    };  

    /** 
    * 根据给定的Key删除一个值 
    */  
    this.remove=function(key){  
        if(this.containsKey(key)&&(delete obj[key])){  
            length--;  
        }  
    };  

    /** 
    * 获得Map中的所有Value 
    */  
    this.values=function(){  
        var _values= new Array();  
        for(var key in obj){  
            _values.push(obj[key]);  
        }  
        return _values;  
    };  

    /** 
    * 获得Map中的所有Key 
    */  
    this.keySet=function(){  
        var _keys = new Array();  
        for(var key in obj){  
            _keys.push(key);  
        }  
        return _keys;  
    };  

    /** 
    * 获得Map的长度 
    */  
    this.size = function(){  
        return length;  
    };
    this.getObj = function(){
        return obj;
    }  

    /** 
    * 清空Map 
    */  
    this.clear = function(){  
        length = 0;  
        obj = new Object();  
    };  
}  

module.exports = {
    findGroup,
    search,
    webFindGroup,
    webSearch,
    showGroup
}