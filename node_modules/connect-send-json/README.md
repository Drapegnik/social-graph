connect-send-json
=================

Adds the `response.json()` middleware to connect and connect-like http stacks.

Usage
=====

```javascript
'use strict';

var connect = require('connect')
  , app = connect()
  , send = require('connect-send-json')
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

module.exports = app;
```
