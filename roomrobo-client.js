const talk = require('./talk');
const io_client = require('socket.io-client');
const client_socket = io_client('http://asm-server.local:3090');

const speechs = [ "どうしましたか？",
                  "おトイレ行きたいですか？",
                  "お腹が空きましたか？",
                  "今日は、お外は寒いですよ？",
                  "今おトイレはいっぱいですよ，ちょっと待ってください？",
                  "介護士さんを呼びましょうか？",
                ]

var talk_state = false; // ロボットの状態．喋るかどうか

client_socket.on('connect', () => {
  console.log('connected');
});

client_socket.on('sheet', (sheetData) => {
  for (let key of Object.keys(sheetData.sheet)) {
    const sheet = sheetData.sheet[key];
    if (sheet.state == 'off') {
      talk_state = true;
      return;
    }
    // console.log(key, sheet, sheet.state);
  }
  talk_state = false;
});

setInterval(() => {
  if (talk_state) {
    var speech = speechs[Math.floor(Math.random() * speechs.length)];
    talk.play(speech, {volume: 50}, () => { console.log(speech); });
  }
}, 10000);
