
function setWebhook() {
  var telegramUrl = "https://api.telegram.org/bot" + globalYuzukiToken;
  var url = telegramUrl + "/setWebhook?url=" + webAppUrl;
  var response = UrlFetchApp.fetch(url);
  Logger.log(response.getContentText());
}
function delWebhook() {
　var telegramUrl = "https://api.telegram.org/bot" + globalYuzukiToken;
  var url = telegramUrl + "/deleteWebhook?url=" + webAppUrl;
  var response = UrlFetchApp.fetch(url);
  Logger.log(response.getContentText());
}


function sendText(id,text) {
  var url = telegramUrl + "/sendMessage?chat_id=" + id + "&text=" + text;
  var response = UrlFetchApp.fetch(url);
  Logger.log(response.getContentText());
}

function deleteAfterAt(str){
  var point = str.indexOf("@");
  if(point>0){
    return str.substring(0,point);
  }else{
    return str;
  }
}


function doPost(e) {
  //  //debug doPostでデータを受け取れているのかのテスト
  var update = JSON.parse(e.postData.contents);
  GmailApp.sendEmail(Session.getEffectiveUser().getEmail(),"Message send to bot",JSON.stringify(update,null,4)); 
  if (update.hasOwnProperty('message')) {
    var msg = update.message;
    var chatId = msg.chat.id;
    var command = deleteAfterAt(msg.text);
    //BOTへのコマンドメッセージかつメインチャンネルでの発言しか受け付けない。
    if (msg.hasOwnProperty('entities') &&　msg.entities[0].type == 'bot_command'&& chatId == globalChatIdMain) {
         if (command == '/eventnow') {
          if(!showTodayEvent()){ sendMessageMain('現在行われているイベントは有りません。')};
        }
        if (command == '/eventupdate') {
          updateCalenderMain();       
        }
        //ボスインベントの情報を表示する
        if (command == '/eventboss') {
          showBossEvent('now')
        }

         if (command == '/eventhelp') {
            var helpMesage = '- eventnow 現在行われているイベントを表示します。\n - eventupdate 登録されているカレンダーから情報を読み込み通知を再作成します。\n -eventboss 登録されているボスイベントの開始までの時間を表示します。\n - eventhelp この内容を表示します。';
            sendMessageMain(helpMesage);
        }
  }
  }
}
