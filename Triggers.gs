var MAXTRIGGERS=20;//GASのトリガーの最大値は20個
var MAXRETRIESTRIGGERS=5; //トリガーをセットするときに失敗場合の最大試行回数
var RETRYWAITSEC = 20;//トリガーセットが失敗した場合に再試行するまでに何秒待つか

function countTriggers(){
  const triggers = ScriptApp.getProjectTriggers();
  Logger.log(triggers.length);
  
}

function setTriggerWithRETRY(setTime,eventName){
  var e;
  var retry_count=1;
  var triggerUid;
  while(true){
    try{
      var trigger = ScriptApp.newTrigger(eventName).timeBased().at(setTime).create();
      triggerUid = trigger.getUniqueId();
      break;
    }catch(error){
      e = error;
      if(retry_count>=MAXRETRIESTRIGGERS) break;
      Utilities.sleep(RETRYWAITSEC * 1000);//再試行するまで待つ
    }
    retry_count++;
  }
  if(e && retry_count>=MAXRETRIESTRIGGERS){ //5回試行してダメなら通知する。
    GmailApp.sendEmail(Session.getEffectiveUser().getEmail(),"Trigger set failed",printError(e)); 
    sendMessage("@k32ru help me!\n" + printError(e));
    return -1;
  }
  return triggerUid;
}

function printError(e){
  return "[名前] " + e.name + "\n" +
         //"[場所] " + e.fileName + "(" + e.lineNumber + "行目)\n" +
         "[メッセージ]" + e.message + "\n" +      
         "[StackTrace]\n" + e.stack;
}
