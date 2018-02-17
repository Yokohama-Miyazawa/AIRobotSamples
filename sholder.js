const EventEmitter = require('events');
// const app = require('express')()
// const server = require('http').Server(app);
// const io = require('socket.io')(server);
// const bodyParser = require('body-parser')
const config = require('./config');
const spawn = require('child_process').spawn;
const path = require('path');
const speech = (() => (process.env['SPEECH'] === 'off') ? (new EventEmitter()) : require('./speech'))();

speech.recording = false;

// app.use(bodyParser.json({ type: 'application/json' }))
// app.use(bodyParser.raw({ type: 'application/*' }))

/*
app.post('command', (req, res) => {
  res.send('OK');
});
*/

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

/*
function execSoundCommand(payload) {
  const base = `${process.env.HOME}/Sound`;
  const p = path.normalize(path.join(base, payload.sound));
  if (p.indexOf(base) == 0) {
    console.log(`/usr/bin/aplay ${p}`);
    const _playone = spawn('/usr/bin/aplay', [p]);
    _playone.on('close', function(code) {
      console.log('close', code);
    });
  }
}
*/

/*
function execLedCommand(payload) {
  gpioSocket.emit('led-command', payload);
}
*/

/*
app.post('/command', (req, res) => {
  if (req.body.type === 'led') {
    execLedCommand(req.body);
  }
  if (req.body.type === 'sound') {
    execSoundCommand(req.body);
  }
  res.send('OK');
})
*/

speech.on('data', function(data) {
  const io = require('socket.io-client');
  const socket = io('http://sanae.local:3090');
  console.log(data);
  socket.emit('docomo-chat',
	      {message: data, voice: 'reimu', volume: '100', tone: 'kansai_dialect', silence: false,},
	      function () { console.log('DONE.'); /*process.exit();*/ }
	     );
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

/*
io.on('connection', function (socket) {
  socket.on('disconnect', function () {
    speech.recording = false;
    console.log('disconnect');
  });
  socket.on('led-command', (payload, callback) => {
    execLedCommand(payload);
    if (callback) callback();
  })
  socket.on('sound-command', (payload, callback) => {
    execSoundCommand(payload);
    if (callback) callback();
  })
  socket.on('speech-to-text', function (payload, callback) {
    try {
      speech_to_text({
        timeout: (typeof payload.timeout === 'undefined') ? 30000 : payload.timeout,
      }, (err, data) => {
        if (callback) callback(data);
      });
    } catch(err) {
      console.error(err);
    }
  });
  socket.on('stop-speech-to-text', function (payload, callback) {
    speech.emit('data', 'stoped');
    if (callback) callback('OK');
  });
})
*/

// server.listen(3090, () => console.log('Example app listening on port 3090!'))
