'use strict';

/**
 * Created by Drapegnik on 22.12.16.
 */

var express = require('express');
var bodyParser = require('body-parser');

var api = require('./api');

var app = express();
app.set('view engine', 'ejs');
app.set('views', __dirname);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use('/', express.static(__dirname));

app.use('/api/getRecommendation/:userId', api.getRecommendation);
app.use('/api/auth', api.auth);
app.use('/api/getUser', api.getUser);
app.use('/api/getFriends', api.getFriends);
app.use('/api/getMutual', api.getMutual);
app.use('/home', api.home);
app.use('/', api.login);

app.use(function onError(err, req, res) {
    console.error(err);
    res.status(err.status || 500);
    res.send(err.message);
});

app.listen(3000, function() {
    console.log('Server start on http://local.host:3000');
});