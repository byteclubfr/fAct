'use strict';

angular.module( 'fAct.home', [
])

.config(function config( $routeProvider ) {
  $routeProvider
    .when( '/', {
      controller: 'HomeCtrl',
      templateUrl: 'scripts/home/templates/home.tpl.html',
      resolve: { user: ['Fire', function(Fire) { return Fire.auth(); }] }
    })
    ;
})

.controller( 'HomeCtrl', function HomeCtrl( $scope, Fire, config ) {

  Fire.collection('invoices').then(function(invoices) {

    _.forEach(invoices, function(i) { i.object.populate(); })

    // turnover by month
/*
    _.forEach(invoices, function(i) {
      if (!i.object.num) return;
      if (i.object.financialYear === config.financialYear) $scope.d1.datasets[0].data[moment(i.object.date).month()] += i.object.getPrice();
      else if (i.object.financialYear === config.financialYear - 1) $scope.d1.datasets[1].data[moment(i.object.date).month()] += i.object.getPrice();
    });
    console.log($scope.d1);
*/

  });

})

;
