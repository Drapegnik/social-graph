'use strict';

var connect = require('connect')
  , app = connect()
  , send = require('./index')
  , port = 8070
  ;

app
  .use(send.json())
  .use(function (req, res) {
    res.statusCode = 501;
    res.json({
      error: { message: "Not Implemented" }
    });
  })
  ;

app.listen(port, function () {
  console.log('Listening on http://localhost:' + port);
});
