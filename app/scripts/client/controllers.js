'use strict';

angular.module( 'fAct.client', [
])

.config(function config( $routeProvider ) {
  $routeProvider
    .when( '/clients', {
      controller: 'ClientsCtrl',
      templateUrl: 'scripts/client/templates/clients.tpl.html',
      resolve: { user: ['Fire', function(Fire) { return Fire.auth(); }] }
    })
    .when( '/clients/:id', {
      controller: 'ClientCtrl',
      templateUrl: 'scripts/client/templates/client.tpl.html',
      resolve: { user: ['Fire', function(Fire) { return Fire.auth(); }] }
    })
    ;
})

.controller( 'ClientsCtrl', function ClientsCtrl( $scope, Fire ) {
  $scope.clients = null;
  Fire.collection('clients').then(function(clients) {
    $scope.clients = clients;
  });
})

.controller( 'ClientCtrl', function ClientCtrl( $scope, $routeParams, Fire, Flash, multi ) {

  if ($routeParams.id === 'new') {
    $scope.client = Fire.create("clients");
  } else {
    Fire.get('clients', $routeParams.id).then(function(client) {
      $scope.client = client;
      Fire.collection('invoices').then(function(invoices) {
        $scope.invoices = invoices.filter(function(invoice) {
          return invoice.object.client.id === client.id;
        });
      });
    }, function(err) {
      Flash.error('Client not found', '/clients');
    });
  }

  multi.addTemplates({
    'emails': { "name": "", "value": "" },
    'phones': { "name": "", "value": "" },
    'addresses': { "name": "", "value": "" },
    'contacts': { "name": "" }
  });
  $scope.add = multi.add;
  $scope.remove = multi.remove;

  $scope.save = function(client) {
    Fire.save(client).then(function(clid) {
      Flash.success("Client enregistré avec succès", "/clients/" + clid);
    }, function(err) {
      Flash.error("Error " + err);
    });
  }

})

;
