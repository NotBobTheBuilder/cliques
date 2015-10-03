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
    .when('/cliques/:id/invite', {
      templateUrl: 'invite.html',
      controller: 'InviteController'
    })
    .when('/cliques/:id/', {
      templateUrl: 'clique.html',
      controller: 'CliqueController'
    })
    .otherwise({ redirectTo: '/' });
});

cliques.controller('HomeController', function () {

});

cliques.factory('Clique', function ($resource) {
  return $resource('/api/cliques/:id/:action', {id: '@id'}, {
    create: { method: 'POST', params: { id: 'create'} },
    validate: { method: 'POST', params: { action: 'validate' } },
    invite: { method: 'POST', params: { action: 'invite'}}
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
      .catch(function(error) {
        $scope.error = error;
      })
      .finally(function() {
        $scope.loading = false;
      })
  }
});

cliques.controller('ValidateController', function ($scope, $location, $routeParams, Clique) {
  $scope.validate = {id: $routeParams.id};
  $scope.loading = false;

  $scope.submit = function() {
    console.log($scope.validate);
    $scope.loading = true;
    Clique.validate($scope.validate).$promise
      .then(function(data) {
        $location.path('/cliques/' + $routeParams.id + '/invite');
      })
      .catch(function(error) {
        $scope.error = error.error;
      })
      .finally(function() {
        $scope.loading = false;
      })
  }
});

cliques.controller('InviteController', function ($scope, $location, $routeParams, Clique) {
  $scope.loading = false;

  $scope.submit = function() {
    $scope.loading = true;
    Clique.invite({
      id: $routeParams.id,
      numbers: $scope.rawNumbers.split("\n")
    }).$promise
      .then(function(data) {
        $location.path('/cliques/' + $routeParams.id + '/');
      })
      .catch(function(error) {
        $scope.error = error.error;
      })
      .finally(function() {
        $scope.loading = false;
      });
  }
});

cliques.controller('CliqueController', function () {

});
