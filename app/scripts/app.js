'use strict';

angular.module('fAct.app', [
  'ngRoute',
  'toaster',
  'fAct.services',
  'fAct.filters',
  'fAct.directives',
  'fAct.home',
  'fAct.invoice',
  'fAct.client'
])

.value({
  config: {
    FirebaseUrl: '@@FIREBASE_URL',
    vats: [19.6, 7, 20, 10],
    dueDate: function(date) { return moment(date).add('days', 30).valueOf(); },
    financialYear: 2013,
    company: {
      address: '2 quai André Rhuys\n44200 Nantes',
      logo: 'images/lmtm.png'
    },
    invoice: {
      payment: "Chèque ou virement",
      footer: "En cas de retard de paiement, seront exigibles, conformément à l'article L 441­6 du code de commerce, une indemnité calculée sur la base de trois fois le taux de l'intérêt légal en vigueur ainsi qu'une indemnité forfaitaire pour frais de recouvrement de 40 euros.\n<strong>LMTM</strong> : SARL au capital social de 5 000 € ­ RCS NANTES B 791 143 258 ­ n° TVA FR30791143258"
    }
  }
})

.config(function ($routeProvider) {
  $routeProvider.otherwise({ redirectTo: '/' });
})

.controller( 'MainCtrl', function MainCtrl( $rootScope, $scope, $location, Flash, Fire ) {

  $scope.isActive = function(route) {
    return route === $location.path().split('/').slice(0, 2).join('/');
  }

  $scope.$on('$routeChangeStart', function(next, current) {
    Flash.pop();
  });

  $scope.logout = function() {
    Fire.logout().then(function() {
      $rootScope.user = null;
    }, function(error) {
      alert(error);
    });
  }

  $scope.sorter = Fire.sorter;
  $scope.finder = Fire.finder;

})

;
