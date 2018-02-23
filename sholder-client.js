const request = require('request');
const EventEmitter = require('events');
const config = require('./config');
const app = require('express')()
const server = require('http').Server(app);
const io = require('socket.io')(server);
const bodyParser = require('body-parser');
const spawn = require('child_process').spawn;
const path = require('path');
const speech = (() => (process.env['SPEECH'] === 'off') ? (new EventEmitter()) : require('./speech'))();
const talk = require('./talk');
const exec = require('child_process').exec;

const speech_volume = 10; // 音声読み上げのボリューム

speech.recording = false;

app.use(bodyParser.json({ type: 'application/json' }))

const gpioSocket = (function() {
  const io = require('socket.io-client');
  return io('http://localhost:3091');
})();

gpioSocket.on('button', (payload) => {
  if(payload.level == 0){
    if (speech.recording == true){
      speech.recording = false;
      console.log("音声入力OFF");
    }else{
      speech.recording = true;
      console.log("音声入力ON");
    }
  }
  // io.emit('button', payload);
});

speech.on('data', function(data) {
  console.log(data);
  if (data === "シャットダウン") {
    var message = "シャットダウンします．ピーという音が鳴ってから30秒後に，本体外部のスイッチをオフにしてください．ピーーー．";
    console.log(message);
    speech.recording = false;
    talk.play(message,
              {volume: speech_volume}, () => {
                exec('sudo shutdown -h now', (err, stdout, stderr) => {});
            });
  } else {
  var options = { uri: config.sholder.server_uri,
                  body: JSON.stringify({message: data}),
                  headers: {'content-type': 'application/json'}
                };
  request.post(options, function (err, res) { var result = JSON.parse(res.body);
	                                            console.log(result);
	                                            speech.recording = false;
	                                            talk.play(result.message,
                                                        { volume: speech_volume, }, () => { speech.recording = true;
					                                                                       console.log('SAID.');
					                                            });
	                                            console.log('DONE.');
                                            });
  }
});

function speech_to_text(payload, callback) {
  var done = false;

  if (payload.timeout != 0) {
    setTimeout(() => {
      if (!done) {
        speech.recording = false;
        if (callback) callback(null, '[timeout]');
        speech.removeListener('data', listener);
      }
      done = true;
    }, payload.timeout);

    speech.recording = true;
  }

  function listener(data) {
    if (!done) {
      speech.recording = false;
      if (callback) callback(null, data);
      speech.removeListener('data', listener);
    }
    done = true;
  }

  speech.on('data', listener);
}

server.listen(3090, () => { console.log('Example app listening on port 3090!'); 
                            var message = "起動しました．音声入力をオンにするには，本体横のボタンを押してください．";
                            console.log(message);
                            speech.recording = false;
                            talk.play(message, {volume: speech_volume}, () => {});
            })
