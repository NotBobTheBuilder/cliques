var express = require('express'),
    bodyParser = require('body-parser'),
    staticFiles = express.static('build/www/'),
    app = express(),
    creds = require('./creds.json'),
    twilio = require('twilio')(creds.TWILIO.SID, creds.TWILIO.TOKEN),
    Pusher = require('pusher'),
    pusher = new Pusher({ appId: creds.PUSHER.APP_ID, key: creds.PUSHER.APP_KEY, secret: creds.PUSHER.APP_SECRET });
    db = { cliques: {}, pins: {} },
    plan = 'YOLO',
    port = 7654;

var uuid = (function() {
  var count = 0;
  return function uuid () { return ++count; };
})();

var randomPin = function () {
  //return a random 4 digit pin;
  return (Math.random()*1000000000000000000).toString(36).slice(0,4).toUpperCase();
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use(function (req, res, next) {
  if (/\/^api/.test(req.url) || /\/^pusher/.test(req.url)) {
    next();
  } else {
    console.log('serve static file')
    staticFiles(req, res, next);
  }
})

app.post('/pusher/auth', function(req, res) {
  var socketId = req.body.socket_id;
  var channel = req.body.channel_name;
  var auth = pusher.authenticate(socketId, channel);
  res.send(auth);
});

app.post('/api/cliques/create', function (req, res) {
  if ((typeof req.body.clique + typeof req.body.name + typeof req.body.phone) == "stringstringstring") {
    var id = uuid();
    db.cliques[id] = {
      id: id,
      name: req.body.name,
      validated: false,
      clique: req.body.clique,
      phone: req.body.phone
    };
    db.pins[id] = randomPin();
    res.status(202).send(db.cliques[id]);
    twilio.messages.create({
      body: "Time to verify yourself! Use this pin: " + db.pins[id],
      to: db.cliques[id].phone,
      from: creds.TWILIO.PHONE
    }, function (err, message) { if (err) { console.error(err); } });
  } else {
    res.status(400).json({"error": "Missing properties: all of clique, name, and phone are required"});
  }
});

app.post('/api/cliques/:id/validate', function (req, res) {
  var id = req.params.id;
  var clique;
  if (/^\d+$/.test(req.params.id)) {
    clique = db.cliques[id];
    if (typeof req.body.pin === "string" && req.body.pin.length===4) {
      if (req.body.pin == db.pins[clique.id]) {
        clique.validated = true;
        delete db.pins[clique.id]
        res.status(200).send({clique: clique});
      } else {
        res.status(401).json({"error": "Incorrect PIN"});
      }
    } else {
      res.status(400).json({"error": "Invalid PIN"});
    }
  } else {
    res.status(400).json({"error": "Invalid ID"});
  }
});

app.post('/api/cliques/:id/invite', function(req, res) {
  var id = req.params.id;
  var clique;
  if (/^\d+$/.test(req.params.id)) {
    clique = db.cliques[id];
    if (req.body.numbers instanceof Array && req.body.numbers.every(isTel)) {
      clique.members = req.body.numbers;
      var url = 'https://cliqu.es/#/cliques/' + clique.id + '/';
      req.body.numbers.map(function(n) {
        twilio.messages.create({
          body: "You just joined a clique! To find your group, visit " + url,
          to: db.cliques[id].phone,
          from: creds.TWILIO.PHONE
        }, function (err, message) { if (err) { console.error(err); } });
      });
      res.status(202).send();
    } else {
      res.status(400).json({"error": "Invalid Numbers Array"});
    }
  } else {
    res.status(400).json({"error": "Invalid ID"});
  }
});

app.post('/api/cliques/:id/panic', function(req, res) {
  var id = req.params.id;
  var clique;
  if (/^\d+$/.test(req.params.id)) {
    clique = db.cliques[id];
    var url = 'https://cliqu.es/#/cliques/' + clique.id + '/';
    clique.members.map(function(n) {
      twilio.messages.create({
        body: "Someone has pressed their panic button - please check in to help them find the group. " + url,
        to: db.cliques[id].phone,
        from: creds.TWILIO.PHONE
      }, function (err, message) { if (err) { console.error(err); } });
    });
    res.status(202).send();
  } else {
    res.status(400).json({"error": "Invalid ID"});
  }
})

app.listen(port, function () {
  console.log('now listening on port ' + port);
});

function isTel(n) {
  return /^\+\d+$/.test(n);
}
