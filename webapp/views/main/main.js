'use strict';

angular.module('app.main', ['ngRoute'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/main', {
            templateUrl: 'views/main/main.html',
            controller: 'MainCtrl'
        });
    }])

    .controller('MainCtrl', function($scope, $http) {
        $scope.users = [];
        $scope.loadMorePagination = true;
        $scope.pageUsers = 0;
        $http.get(urlapi + 'users?page=' + $scope.pageUsers)
            .then(function(data) {
                console.log('data success');
                console.log(data);
                $scope.users = data.data;

            }, function(data) {
                console.log('data error');
            });

    });
