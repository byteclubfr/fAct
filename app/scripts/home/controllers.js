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
    var d1 = {};
    _.forEach(invoices, function(i) {
      var month = moment(i.object.date).format('YYYY.MM');
      d1[month] = (d1[month] || 0) + i.object.getPrice();
      // if (!i.object.num) return;
      // if (i.object.financialYear === config.financialYear) $scope.d1.datasets[0].data[moment(i.object.date).month()] += i.object.getPrice();
      // else if (i.object.financialYear === config.financialYear - 1) $scope.d1.datasets[1].data[moment(i.object.date).month()] += i.object.getPrice();
    });
    $scope.d1 = [{
      key: 'turnover by month',
      values: _.map(d1, function (turnover, month) {
        return [month, turnover];
      })
    }];

    $scope.d1 = {
      width : 500,
      height : 200,
      options : {},
      data : [
      {
        value: 30,
        color:"#F7464A"
      },
      {
        value : 50,
        color : "#E2EAE9"
      },
      {
        value : 100,
        color : "#D4CCC5"
      },
      {
        value : 40,
        color : "#949FB1"
      },
      {
        value : 120,
        color : "#4D5360"
      }

      ]
    };


  });

})

;
