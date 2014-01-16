angular.module('fAct.filters', [
])

.filter('list', function() {
  return function(item, key) {
    var items = item[key] || [];
    return items.map(function(e) { return e.value || e.name; }).join(', ');
  }
})

.filter('total', function() {
  return function(list, method) {
    method = method || 'getPrice';
    return _.reduce(list, function(pv, cv) { return pv + cv.object[method](); }, 0);
  }
})

.filter('toArray', function() {
  return function(str) {
    if (!str) return [];
    return str.split(/\r?\n/);
  }
})
