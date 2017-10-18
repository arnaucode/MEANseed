'use strict';

angular.module('app.user', ['ngRoute'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/user/:userid', {
            templateUrl: 'views/user/user.html',
            controller: 'UserCtrl'
        });
    }])

    .controller('UserCtrl', function($scope, $http, $routeParams) {
        $scope.user = {};
        $http.get(urlapi + 'users/id/' + $routeParams.userid)
            .then(function(data, status, headers, config) {
                console.log('data success');
                console.log(data);

                $scope.user = data.data;
            }, function(data, status, headers, config) {
                console.log('data error');
            });
    });
