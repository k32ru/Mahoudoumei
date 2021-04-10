
function loadCalenerData(){
  sendMessageMain('ピン留めスプシ' + watchSheetName +' のカレンダーから通知を設定します');
  var sheet = SpreadsheetApp.openById(watchSpreadSheetID).getSheetByName(watchSheetName);
  
  const lastRow = sheet.getLastRow();
  result = [];
  sendMessageMain('情報更新の元となったカレンダーは以下の通りです');
  for(var i = 1 ;i < lastRow+1; i++){
    var workcolumn = sheet.getRange(i,2).getValue();

    if( workcolumn.startsWith('・<a href="https://calendar.google.com/calendar', 1)){
       //前半部分のhttps://calendar.google.com/calendar?cid=を消す。かなり決め打ちで切り出す部分を決めている。
         subPointStart = workcolumn.indexOf('cid=') + 4;//カレンダーIDの始まり文字列
         subPOintEnd = workcolumn.lastIndexOf('"');//HTMLのリンクが閉じる文字列
         Logger.log(subPointStart + ' ' + subPOintEnd);
         var calenderID = workcolumn.substr(subPointStart,subPOintEnd - subPointStart);
         Logger.log(calenderID);
         sendMessageMain(workcolumn.substr(1));
         result.push(calenderID);
    }
  }
  Logger.log(result);
  return result;
}
function DecodeBase64(Base64){
 const dec = Utilities.base64Decode(Base64);
 return Utilities.newBlob(dec).getDataAsString();
}
    
function writeEventData(event,eventType){
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Event");
    var lastRow = sheet.getLastRow();
    lastRow = lastRow + 1;
    if(eventType=='start'){
      sheet.getRange(lastRow, 1).setValue(setTriggerStart(event));
    }else{
      sheet.getRange(lastRow, 1).setValue(setTriggerEnd(event));
    }
    sheet.getRange(lastRow, 2).setValue(eventType);
    sheet.getRange(lastRow, 3).setValue(event.getTitle());
    sheet.getRange(lastRow, 4).setValue(Utilities.formatDate(new Date(event.getStartTime()), "JST", "yyyy/MM/dd (E) HH:mm"));
    sheet.getRange(lastRow, 5).setValue(Utilities.formatDate(new Date(event.getEndTime()), "JST", "yyyy/MM/dd (E) HH:mm"));
}
//スプレッドシートにかかれているイベントトリガー情報等を全部削除する
function clearSpreadSheet(){
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Event");
    const lastRow = sheet.getLastRow();
    //get range row column row column
    sheet.getRange(2,1, lastRow,5).clearContent();
}


function updateCalenderMain(){
  deleteAllEventTrigger();
  clearSpreadSheet();
  var calenderData = loadCalenerData();
  var date = new Date(); 
  var now = new Date(date.getFullYear(),date.getMonth(),date.getDate(),date.getHours(),date.getMinutes());//今から　
  var endday = new Date(date.getFullYear(),date.getMonth(),date.getDate()+33,23,59);//33日後
  for(calenderURL of calenderData){
    //URLから追加できるカレンダーIDをBase64でデコードして
    //xxxxxxxxxxx@group.calendar.google.comのような文字列を得る(これでないとイベント情報を取得できない)
    var calender=CalendarApp.getCalendarById(DecodeBase64(calenderURL)); 
    
    //期間中のイベントを取得する
    const events = calender.getEvents(now, endday);
    
    //イベントデータに対して、スプシに書き込む
    for(const event of events){  
      writeEventData(event,'start');
      writeEventData(event,'end');
      //イベントの通知設定したことをTGに通知する
      title = event.getTitle();
      start = Utilities.formatDate(new Date(event.getStartTime()), "JST", "yyyy/MM/dd (E) HH:mm");
      end = Utilities.formatDate(new Date(event.getEndTime()), "JST", "yyyy/MM/dd (E) HH:mm");
      sendText = `<b>【${title}】の通知が設定されました</b> \n ${start} 〜 ${end} (JST)\n #Calendar`
      sendMessageMain( sendText);
     }
  }
}
    
function loadEventData(triggerUid){
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Event");
    const lastRow = sheet.getLastRow();
    for(var i = 1 ;i < lastRow+1; i++){
       if( sheet.getRange(i,1).getValue() == triggerUid){
           eventData = {type:sheet.getRange(i,2).getValue() ,
                       Title:sheet.getRange(i,3).getValue(),
                       startTime:sheet.getRange(i,4).getValue(),
                       endTime:sheet.getRange(i,5).getValue()}
      Logger.log(eventData)
           return eventData;
     }
  }
    Logger.log('error event data noting ')
}

function getSetedEvent(){
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Event");
    const lastRow = sheet.getLastRow();
    var now = new Date(Utilities.formatDate(new Date(), "JST", "yyyy/MM/dd (E) HH:mm"));//えらくやり方が汚い
    var todayEvent = [];
    for(var i = 1 ;i < lastRow+1; i++){
      if(sheet.getRange(i,2).getValue() == 'start'){
        var eventStartTime = new Date(sheet.getRange(i,4).getValue());
        var eventEndTime = new Date(sheet.getRange(i,5).getValue());      
        if(now.getTime() > eventStartTime.getTime() ){
          Logger.log('today event found')
          setedEvent.push({title:sheet.getRange(i,3).getValue(),start:sheet.getRange(i,4).getValue(),end:sheet.getRange(i,5).getValue()});          
        }
      }
  }
  return todayEvent; 
}

//今行われているイベントを取得する
function getTodayEvent(){
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Event");
    const lastRow = sheet.getLastRow();
    var now = new Date(Utilities.formatDate(new Date(), "JST", "yyyy/MM/dd (E) HH:mm"));//えらくやり方が汚い
    var todayEvent = [];
    for(var i = 1 ;i < lastRow+1; i++){
      if(sheet.getRange(i,2).getValue() == 'start'){
        var eventStartTime = new Date(sheet.getRange(i,4).getValue());
        var eventEndTime = new Date(sheet.getRange(i,5).getValue());      
        if(now.getTime() >= eventStartTime.getTime()  && now.getTime() < eventEndTime.getTime() ){
          Logger.log('today event found')
          todayEvent.push({title:sheet.getRange(i,3).getValue(),start:sheet.getRange(i,4).getValue(),end:sheet.getRange(i,5).getValue(),remainingTime:eventEndTime-now});          
        }
      }
  }
  return todayEvent;
}

function getBossEvent(){
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Event");
    const lastRow = sheet.getLastRow();
    var now = new Date(Utilities.formatDate(new Date(), "JST", "yyyy/MM/dd (E) HH:mm"));//えらくやり方が汚い
    var bossEvent = [];
    for(var i = 1 ;i < lastRow+1; i++){
      var eventName = sheet.getRange(i,3).getValue();
        if (eventName.indexOf('ボス')!==-1){
        if(sheet.getRange(i,2).getValue() == 'start'){
          var eventStartTime = new Date(sheet.getRange(i,4).getValue());
          var eventEndTime = new Date(sheet.getRange(i,5).getValue()); 
          //ボスイベント中は通知しない
          if(now.getTime() < eventStartTime.getTime() ){
          bossEvent.push({title:sheet.getRange(i,3).getValue(),start:sheet.getRange(i,4).getValue(),end:sheet.getRange(i,5).getValue(),remainingTime:eventStartTime-now});
          }          
        }
      }
  }
  return bossEvent;
}

function testBossEvent(){
  Logger.log(getBossEvent());
}

function showDiff(diff2Dates){
  var dDays  = diff2Dates / ( 1000 * 60 * 60 * 24 );  // 日数
  diff2Dates = diff2Dates % ( 1000 * 60 * 60 * 24 );
  var dHour  = diff2Dates / ( 1000 * 60 * 60 );   // 時間
  diff2Dates = diff2Dates % ( 1000 * 60 * 60 );
  var dMin   = diff2Dates / ( 1000 * 60 );    // 分
  remaining = Math.floor(dDays) +  '日'  + Math.floor(dHour) + '時間' + Math.floor(dMin) + '分'
  return remaining;
}
//今行われているイベントを表示する
function showTodayEvent(){
  event = getTodayEvent();

  if(event.length){
    for(e of event){
      Title = e['title'];
      start = e['start'];
      end = e['end'];
      diff= e['remainingTime'];
      sendtext = `<b>現在【${Title}】が行われています　残り時間:${showDiff(diff)}</b> \n${start} 〜 ${end} JST`
      sendMessageMain(sendtext);
    }
     return true;
  }else{
    return false;
  }
}
function showBossStartEvent(){
  event = getBossEvent();

  if(event.length){
    for(e of event){
      Title = e['title'];
      start = e['start'];
      end = e['end'];
      diff= e['remainingTime'];
      sendtext = `<b>【${Title}】開始まで:${showDiff(diff)}</b> \n${start} 〜 ${end} JST　\n `
      sendMessageMain(sendtext);
    }
     return true;
  }else{
    return false;
  }
}

function eventEndMessage(event){
  var eventData = loadEventData(event.triggerUid);
  Title= eventData['Title'];
  start = eventData['startTime'];
  end = eventData['endTime'];
  var tgPostMessage = `<b>【${Title}】が終了しました</b> \n ${start} 〜 ${end} (JST)\n #Calendar`
  sendMessageMain(tgPostMessage);
  sendStickerRandom();
}

function eventStartMessage(event){
  var eventData = loadEventData(event.triggerUid);
  Title= eventData['Title'];
  start = eventData['startTime'];
  end = eventData['endTime'];
  var tgPostMessage = `<b>【${Title}】が始まります</b> \n ${start} 〜 ${end} (JST)\n #Calendar`
  sendMessageMain(tgPostMessage);
  //sendHappyHallowen();
}
//全てのEventトリガーを削除する。
function deleteAllEventTrigger(){
  const triggers = ScriptApp.getProjectTriggers();
  for(const trigger of triggers){
    if(trigger.getHandlerFunction() == "eventStartMessage" ||trigger.getHandlerFunction() == "eventEndMessage" ){
      ScriptApp.deleteTrigger(trigger);
    }
  }
}
function deleteTriggerByUid(triggerUid) {
  if (!ScriptApp.getProjectTriggers().some(function (trigger) {
    if (trigger.getUniqueId() === triggerUid) {
      ScriptApp.deleteTrigger(trigger);
      return true;
    }

    return false;
  })) {
    console.error("Could not find trigger with id '%s'", triggerUid);
  }

  //deleteTriggerArguments(triggerUid);
}
    

function setTriggerStart(event) {
  var now = new Date();
  Logger.log(event.getStartTime());
  Logger.log(now)
  //イベント通知を再作成する時に、過去の通知（イベントの開始通知）は通知(トリガーを作成)しない。既にイベントが終了しているもの(開始・終了共にしている)はこの処理に入らない。
  if(now < event.getStartTime()){
    var setTime = new Date( event.getStartTime());
    setTime.setDate(setTime.getDate())
    setTime.setHours(setTime.getHours());
    setTime.setMinutes(setTime.getMinutes()-15); //開始メッセージは15分前に通知する
    var trigger = ScriptApp.newTrigger('eventStartMessage').timeBased().at(setTime).create();
    var triggerUid = trigger.getUniqueId();
    var Title = event.getTitle();
    var noticeTime = Utilities.formatDate(new Date(setTime), "JST", "yyyy/MM/dd (E) HH:mm z")
    //  var tgPostMessage = `<b>【${Title}】の開始通知が設定されました</b> \n 通知時間：${noticeTime}　\n ※開始通知はイベント開始15分前に通知します。\n #Calendar`
    //  sendMessage(tgPostMessage);
    return triggerUid;
  }else{
    return -1;
  }
}
function setTriggerEnd(event) {
  var setTime = new Date( event.getEndTime());
  var trigger = ScriptApp.newTrigger('eventEndMessage').timeBased().at(setTime).create();
  var triggerUid = trigger.getUniqueId();
  var Title = event.getTitle();
  var noticeTime = Utilities.formatDate(new Date(setTime), "JST", "yyyy/MM/dd (E) HH:mm z")
//  var tgPostMessage = `<b>【${Title}】の終了通知が設定されました</b> \n 通知時間：${noticeTime}\n #Calendar`
//  sendMessageMain(tgPostMessage);
  return triggerUid;
}   