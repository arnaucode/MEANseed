'use strict';

angular.module('app.login', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/login', {
    templateUrl: 'views/login/login.html',
    controller: 'LoginCtrl'
  });
}])

.controller('LoginCtrl', function($scope, $http, $routeParams) {
    $scope.user = {};
    $scope.doLogin = function() {
      console.log('Doing login', $scope.user);

      $http({
          url: urlapi + 'login',
          method: "POST",
          data: $scope.user
      })
      .then(function(response) {
              console.log("response: ");
              console.log(response.data);
              if (response.data.success == true)
              {
                  localStorage.setItem("meanseed_token", response.data.token);
                  localStorage.setItem("meanseed_userdata", JSON.stringify(response.data.user));
                  window.location.reload();
              }else{
                  console.log("login failed");
              }


      },
      function(response) { // optional
              // failed
              console.log(response);
      });

    };
});
