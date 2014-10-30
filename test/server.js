var express = require('express');
var app = express();

app.get('/repos/itsjoesullivan/tik/issues', function(req, res) {
  res.json([
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
    }
  ]);
});

app.listen(4040);
