var express = require('express'),
    bodyParser = require('body-parser'),
    app = express(),
    twilio = require('twilio'),
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

app.post('/cliques/create', function (req, res) {
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
  } else {
    res.status(400).json({"error": "Missing properties: all of clique, name, and phone are required"});
  }
});

app.post('/cliques/:id/validate', function (req, res) {
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

app.get('/debug', function (req, res) {
  res.status(200).json(db);
});

app.listen(port, function () {
  console.log('now listening on port ' + port);
});
