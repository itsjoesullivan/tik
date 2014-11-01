var express = require('express');
var app = express();

app.get('/repos/itsjoesullivan/tik/issues/:ticket', function(req, res) {
  if (req.params.ticket === '0') {
    res.status(404).json({
      message: "Not Found"
    });
  } else {
    res.json(require('./dummy_ticket'));
  }
});
app.get('/repos/itsjoesullivan/tik/issues/:ticket/comments', function(req, res) {
  res.json(require('./dummy_comments'));
});

app.get('/repos/itsjoesullivan/tik/issues', function(req, res) {
  var tickets = [ 
    {
      number: 1,
      title: "title",
      user: {
        login: "user",
      },
      labels: [
        {
          name: "label-name",
          color: "#000000"
        }
      ]
    },
    {
      number: 2,
      title: "title",
      user: {
        login: "user",
      },
      labels: [
        {
          name: "label-name",
          color: "#000000"
        }
      ]
    },
    {
      number: 3,
      title: "title",
      user: {
        login: "user",
      },
      labels: [
        {
          name: "label-name",
          color: "#000000"
        }
      ]
    }
  ]
  if (req.query.state === 'all') {
    res.json(tickets);
  } else {
    res.json(tickets.slice(0,2));
  }
});

app.listen(4040);
