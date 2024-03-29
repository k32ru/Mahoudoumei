 
function delTriggerOpenGift() {
  const triggers = ScriptApp.getProjectTriggers();
  for(const trigger of triggers){
    if(trigger.getHandlerFunction() == "openGiftMesage"){
      ScriptApp.deleteTrigger(trigger);
    }
  }
}

function delTriggerDailyEvent() {
  const triggers = ScriptApp.getProjectTriggers();
  for(const trigger of triggers){
    if(trigger.getHandlerFunction() == "StartDailyEvent"){
      ScriptApp.deleteTrigger(trigger);
    }
  }
}

function setTriggerOpenGift() {
 var setTime = new Date();
  setTime.setDate(setTime.getDate()+1 )
  setTime.setHours(23);
  setTime.setMinutes(45); 
  setTriggerWithRETRY(setTime,'openGiftMesage');
}

function setTriggerDailyEvent() {
 var setTime = new Date();
  setTime.setDate(setTime.getDate()+1)
  setTime.setHours(00);
  setTime.setMinutes(00); 
   setTriggerWithRETRY(setTime,'StartDailyEvent');
}

function openGiftMesage(){
  // this message post at 23:45 every day.
  sendMessageMain('<b>【通知】ギフト開封期限</b>\nもうすぐ日付が変わります\nギフトの開封を忘れずに！\n#時刻 #ギフト開封期限' );
  delTriggerOpenGift();//無効なトリガーを削除
  setTriggerOpenGift();//改めて次の時間のをセット
}

function StartDailyEvent(){
  //this message post at 00:00 every day.
  sendMessageMain('<b>【通知】デイリーイベント時刻</b>\nデイリーイベントが始まりました\nアプリの再起動を忘れずに！\n#時刻 #デイリーイベント');
  showTodayEvent();//現在設定されているイベントがあれば通知する。
  showBossEvent('start');//ボスインベントについてあれば通知する。ボスインベント中は通知しない。
  delTriggerDailyEvent();//無効なトリガーを削除
  setTriggerDailyEvent();//改めて次の時間のをセット
}
 
 