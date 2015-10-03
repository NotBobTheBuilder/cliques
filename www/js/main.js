var cliques = angular.module('cliques', ['ngRoute', 'templates']);

cliques.config(function($routeProvider) {
  $routeProvider
    .when('/', {
      templateUrl: 'home.html',
      controller: 'HomeController'
    })
    .when('/cliques/create', {
      templateUrl: 'create.html',
      controller: 'CreateController'
    })
    .when('/cliques/invite/accept/:token', {
      templateUrl: 'accept_invite.html',
      controller: 'AcceptInviteController'
    })
    .otherwise({ redirectTo: '/' });
});

cliques.controller('HomeController', function () {

});

cliques.controller('CreateController', function () {

});

cliques.controller('AcceptInviteController', function () {

});
