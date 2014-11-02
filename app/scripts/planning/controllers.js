'use strict';

angular.module( 'fAct.planning', [
  'colorpicker.module'
])

.config(function config( $routeProvider ) {
  $routeProvider
    .when( '/planning/:date?', {
      controller: 'PlanningCtrl',
      templateUrl: 'scripts/planning/templates/planning.tpl.html',
      resolve: { user: ['Fire', function(Fire) { return Fire.auth(); }] }
    })
    ;
})

.controller( 'PlanningCtrl', function PlanningCtrl( $scope, $routeParams, $timeout, Fire, Flash, config ) {

  var date = moment($routeParams.date || moment().format('YYYY-MM-DD'));
  date = date.day(date.day() ? 1 : -6); // sunday = 0
  $scope.range = [];
  $scope.lastweek = date.clone().day(-6).format('YYYY-MM-DD');
  $scope.nextweek = date.clone().day(8).format('YYYY-MM-DD');
  for (var i = 0; i < 6; i++) {
    $scope.range.push([]);
    for (var j = 0; j < 7; j++) {
      $scope.range[i].push(date.format('YYYY-MM-DD'));
      date.add('days', 1);
    }
  }

  $scope.tasks = {};
  Fire.live('planning', 'tasks', function (tasks) {
    $timeout(function() {
      _.forEach(config.planning.users || [], function (user) {
        if (!tasks.object[user]) tasks.object[user] = {};
      });
      $scope.tasks = tasks;
    });
  }, function () {
    var tasks = {};
    _.forEach(config.planning.users || [], function(user) { tasks[user] = {} });
    $scope.tasks = Fire.create('planning', tasks, 'tasks');
  });

  $scope.projectsEvents = {
    // '2014-04-14': {
    //   'myreport@centile': 'Ceci est un évenement'
    // }
  }

/*
  Fire.get('planning', 'tasks').then(function(tasks) {
    _.forEach(config.planning.users || [], function (user) {
      if (!tasks.object[user]) tasks.object[user] = {};
    });
    $scope.tasks = tasks;
  }, function (err) {
    var tasks = {};
    _.forEach(config.planning.users || [], function(user) { tasks[user] = {} });
    $scope.tasks = Fire.create('planning', tasks, 'tasks');
  });
*/

  $scope.projects = {};
  Fire.get('planning', 'projects').then(function(projects) {
    $scope.projects = projects;
    var first = true;
    $scope.$watch('projects.object', function () {
      if ($scope.projects.url) {
        if (!first) save($scope.projects, true);
        first = false;
      }
    }, true);

    _.forEach($scope.projects.object, function (proj, projname) {
      if (proj.events) {
        _.forEach(proj.events, function (evt, date) {
          if (!$scope.projectsEvents[date]) {
            $scope.projectsEvents[date] = {};
          }
          $scope.projectsEvents[date][projname] = evt;
        });
      }
    });


  });

  $scope.selected = {};

  $scope.select = function (user, date, period) {
    var key = user+'||'+date+period;
    $scope.selected[key] = $scope.selected[key] ? false : true;
    if (!$scope.selected[key]) delete $scope.selected[key];
  };

  $scope.projectColor = function (name) {
    if ($scope.projects && $scope.projects.object && $scope.projects.object[name] && $scope.projects.object[name].color) return $scope.projects.object[name].color;
    return '#FF0000';
  };

  $scope.color = function (user, date, period) {
    var task = $scope.tasks.object[user][date + period];
    if (!task) return;
    if (task[0] === ':') return $scope.projectColor(task.replace(/^:/, ''));
    return 'transparent';
  };

  $scope.style = function (user, date, period) {
    var task = $scope.tasks.object[user][date + period];
    if (!task || task[0] === ':') return;
    return 'custom';
  };

  $scope.updateSelected = function (project) {
    var selected = _.keys($scope.selected);
    selected.forEach(function (item) {
      var splitted = item.split('||');
      if (!project) delete $scope.tasks.object[splitted[0]][splitted[1]];
      else $scope.tasks.object[splitted[0]][splitted[1]] = project;
      delete $scope.selected[item];
    });
    if (selected.length) save($scope.tasks);
  };

  $scope.addAndUpdate = function (form) {
    if (form.$invalid) return;
    if ($scope.entry[0] === ':') { // create new project
      var project = $scope.entry.replace(/^:/, '');
      if (!$scope.projects.object[project]) {
        $scope.projects.object[project] = { 'color': 'red' }; // choose color
        save($scope.projects);
      }
    }
    $scope.updateSelected($scope.entry);
    $scope.entry = '';
  };

  var save = function(item, noflash) {
    Fire.save(item).then(function() {
      if (!noflash) Flash.success("Enregistré");
    }, function(err) {
      Flash.error("Error " + err);
    });
  };

})

.filter('project', function () {

  return function (input) {
    if (!input) return '';
    return input.replace(/^:/, '');
  };

})

.filter('empty', function () {

  return function (input) {
    return !input || _.isEmpty(input);
  };

})

.directive('stopEvent', function () {
  return {
    restrict: 'A',
    link: function (scope, element, attr) {
      element.bind(attr.stopEvent, function (e) {
        e.stopPropagation();
      });
    }
  };
})

;