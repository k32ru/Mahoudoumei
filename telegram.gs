function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}
function test(){
  sendSticker(globalChatIdMain,'CAACAgIAAxkBAAEBhEVfm_nLsOOf6_9cCcBIaNvKY2rL8QACVgADHwFMFQ8zjRozxUnaGwQ');
}
function sendHappyNewYear(){
  //https://stackoverflow.com/questions/52765833/why-i-cant-send-sticker-by-its-id
  
  var token = globalYuzukiToken // WPHONotice
  var telegramUrl = "https://api.telegram.org/bot" + token;
  var id = globalChatIdMain 
  var sticker = 'CAACAgIAAxkBAAEBu-Nf7cpUNpd94lBMj6F2es7WjoeI0AACMQADwZxgDMYOMqCLWnWlHgQ';
  var url = telegramUrl + "/sendSticker?chat_id=" + id + '&sticker='+ sticker;
  var response = UrlFetchApp.fetch(url);
}
function sendSticker(chatId,stickerID){
  //https://stackoverflow.com/questions/52765833/why-i-cant-send-sticker-by-its-id
  
  var token = globalYuzukiToken // WPHONotice
  var telegramUrl = "https://api.telegram.org/bot" + token;
  var url = telegramUrl + "/sendSticker?chat_id=" + chatId + '&sticker='+ stickerID;
  var response = UrlFetchApp.fetch(url);
}

function sendStickerRandom(){
  //https://stackoverflow.com/questions/52765833/why-i-cant-send-sticker-by-its-id
  
  var token = globalYuzukiToken // WPHONotice
  var telegramUrl = "https://api.telegram.org/bot" + token;
  var id = globalChatIdMain 
  var stickers = ['CAACAgUAAxkBAAEBgG5fltaQTfABGzUUgZQnRQ3SZL8QVQACTgAD02EhJ4khVQYGM1-_GwQ','CAACAgUAAxkBAAEBgG9fltaTJakv9z-VB0UJ5fl0J1Hq5gACUgAD02EhJ0JnsR72I5yEGwQ','CAACAgUAAxkBAAEBgGxfltOVUfiEM1XY15hiraH6E-vrxgACRgAD02EhJ3j3lOK-lzn3GwQ']
  var rand = getRandomInt(3);
  var sticker = stickers[rand];
  var url = telegramUrl + "/sendSticker?chat_id=" + id + '&sticker='+ sticker;
  var response = UrlFetchApp.fetch(url);
}



// send to telegram
function testSendMessage(){
  sendMessage('test message from gas')
}

function sendMessage(postMessage) {
  // 以下2行は自分の環境に合わせて設定してください
  var chatId= globalChatId
  var token=globalYuzukiToken

  sendTelegram(chatId, postMessage, token);

}
function sendMessageMain(postMessage) {
  // 以下2行は自分の環境に合わせて設定してください
  var chatId= globalChatIdMain
  var token=globalYuzukiToken

  sendTelegram(chatId, postMessage, token);

}
function sendDebugMessage(postMessage) {
  // 以下2行は自分の環境に合わせて設定してください
  var chatId= globalChatId
  var token=globalYuzukiToken

  sendTelegram(chatId, postMessage, token);

}
function sendTelegram(chatId, text, token) {
  var payload = {
    'method': 'sendMessage',
    'chat_id': chatId,
    'text': text,
    'parse_mode': 'HTML'
  }
  var data = {
    'method': 'post',
    'payload': payload
  }
  UrlFetchApp.fetch('https://api.telegram.org/bot' + token + '/', data);
}