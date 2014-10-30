var express = require('express');
var app = express();

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
