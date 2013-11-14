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
})

.directive('focusMe', function($timeout, $parse) {
  return {
    //scope: true,   // optionally create a child scope
    link: function(scope, element, attrs) {
      var model = $parse(attrs.focusMe);
      scope.$watch(model, function(value) {
        if(value === true) {
          $timeout(function() {
            element[0].focus();
          });
        }
      });
      // to address @blesh's comment, set attribute value to 'false'
      // on blur event:
      //element.bind('blur', function() {
        //scope.$apply(model.assign(scope, false));
      //});
    }
  };
});

;
