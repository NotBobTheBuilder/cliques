var cliques = angular.module('cliques', ['ngRoute', 'ngResource', 'templates']);

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
    .when('/cliques/:id/validate', {
      templateUrl: 'validate.html',
      controller: 'ValidateController'
    })
    .when('/cliques/invite/accept/:token', {
      templateUrl: 'accept_invite.html',
      controller: 'AcceptInviteController'
    })
    .otherwise({ redirectTo: '/' });
});

cliques.controller('HomeController', function () {

});

cliques.factory('Clique', function ($resource) {
  return $resource('/api/cliques/:id/:action', {}, {
    create: { method: 'POST', params: { id: 'create'} },
    validate: { method: 'POST', params: { action: 'validate' } }
  });
});

cliques.controller('CreateController', function ($scope, $location, Clique) {
  $scope.clique = {};
  $scope.loading = false;

  $scope.submit = function() {
    $scope.loading = true;
    Clique.create($scope.clique).$promise
      .then(function(data) {
        $location.path('/cliques/' + data.id + '/validate');
      })
      .catch(function() {

      })
      .finally(function() {
        $scope.loading = false;
      })
  }
});

cliques.controller('ValidateController', function () {

});

cliques.controller('AcceptInviteController', function () {

});
