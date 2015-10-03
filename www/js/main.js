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

cliques.controller('CliqueController', function ($scope, ArcGISMap) {
  var pusher = new Pusher('bc1eb4a3db0243829910');
  var channel = pusher.subscribe('private-channel');

  channel.bind('client-location', function (data) {
    ArcGISMap.addPoint(data.longitude, data.latitude);
  });

  channel.bind('pusher:subscription_succeeded', function() {
    window.navigator.geolocation.getCurrentPosition(
      function locationSuccess(loc) {
        console.log('success');
        console.log(loc);
        var lat = loc.coords.latitude;
        var long = loc.coords.longitude;
        var triggered = channel.trigger('client-location', { latitude: lat, longitude: long });
        ArcGISMap.centerAt(long, lat);
        ArcGISMap.addPoint(long, lat, '#FF0000');
      }, function locationFail(err) {
        console.log('fail');
        console.error(loc);
      }
    );
  });
});

cliques.factory('ArcGISMap', function() {
  var API = {};

  require([
    "esri/map",
    "esri/graphic",
    "esri/layers/GraphicsLayer",
    "esri/geometry/Point",
    "esri/symbols/SimpleMarkerSymbol",
    "dojo/domReady!"
  ], function(Map, Graphic, GraphicsLayer, Point, SimpleMarkerSymbol) {
    var map = new Map("map", {
      basemap: "topo",
      center: [-1.8880454000000002,52.4770727], // longitude, latitude
      zoom: 17
    });

    API.addPoint = function(long, lat, colour) {
      var locationLayer = new GraphicsLayer();
      var point = new Point(long, lat);
      var symbol = new SimpleMarkerSymbol().setColor(colour || "#1036DE").setSize(14);
      var graphic = new Graphic(point, symbol);
      locationLayer.add(graphic);
      map.addLayer(locationLayer)  // Makes sure that map is loaded
    };

    API.centerAt = function(long, lat) {
      map.centerAt(new Point(long, lat));
    };
  });

  return API;
})
