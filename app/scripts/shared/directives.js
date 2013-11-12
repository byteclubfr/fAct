angular.module('fAct.directives', [
])

.directive('faDate', function() {
  return {
    require: 'ngModel',
    link: function(scope, element, attrs, ctrl) {

      ctrl.$parsers.push(function(date) {
        return moment(date, 'YYYY-MM-DD').valueOf();
      });

      ctrl.$formatters.push(function(date) {
        return moment(date).format('YYYY-MM-DD');
      });
    }
  }
});
