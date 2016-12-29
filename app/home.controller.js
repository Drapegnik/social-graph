'use strict';

/**
 * Created by Drapegnik on 22.12.16.
 */

vkGraphApp.controller('HomeCtrl', ['$location', 'Graph', 'Vk', function($location, Graph, Vk) {
    const tokenRegEx = /access_token=(.*)&expires_in/;
    const userIdRegEx = /&user_id=(.*)/;

    if ($location.$$hash.match(tokenRegEx)) {
        var token = $location.$$hash.match(tokenRegEx)[1];
        var userId = parseInt($location.$$hash.match(userIdRegEx)[1]);

        console.log('Successfully login into vk!');
        Vk.getGraphData(token, userId, Graph.draw);
    }
}]);
