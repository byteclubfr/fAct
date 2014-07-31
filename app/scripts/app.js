'use strict';

angular.module('fAct.app', [
  'ngRoute',
  'chartjs-directive',
  'toaster',
  'ui.bootstrap',
  'fAct.services',
  'fAct.filters',
  'fAct.directives',
  'fAct.home',
  'fAct.invoice',
  'fAct.client',
  'fAct.planning'
])

.value({
  config: {
    FirebaseUrl: '@@FIREBASE_URL',
    vats: [20, 19.6, 7, 10, 0],
    dueDate: function(date) { return moment(date).add('days', 30).valueOf(); },
    financialYear: 2014,
    company: {
      address: '<strong>LMTM</strong>\n2 quai André Rhuys\n44200 Nantes\n<em>Téléphone</em> 06 14 66 76 41\n<em>Email</em> contact@lmtm.fr',
      logo: 'images/lmtm.png',
      baseline: 'Nous mettons vos idées en applications !',
      identity: '&nbsp;\nSARL au capital social de 5 000 € \nRCS NANTES B 791 143 258\nN° TVA FR30791143258',
      bank: '&nbsp;\n<em>Banque</em> CIC NANTES VOLTAIRE\n<em>RIB</em> 30047 14010 00020700501 90\n<em>IBAN</em> FR76 3004 7140 1000 0207 0050 190\n<em>BIC</em> CMCIFRPP'
    },
    invoice: {
      payment: "Chèque ou virement",
      footer: "En cas de retard de paiement, seront exigibles, conformément à l'article L 441­6 du code de commerce, une indemnité calculée sur la base de trois fois le taux de l'intérêt légal en vigueur ainsi qu'une indemnité forfaitaire pour frais de recouvrement de 40 euros."
    },
    accountingPeriods: [
      { name: '2013/2014', start: new Date(2013, 1, 1), stop: new Date(2014, 8, 30) }
    ],
    planning: {
      users: ['nicolas', 'lilian', 'thomas']
    },
    loginMessage: "Veuillez vous identifier pour accéder à cette application\n(cliquer sur OK pour continuer)",
    loginProvider: "google"
  }
})

.config(function ($routeProvider) {
  $routeProvider.otherwise({ redirectTo: '/' });
})

.controller( 'MainCtrl', function MainCtrl( $rootScope, $scope, $location, Flash, Fire ) {

  $scope.isActive = function(route) {
    return route === $location.path().split('/').slice(0, 2).join('/');
  };

  $scope.$on('$routeChangeStart', function(next, current) {
    Flash.pop();
  });

  $scope.logout = function() {
    Fire.logout().then(function () {
      $rootScope.user = null;
    });
  };

  $scope.sorter = Fire.sorter;
  $scope.finder = Fire.finder;

})

;
