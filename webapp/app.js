'use strict';

var urlapi = "http://localhost:3000/api/";

// Declare app level module which depends on views, and components
angular.module('MEANseed', [
  'ngRoute',
  'ngMessages',
  'angularBootstrapMaterial',
  'app.navbar',
  'app.signup',
  'app.login',
  'app.main',
  'app.user'
]).
config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
  $locationProvider.hashPrefix('!');

  //$routeProvider.otherwise({redirectTo: '/main'});
  if((localStorage.getItem('meanseed_token')))
    {
      console.log(window.location.hash);
      if((window.location.hash==='#!/login')||(window.location.hash==='#!/signup'))
      {
        window.location='#!/main';
      }

      $routeProvider.otherwise({redirectTo: '/main'});
    }else{
      if((window.location!=='#!/login')||(window.location!=='#!/signup'))
      {
        console.log('app, user no logged');

        localStorage.removeItem('meanseed_token');
        localStorage.removeItem('meanseed_userdata');
        window.location='#!/login';
        $routeProvider.otherwise({redirectTo: '/login'});
      }
    }
}])

.factory('httpInterceptor', function httpInterceptor () {
  return {
    request: function(config) {
      return config;
    },

    requestError: function(config) {
      return config;
    },

    response: function(res) {
      return res;
    },

    responseError: function(res) {
      return res;
    }
  };
})
.factory('api', function ($http) {
	return {
		init: function () {
      $http.defaults.headers.common['X-Access-Token'] = localStorage.getItem('meanseed_token');
      $http.defaults.headers.post['X-Access-Token'] = localStorage.getItem('meanseed_token');
		}
	};
})
.run(function (api) {
	api.init();
});
