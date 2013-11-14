'use strict';

angular.module( 'fAct.invoice', [
  'ngSanitize'
])

.config(function config( $routeProvider ) {
  $routeProvider
    .when( '/invoices', {
      controller: 'InvoicesCtrl',
      templateUrl: 'scripts/invoice/templates/invoices.tpl.html',
      resolve: { user: ['Fire', function(Fire) { return Fire.auth(); }] }
    })
    .when( '/clients/:clid/invoices/new', {
      controller: 'InvoiceCtrl',
      templateUrl: 'scripts/invoice/templates/invoice.tpl.html',
      resolve: { user: ['Fire', function(Fire) { return Fire.auth(); }] }
    })
    .when( '/invoices/:id', {
      controller: 'InvoiceCtrl',
      templateUrl: 'scripts/invoice/templates/invoice.tpl.html',
      resolve: { user: ['Fire', function(Fire) { return Fire.auth(); }] }
    })
    .when( '/invoices/:id/print', {
      controller: 'PrintCtrl',
      templateUrl: 'scripts/invoice/templates/print.tpl.html',
      resolve: { user: ['Fire', function(Fire) { return Fire.auth(); }] }
    })
    ;
})

.controller( 'InvoicesCtrl', function InvoicesCtrl( $scope, $location, Fire, Flash ) {
  $scope.invoices = null;
  Fire.collection('invoices').then(function(invoices) {
    $scope.invoices = invoices;
    _.forEach(invoices, function(i) { i.object.populate(); })
  });
  $scope.new = function() {
    Flash.push("Selectionnez un client à facturer");
    $location.path("/clients");
  }
})

.controller( 'PrintCtrl', function PrintCtrl( $scope, $routeParams, Fire, config ) {
  $scope.config = config;
  Fire.get('invoices', $routeParams.id).then(function(invoice) {
    invoice.object.populate().then(function(client) {
      $scope.client = client;
    });
    $scope.invoice = invoice;
  });

})

.controller( 'InvoiceCtrl', function InvoiceCtrl( $scope, $routeParams, Fire, Flash, config, multi ) {

  $scope.vats = config.vats;

  if ($routeParams.clid) {
    Fire.get('clients', $routeParams.clid).then(function(client) {
      $scope.client = client;
      $scope.invoice = Fire.create("invoices", { "vat": config.vats[0], "client": { "id": $routeParams.clid } });
    }, function(err) {
      Flash.error("Client non trouvé", '/clients');
    });
  } else {
    Fire.get('invoices', $routeParams.id).then(function(invoice) {
      invoice.object.populate().then(function(client) {
        $scope.client = client;
      });
      $scope.invoice = invoice;
    });
  }

  multi.addTemplates({
    'lines': { "item": "", "price": 0.0, "quantity": 1 },
    'payments': { "amount": 0.0, "date": Date.now(), "informations": "" }
  });
  $scope.add = multi.add;
  $scope.remove = multi.remove;

  $scope.changeContact = function(value) {
    $scope.invoice.object.contact = value;
  }

  $scope.changeAddress = function(value) {
    $scope.invoice.object.address = value;
  }

  $scope.$watch('invoice.object.client.contact', function(nv) {
    if ($scope.invoice && !$scope.invoice.object.contact) $scope.invoice.object.contact = nv;
  });

  $scope.$watch('invoice.object.client.address', function(nv) {
    if ($scope.invoice && !$scope.invoice.object.address) $scope.invoice.object.address = nv;
  });

  $scope.save = function(invoice) {
    if (!invoice.object.financialYear) invoice.object.financialYear = config.financialYear;
    Fire.save(invoice).then(function(invid) {
      Flash.success("Facture enregistrée avec succès", "/invoices/" + invid);
    }, function(err) {
      Flash.error("Error " + err);
    });
  }

  $scope.delete = function(invoice) {
    Fire.delete(invoice).then(function() {
      Flash.success("Facture supprimée", "/invoices");
    }, function(err) {
      Flash.error("Error " + err);
    });
  }

  $scope.open = function(invoice) {
    invoice.object.open().then(function(i) {
      $scope.save(invoice);
    });
  }

})

;
