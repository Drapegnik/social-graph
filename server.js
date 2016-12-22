'use strict';

/**
 * Created by Drapegnik on 22.12.16.
 */

var connect = require('connect');
var serveStatic = require('serve-static');
var bodyParser = require('body-parser');
var http = require('http');
var send = require('connect-send-json');
var redirect = require('connect-redirection');

var api = require('./api');

var app = connect();
app.use(bodyParser());
app.use(serveStatic(__dirname));
app.use(send.json());
app.use(redirect());

// app.use('/auth/callback', api.authCallback);
app.use('/auth', api.auth);
app.use('/getFriends', api.getFriends);


app.use(function onError(err, req, res, next) {
    console.error(err);
});

http.createServer(app).listen(3000, function() {
    console.log('Server start on http://local.host:3000');
});