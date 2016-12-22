'use strict';

module.exports.json = function (opts) {
  opts = opts || {};

  function sendResponse(data) {
    /*jshint validthis:true*/
    var res = this
      , space = ''
      , replacer = null
      ;

    if (!res) {
      throw new Error('You called `json()`, detatched send from the response object');
    }

    if (data) {
      res.setHeader('Content-Type', 'application/json');
      if (opts.debug) {
        space = '  ';
      }
      data = JSON.stringify(data, replacer, space);
    } else {
      data = undefined;
    }

    res.end(data);
  }

  function attach(req, res, next) {
    if (!res.json) {
      res.json = sendResponse;
    }
    if (!res.send) {
      res.send = sendResponse;
    }
    next();
  }

  return attach;
};
