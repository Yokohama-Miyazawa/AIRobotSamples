const mecab_parser = require('./mecab-parser');

//名詞だけを抜き出し
function joinNoun(a)
{
  var r = {
    net: [],
    form: [],
    text: [],
  };
  a.form.forEach( (v,i) => {
    if (v[0] == '@') {
      r.net.push(a.net[i]);
      r.form.push(a.form[i]);
      r.text.push(a.text[i]);
    }
  })
  return r;
}

function parseMatch(sentense, callback) {
  mecab_parser(sentense, (err, result) => {
    const r = {
      net:[],
      form:[],
      text:[],
    }
    var step = 0;
    result.net.form.forEach( (v, i) => {
      switch(step) {
        case 0:
          if (v == '@[') {
            step = 1;
          } else
          if (v == '=') {
            r.net.push([])
            r.form.push('(last)')
            r.text.push('...')
            r.net.push(result.net.net[i]);
            r.form.push(result.net.form[i]);
            r.text.push(result.net.text[i]);
          } else {
            r.net.push(result.net.net[i]);
            r.form.push(result.net.form[i]);
            r.text.push(result.net.text[i]);
          }
        case 1:
          if (v == '@]') {
            r.net.push([])
            r.form.push('(subject)')
            r.text.push('...')
            step = 0;
          } else {
          }
          break;
      }
    })
    callback(null, r.form.join(''))
  });
}

function matchSubject(utterList, result, callback) {
  var n=0;
  function nextUtter() {
    if (n >= utterList.length) {
      callback(null, null, null, false);
      return;
    }
    const key = utterList[n][0];
    const utters = utterList[n][1];
    n++;
    var c=0;
    function _matchSubject(key) {
      if (c >= utters.length) {
        //callback(null, null, null, true);
        nextUtter();
        return;
      }
      const utter = utters[c];
      c++;
      parseMatch(utter, (err, utter) => {
        var ret = result.match(utter);
        if (ret) {
          callback(null, key, ret, true);
          return;
        }
        _matchSubject(key);
      });
    }
    _matchSubject(key);
  }
  nextUtter();
}

module.exports = function(sentense, utters, callback) {
  mecab_parser(sentense, (err, result) => {
    if (err) {
      callback(err, {
        subject: null,
        intent: 'error',
        match: false,
      });
      return;
    }
    matchSubject(utters, result, (err, key, ret, match) => {
      if (ret) {
        try {
          var noun = joinNoun(ret.subject.net).text.join('');
          callback(null, {
            subject: noun,
            intent: key,
            match: match,
          });
        } catch(err) {
          callback(null, {
            subject: null,
            intent: key,
            match: match,
          });
        }
      } else {
        callback(null, {
          subject: null,
          intent: '',
          match: match,
        });
      }
      return;
    });
  });
}
