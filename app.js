'use strict';

/**
 * Created by Drapegnik on 22.12.16.
 */

const tokenRegEx = /#access_token=(.*)&expires_in/;
const userIdRegEx = /&user_id=(.*)/;

var token = window.location.hash.match(tokenRegEx)[1];
var userId = window.location.hash.match(userIdRegEx)[1];

var getFriends = function(id) {
    console.log('Loading friends for ' + id + '...');

    $.ajax('/getFriends', {
        type: 'POST',
        success: function(friends) {
            console.log(friends);
        },
        error: function(err) {
            console.error(err);
        },
        data: {
            token: token,
            userId: id
        }
    });
};

if (token && userId) {
    console.log('Successfully login into vk!');
    $('#message').text('Hello!');
    getFriends(userId);
}