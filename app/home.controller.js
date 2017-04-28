'use strict';

/**
 * Created by Drapegnik on 22.12.16.
 */

angular.module('vkGraphApp').controller('HomeCtrl', ['$scope', '$http', '$location', 'Graph', 'Vk',
    function($scope, $http, $location, Graph, Vk) {

        var tokenRegEx = /access_token=(.*)&expires_in/;
        var userIdRegEx = /&user_id=(.*)/;

        $scope.auth = false;

        if ($location.$$hash.match(tokenRegEx)) {
            $scope.token = $location.$$hash.match(tokenRegEx)[1];
            $scope.userId = parseInt($location.$$hash.match(userIdRegEx)[1]);
            $scope.auth = true;

            console.log('Successfully login into vk!');
            Vk.getGraphData($scope.token, $scope.userId, Graph.draw);
        }
    }]);