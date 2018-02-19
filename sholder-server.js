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
  /*
  const io = require('socket.io-client');
  const socket = io('http://sanae.local:3090');
  socket.emit('docomo-chat',
	      {message: data, voice: 'reimu', volume: '100', tone: 'kansai_dialect', silence: false,},
	      function () { console.log('DONE.'); }
	     );
  */
  var options = { uri: "http://sanae.local:1880/sholder-server", 
	          body: JSON.stringify({source: "marisa.local:3090", message: data}), 
	          headers: {'content-type': 'application/json'}
                };
  request.post(options, function (err, res) { var result = JSON.parse(res.body);
	                                      console.log(result);
	                                      speech.recording = false;
	                                      talk.play(result.message, {
					        volume: 10,
					      }, () => {
						speech.recording = true;
					        console.log('SAID.');
					      });
	                                      console.log('DONE.'); 
                                            });
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

server.listen(3090, () => console.log('Example app listening on port 3090!'))
